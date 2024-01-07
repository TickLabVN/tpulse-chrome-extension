use std::io::{self, Read, Write};

fn main() {
    loop {
        let mut buffer_size = [0; 4];
        let mut input = io::stdin();
        match input
            .read_exact(&mut buffer_size)
            .map(|()| u32::from_ne_bytes(buffer_size))
        {
            Ok(size) => {
                let mut buffer = vec![0; size as usize];
                input.read_exact(&mut buffer).unwrap();
                let value = String::from_utf8(buffer).unwrap();
                io::stderr().write_all(value.as_bytes()).unwrap();
            }
            Err(e) => {
                io::stderr().write_all(e.to_string().as_bytes()).unwrap();
            }
        }
    }
}
