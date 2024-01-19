
#[cfg(target_os = "linux")]
use libc::{open, write, O_WRONLY, close};
use std::io::Error;
use std::ffi::CString;
#[cfg(target_os = "linux")]
pub fn handle_metrics(pipe_name: &str, data: &str) -> Result<(), Error> {
    let c_pipe_name = CString::new(pipe_name).expect("Failed to convert pipe name to CString");

    let fd = unsafe { open(c_pipe_name.as_ptr(), O_WRONLY) };

    if fd == -1 {
        return Err(Error::last_os_error());
    }

    let result = unsafe { write(fd, data.as_ptr() as *const std::ffi::c_void, data.len()) };

    unsafe {
        close(fd);
    }

    if result == -1 {
        return Err(Error::last_os_error());
    }
    Ok(())
}
#[cfg(target_os = "windows")]
use {
    std::ffi::OsStr,
    std::os::windows::ffi::OsStrExt,
    std::ptr,
    std::io::Error,
    winapi::ctypes::c_void,
    winapi::um::fileapi::{CreateFileW, WriteFile, OPEN_EXISTING},
    winapi::um::winnt::{FILE_SHARE_READ, GENERIC_WRITE},
    winapi::um::winbase::FILE_FLAG_OVERLAPPED
};
#[cfg(target_os = "windows")]
fn connect_to_pipe(pipe_name: &str) -> Result<i32, Error> {
    let pipe_name = OsStr::new(pipe_name)
        .encode_wide()
        .chain(Some(0).into_iter())
        .collect::<Vec<_>>();
    let pipe_handle = unsafe {
        CreateFileW(
            pipe_name.as_ptr(),
            GENERIC_WRITE,
            FILE_SHARE_READ,
            ptr::null_mut(),
            OPEN_EXISTING,
            FILE_FLAG_OVERLAPPED,
            ptr::null_mut(),
        )
    };

    if pipe_handle == winapi::um::handleapi::INVALID_HANDLE_VALUE {
        return Err(Error::last_os_error());
    }
    Ok(pipe_handle as i32)
}
#[cfg(target_os = "windows")]
fn write_to_pipe(pipe_handle: i32, data: &str) -> Result<(), Error> {
    let data_bytes = data.as_bytes();
    let mut bytes_written: u32 = 0;

    loop {
        let result = unsafe {
            WriteFile(
                pipe_handle as *mut c_void,
                data_bytes.as_ptr() as *const _,
                data_bytes.len() as u32,
                &mut bytes_written,
                ptr::null_mut(),
            )
        };

        if result == 0 {
            return Err(Error::last_os_error());
        }

        // Break the loop if all bytes are written
        if bytes_written == data_bytes.len() as u32 {
            break;
        }
    }

    Ok(())
}

#[cfg(target_os = "windows")]
pub fn handle_metrics(pipe_name: &str, data: &str) -> Result<(), Error> {
    match connect_to_pipe(&pipe_name) {
        Ok(pipe_handle) => {
            match write_to_pipe(pipe_handle, &data) {
                Ok(()) => println!("Succeed in sending data"),
                Err(err) => eprintln!("Error writing to pipe: {}", err),
            }
            Ok(())
        }
        Err(err) => {
            eprintln!("Error connecting to named pipe: {}", err);
            Err(err)
        }
    }
}
