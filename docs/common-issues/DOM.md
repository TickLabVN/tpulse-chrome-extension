# Fixed: Content script of browser extension cannot access DOM

**Description:** Functions in Content script is invoke but cannot access DOM

**Steps to Reproduce (Original Bug):**

From Background file call direct function in Content script

**Expected Result (Original Bug):**

Can access and manipulate DOM from Content script

**Actual Result (Original Bug):**

ReferenceError: document is not defined

**Fix Implemented:**

Send message from Background file to Content script, then let Content script invoke code by itself.

**Expected Result (After Fix):**

Access and manipulate successfully DOM from Content script

**Additional Information:**

Browser extension include 3 component:

- Background: Handler browser event, API
- Content script: Handle DOM of browser tab
- Popup: Handle DOM of extension popup

Each part communicate to each other using send message from Browser API.

Invoke directly other file function, browser will render function in the file it was invoked , lead to error.

----------------------------------------------------------------
