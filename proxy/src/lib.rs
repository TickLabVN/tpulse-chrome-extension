mod errors;

use crate::errors::Error;
use serde::Serialize;
use serde_json::{json, Value};
use std::{io, panic};

#[macro_export]
macro_rules! send {
    ($($json:tt)+) => {{
        let v = json!($($json)+);
        $crate::send_message(io::stdout(), &v)
    }}
}

pub fn read_input<R: io::Read>(mut input: R) -> Result<Value, Error> {
    // The request and response messages of native messaging protocol are JSON with
    // a 4 byte header containing the length of the message: [length 4 byte header][message]
    let mut buffer_size = [0; 4];

    match input
        .read_exact(&mut buffer_size)
        .map(|()| u32::from_ne_bytes(buffer_size))
    {
        Ok(length) => {
            let mut buffer = vec![0; length as usize];
            input.read_exact(&mut buffer)?;
            let value = serde_json::from_slice(&buffer)?;
            Ok(value)
        }
        Err(e) => match e.kind() {
            io::ErrorKind::UnexpectedEof => Err(Error::NoMoreInput),
            _ => Err(Error::from(e)),
        },
    }
}

pub fn send_message<W: io::Write, T: Serialize>(mut output: W, value: &T) -> Result<(), Error> {
    let msg = serde_json::to_string(value)?;
    let len = msg.len();
    // Sending data exceeding 4GB (maximum size data received from Chrome) is not allowed.
    if len > 4 * 1024 * 1024 * 1024 {
        return Err(Error::MessageTooLarge { size: len });
    }
    let len = len as u32;
    let len_bytes = len.to_ne_bytes();
    output.write_all(&len_bytes)?;
    output.write_all(msg.as_bytes())?;
    output.flush()?;
    Ok(())
}

fn handle_panic(info: &std::panic::PanicInfo) {
    let msg = match info.payload().downcast_ref::<&str>() {
        Some(s) => *s,
        None => match info.payload().downcast_ref::<String>() {
            Some(s) => &s[..],
            None => "Box<Any>",
        },
    };
    let _ = send!({
        "status": "panic",
        "payload": msg,
        "file": info.location().map(|l| l.file()),
        "line": info.location().map(|l| l.line())
    });
}

pub fn event_loop() {
    panic::set_hook(Box::new(handle_panic));
    loop {
        match read_input(io::stdin()) {
            Ok(v) => send_message(io::stdout(), &v).unwrap(),
            Err(e) => {
                if let Error::NoMoreInput = e {
                    break;
                }
                send!({ "error": format!("{}", e) }).unwrap();
            }
        }
    }
}
