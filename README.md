# TPulse Chrome Extension Setup Guide

## Overview

The TPulse Chrome Extension allows users to collect metrics from browser usage, providing valuable insights into user behavior. This guide outlines the steps to install and set up the extension on a Linux system (specifically tested on Ubuntu 22.04).

## Prerequisites

Ensure that the following software is installed on your system:

- `node` version >= v18.17.1
- `yarn` version >= v1.22.19
- `cargo` version >= v1.75.0

## Installation Steps

### <a id="step1"></a> 1. Build the Extension

1. Open a terminal and navigate to the project directory.

    ```bash
    cd path/to/tpulse-chrome-extension
    ```

2. Install project dependencies using Yarn.

    ```bash
    yarn
    ```

3. Build the extension.

    ```bash
    yarn build
    ```

4. Navigate to the proxy directory and build the binary.

    ```bash
    cd src-proxy
    cargo build --release
    ```

### 2. Load the Extension

1. Launch Google Chrome from the terminal.

    ```bash
    google-chrome
    ```

2. In Chrome, enter `chrome://extensions/` in the address bar and switch to **Developer mode**.

3. Click on "Load unpacked" and select the `dist/` folder generated in the build step [Step 1](#step1).

4. Copy the ID of the loaded extension.

### 3. Register a Native Messaging Host on Chrome

1. Create a configuration file for the native messaging host.

    ```bash
    nano ~/.config/google-chrome/NativeMessagingHosts/com.ticklab.tpulse.json
    ```

2. Paste the following JSON into the file. Replace `<path>` with the result of the `pwd` command and `<ID-of-extension-in-step-2>` with the copied extension ID.

    ```json
    {
        "name": "com.ticklab.tpulse",
        "description": "tpulse",
        "path": "<path>/src-proxy/target/release/proxy",
        "type": "stdio",
        "allowed_origins": ["chrome-extension://<ID-of-extension-in-step-2>/"]
    }
    ```

3. Save and close the file.

## Verification

Once the setup is complete, check the terminal for any messages or errors. Ensure that the extension is successfully loaded and communicating with the native messaging host.

Congratulations! You have successfully set up the TPulse Chrome Extension on your Linux system.
