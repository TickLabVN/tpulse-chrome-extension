# TPulse Chrome Extension
## Collect metrics from browser usage
### Prerequisite
- `node` >= v18.17.1
- `yarn`>= v1.22.19
- `cargo` >= v1.75.0
### How to install extension on Linux (Ubuntu 22.04)
#### 1. Build
- `yarn`: Install dependencies.
- `yarn build`: Create `/dist` folder.
- `cd proxy && cargo build`: Create file binary `target/debug/proxy` to process data sent from extension.
#### 2. Load extension
- Run command `google-chrome` on terminal to open Chrome browser.
- Enter `chrome://extensions/` and switch to **Developer mode**.
- Load unpacked `dist/` (step 1).
- Copy ID of extension.
#### 3. Register a native messaging host on Chrome
- Save a file that defines the native messaging host configuration:

    ```sh
    nano ~/.config/google-chrome/NativeMessagingHosts/com.ticklab.tpulse.json
    ```
- Copy and paste:

    ```json
    {
        "name": "com.ticklab.tpulse",
        "description": "tpulse",
        "path": "<path>/tpulse-chrome-extension/proxy/target/debug/proxy",
        "type": "stdio",
        "allowed_origins": ["chrome-extension://<ID-of-extension-in-step-2>/"]
    }
    ```
Completely! Please check the magic on terminal.