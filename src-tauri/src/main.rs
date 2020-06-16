#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod cmd;

use serde_json::{json, Value};
use tauri_async_handler::*;
use std::sync::Arc;
use tokio::{process::{Command, Child}, sync::Mutex, io::{BufReader, AsyncBufReadExt}};
use tauri::api::command::{command_path, binary_command};
use std::process::Stdio;

enum Status {
  Ready,
  Running(Child, String),
}

impl Status {
  fn to_value(&self) -> Value {
    match self {
      Status::Ready => json!({ "status": "ready" }),
      Status::Running(_, _) => json!({ "status": "running" }),
    }
  }
  fn take_output(&mut self) -> Option<String> {
    match self {
      Status::Running(_, s) => Some(std::mem::replace(s, "".to_string())),
      _ => None,
    }
  }
}

fn main() {
  let status = Arc::new(Mutex::new(Status::Ready));

  tauri::AppBuilder::new()
    .async_handler(move |cmd: cmd::Cmd| {
      let status_ref = status.clone();
      async move {
        use cmd::Cmd::*;
        let mut status = status_ref.lock().await;

        Ok(match cmd {
          MyCustomCommand{ argument } => {
            println!("arg {}", argument);
            let world = "world";
            json!({
              "hello": world
            })
          }
          Run { arguments } => {
            let path = command_path(binary_command("lan-play".to_string())?)?;
            println!("path {:?}", path);
            let mut child = Command::new(path)
              .args(arguments)
              .stdout(Stdio::piped())
              .stderr(Stdio::piped())
              .kill_on_drop(true)
              .spawn()?;
            let mut stdout = BufReader::new(child.stdout.take().unwrap());
            let mut stderr = BufReader::new(child.stderr.take().unwrap());
            let status_ref = status_ref.clone();
            let status_ref2 = status_ref.clone();
            tokio::spawn(async move {
              loop {
                let mut out = String::new();
                if let Err(_) = stdout.read_line(&mut out).await {
                  break
                }
                match &mut *status_ref.lock().await {
                  Status::Running(_, output) => { output.push_str(&out) },
                  _ => {}
                }
              }
            });
            tokio::spawn(async move {
              loop {
                let mut out = String::new();
                if let Err(_) = stderr.read_line(&mut out).await {
                  break
                }
                match &mut *status_ref2.lock().await {
                  Status::Running(_, output) => { output.push_str(&out) },
                  _ => {}
                }
              }
            });

            *status = Status::Running(child, String::new());
            status.to_value()
          }
          Kill => {
            *status = Status::Ready;
            status.to_value()
          }
          GetStatus => {
            status.to_value()
          },
          PollOutput => {
            json!(status.take_output())
          },
          GetServerList { url }=> {
            json!(reqwest::get(&url)
              .await?
              .text()
              .await?)
          }
        })
      }
    })
    .build()
    .run();
}
