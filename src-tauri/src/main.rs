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
use tokio::{net::UdpSocket, time::{Instant, Duration, timeout}};
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;


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
    .async_handler_concurrent(None, move |cmd: cmd::Cmd| {
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

            #[cfg(not(target_os = "windows"))]
            let mut command = Command::new(path);
            #[cfg(target_os = "windows")]
            let mut command = {
              let mut std_cmd = std::process::Command::new(path);
              std_cmd.creation_flags(0x08000000);
              Command::from(std_cmd)
            };
            let mut child = command
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
          Get { url } => {
            json!(reqwest::get(&url)
              .await?
              .text()
              .await?)
          },
          Ping { server } => {
            let mut buf = [0u8; 5];
            let mut socket = UdpSocket::bind("0.0.0.0:0").await?;
            socket.connect(server).await?;
            socket.send(b"\x02\x01\x02\x03\x04").await?;
            let start = Instant::now();
            timeout(Duration::from_millis(500), socket.recv(&mut buf)).await??;
            json!(start.elapsed().as_millis() as i32)
          }
        })
      }
    })
    .build()
    .run();
}
