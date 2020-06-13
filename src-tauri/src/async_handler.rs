use tauri::AppBuilder;
use futures::channel::{mpsc};
use futures::prelude::*;
use tauri::{Handle, Result};
use async_std::task;
use serde::Deserialize;
use serde_json::Value;
pub use anyhow::anyhow;

fn map_err<E: std::error::Error>(e: E) -> String {
  e.to_string()
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CallbackCmd<T>{
  #[serde(flatten)]
  cmd: T,
  callback: String,
  error: String,
}

struct Command<T>(T, Handle<()>);

pub trait AppBuilderExt {
  fn async_handler<C, F, Fut>(self, invoke_handler: F) -> Self
  where
    C: serde::de::DeserializeOwned + Send + 'static,
    F: FnMut(C) -> Fut + Send + 'static,
    Fut: std::future::Future<Output=Result<Value>> + Send,
  ;
}

fn json_string(value: Value) -> String {
  serde_json::to_string(&value).expect("Failed to encode json")
}

impl AppBuilderExt for AppBuilder {
  fn async_handler<C, F, Fut>(self, invoke_handler: F) -> Self
  where
    C: serde::de::DeserializeOwned + Send + 'static,
    F: FnMut(C) -> Fut + Send + 'static,
    Fut: std::future::Future<Output=Result<Value>> + Send,
  {
    let (mut tx, mut rx) = mpsc::channel::<Command<CallbackCmd<C>>>(1);
    task::spawn(async move {
      let mut handler = invoke_handler;
      while let Some(Command(CallbackCmd{ cmd, callback, error }, handle)) = rx.next().await {
        let result = handler(cmd).await
          .map(json_string);
        handle.dispatch(|webview| {
          Ok(tauri::execute_promise_sync(webview, || result, callback, error))
        })
        .expect("Failed to dispatch");
      }
    });
    self.invoke_handler(move |webview, arg| {
      let handle = webview.handle();
      let command: CallbackCmd<C> = serde_json::from_str(arg).map_err(map_err)?;
      tx.try_send(Command(command, handle)).map_err(map_err)?;
      Ok(())
    })
  }
}
