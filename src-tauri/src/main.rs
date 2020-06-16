#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod cmd;

use serde_json::{json, Value};
use tauri_async_handler::*;
use std::sync::Arc;
use tokio::{process::{Command, Child}, sync::Mutex};
use tauri::api::command::{command_path, binary_command};

enum Status {
  Ready,
  Running(Child),
}

impl Status {
  fn to_value(&self) -> Value {
    match self {
      Status::Ready => json!({ "status": "ready" }),
      Status::Running(_) => json!({ "status": "running" }),
    }
  }
}

fn main() {
  let status = Arc::new(Mutex::new(Status::Ready));

  tauri::AppBuilder::new()
    .async_handler(move |cmd: cmd::Cmd| {
      let status = status.clone();
      async move {
        use cmd::Cmd::*;
        let mut status = status.lock().await;

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
            let child = Command::new(path)
              .args(arguments)
              .kill_on_drop(true)
              .spawn()?;
            *status = Status::Running(child);
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
            json!("")
          }
        })
      }
    })
    .build()
    .run();
}
