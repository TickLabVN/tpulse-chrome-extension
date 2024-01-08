use std::{fmt, io};

#[derive(Debug)]
pub enum Error {
    Io(io::Error),
    Serde(serde_json::Error),
    MessageTooLarge { size: usize },
    NoMoreInput,
}

impl From<serde_json::Error> for Error {
    fn from(err: serde_json::Error) -> Self {
        Error::Serde(err)
    }
}

impl From<io::Error> for Error {
    fn from(err: io::Error) -> Self {
        Error::Io(err)
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Error::Io(err) => write!(f, "io error: {}", err),
            Error::Serde(err) => write!(f, "serde error: {}", err),
            Error::MessageTooLarge { size } => write!(f, "message too large: {} bytes", size),
            Error::NoMoreInput => write!(f, "the input stream reached the end"),
        }
    }
}
