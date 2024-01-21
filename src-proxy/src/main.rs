use std::fmt;
use std::io::{self, Read, Write};

mod metrics;
use metrics::handle_metrics;


enum Error {
    Io(io::Error),
    NoMoreInput,
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Error::Io(err) => write!(f, "io error: {}", err),
            Error::NoMoreInput => write!(f, "the input stream reached the end"),
        }
    }
}


fn read_input<R: Read>(mut input: R) -> Result<String, Error> {
    let mut buffer_size = [0; 4];
    match input
        .read_exact(&mut buffer_size)
        .map(|()| u32::from_ne_bytes(buffer_size))
    {
        Ok(size) => {
            let mut buffer = vec![0; size as usize];
            input.read_exact(&mut buffer).unwrap();
            let value = String::from_utf8(buffer).unwrap();
            Ok(value)
        }
        Err(e) => match e.kind() {
            io::ErrorKind::UnexpectedEof => Err(Error::NoMoreInput),
            _ => Err(Error::Io(e)),
        },
    }
}
fn print_type_of<T>(_: &T) {
    println!("{}", std::any::type_name::<T>())
}
fn main() {
    #[cfg(any(target_os = "linux", target = "macos"))]
    let path = "/tmp/tpulse";
    #[cfg(target_os = "windows")]
    let pipe_name = "\\\\.\\pipe\\tpulse";
    loop {
        let mut pipe = unix_named_pipe::open_write(pipe_path).expect("could not open pipe for writing");
        match read_input(io::stdin()) {
            Ok(value) => 
            {
                match handle_metrics(&path, &value) {
                    Ok(()) => eprintln!("Send data successfully"),
                    Err(err) => eprintln!("Fail to send data due to: {}", err)
                }
                io::stderr().write_all(value.as_bytes()).unwrap();
            },
            Err(e) => {
                if let Error::NoMoreInput = e {
                    break;
                }
                eprintln!("{}", format!("{{ \"error\": \"{}\" }}", e));
            }
        }
    }
}



