#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod async_handler;
mod cmd;

use serde_json::json;
use async_handler::AppBuilderExt;

fn main() {
  tauri::AppBuilder::new()
    .async_handler(|cmd: cmd::Cmd| async {
      use cmd::Cmd::*;
      Ok(match cmd {
        MyCustomCommand{ argument } => {
          println!("arg {}", argument);
          let world = "world";
          json!({
            "hello": world
          })
        }
      })
    })
    .build()
    .run();
}
