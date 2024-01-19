use std::fmt;
use std::io::{self, Read, Write};
use std::ffi::CString;

#[cfg(target_os = "linux")]
use libc::{open, write, O_WRONLY, close};
#[cfg(target_os = "windows")]
use {
    std::ptr,
    winapi::um::fileapi::{CreateFileW, OPEN_EXISTING},
    winapi::um::winbase::{FILE_FLAG_OVERLAPPED, PIPE_ACCESS_DUPLEX, PIPE_TYPE_MESSAGE, PIPE_READMODE_MESSAGE},
    winapi::um::winnt::{GENERIC_READ, GENERIC_WRITE, FILE_SHARE_READ, FILE_SHARE_WRITE},
    winapi::um::handleapi::INVALID_HANDLE_VALUE,
    winapi::um::ioapiset::WriteFile,
    winapi::um::namedpipeapi::CreateNamedPipeW,
};

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
#[cfg(target_os = "linux")]
fn write_to_pipe(pipe_name: &str, data: &str) -> Result<(), Error> {
    let c_pipe_name = CString::new(pipe_name).expect("Failed to convert pipe name to CString");

    let fd = unsafe { open(c_pipe_name.as_ptr(), O_WRONLY) };

    if fd == -1 {
        return Err(Error::NoMoreInput);
    }

    let result = unsafe { write(fd, data.as_ptr() as *const std::ffi::c_void, data.len()) };

    unsafe {
        close(fd);
    }

    if result == -1 {
        return Err(Error::NoMoreInput);
    }
    Ok(())
}
#[cfg(target_os = "windows")]
fn write_to_pipe(pipe_name: &str, data: &str) -> io::Result<()> {
    let pipe_name = CString::new(pipe_name).expect("Failed to convert pipe name to CString");

    let pipe_handle = unsafe {
        CreateFileW(
            pipe_name.as_ptr(),
            GENERIC_WRITE,
            FILE_SHARE_READ | FILE_SHARE_WRITE,
            ptr::null_mut(),
            OPEN_EXISTING,
            FILE_FLAG_OVERLAPPED,
            ptr::null_mut(),
        )
    };

    if pipe_handle == INVALID_HANDLE_VALUE {
        return Err(io::Error::last_os_error());
    }

    // Write data to the pipe
    let result = unsafe { WriteFile(pipe_handle, data.as_ptr() as *const _, data.len(), ptr::null_mut(), ptr::null_mut()) };

    if result == 0 {
        return Err(io::Error::last_os_error());
    }

    // Close the pipe handle
    unsafe { CloseHandle(pipe_handle) };

    Ok(())
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

fn main() {
    let path = "/tmp/tpulse-test13";
    loop {
        match read_input(io::stdin()) {
            Ok(value) => 
            {
                let payload = value.to_string();
                match write_to_pipe(&path, &payload) {
                    Ok(_) => eprintln!("Send successfully"),
                    Err(_) => eprintln!("Fail to send data to server")
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

