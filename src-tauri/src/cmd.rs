use serde::Deserialize;

#[derive(Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum Cmd {
    Print { argument: String },
    Run { arguments: Vec<String> },
    Kill,
    GetStatus,
    PollOutput,
    Get { url: String },
    Ping { server: String },
}
