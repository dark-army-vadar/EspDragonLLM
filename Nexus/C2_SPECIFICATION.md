# C2 (Command & Control) System Specification

## Overview
This document outlines the architecture for a Centralized Device Management Dashboard (C2) capable of managing remote agents on Android and Windows devices. The system allows for real-time monitoring, command execution, and AI-driven analysis of agent logs.

**Disclaimer:** This system is designed for legitimate remote administration and authorized security testing purposes only.

## System Architecture

### 1. Central Server (C2 Dashboard)
- **Tech Stack:** Node.js (Express), PostgreSQL, React (Dashboard).
- **Role:** Acts as the central hub for all agent communications.
- **Key Features:**
  - **Agent Registry:** Tracks online/offline status of all connected devices.
  - **Command Queue:** Stores commands to be executed by agents.
  - **Live Monitoring:** Visual dashboard showing active agents.
  - **AI Analysis:** Uses LLMs to parse incoming logs for anomalies.

### 2. Remote Agents (The Client)
- **Tech Stack:** Node.js (Cross-platform compatibility for Windows & Android via Termux).
- **Role:** Connects to C2, executes instructions, and reports back.
- **Core Loop:**
  1.  **Registration:** On startup, agent sends handshake with OS info, hostname, and UUID.
  2.  **Heartbeat:** Pings server every X seconds to maintain "Online" status.
  3.  **Command Polling:** Checks `/api/agents/:id/commands` for new tasks.
  4.  **Execution:** Runs shell commands or internal scripts.
  5.  **Reporting:** POSTs results back to `/api/commands/:id/result`.

## Data Model

### Agents
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier for the device. |
| `hostname` | String | Device name (e.g., "DESKTOP-5A2B", "Pixel-6"). |
| `os` | Enum | `windows`, `android`, `linux`. |
| `status` | Enum | `online`, `offline`. |
| `lastSeen` | Timestamp | Used to calculate online status. |

### Commands
| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Unique command ID. |
| `agentId` | UUID | Target device. |
| `command` | String | The actual shell command (e.g., `ipconfig`, `ls -la`). |
| `status` | Enum | `pending`, `completed`, `failed`. |
| `output` | Text | Stdout/Stderr from the execution. |

## AI Agent Integration
The system leverages OpenAI's models to enhance operator efficiency:
- **Log Analysis:** Agents send verbose logs. The AI analyzes these logs to identify patterns (e.g., "Authentication failure spike detected on Agent-X").
- **Command Generation:** Operators can ask the AI "How do I check active network connections on Windows?" and the AI generates the correct PowerShell command to queue.

## Security & Protocol
- **Communication:** All traffic over HTTPS (in production).
- **Authentication:** Agents authenticate via a pre-shared key (PSK) or token exchanged during registration.
- **Validation:** Server validates all incoming data using Zod schemas to prevent injection attacks.

## Implementation Plan

### Phase 1: Core Infrastructure (Completed)
- [x] Define Database Schema (Agents, Commands, Logs).
- [x] Define API Contract (REST Endpoints).
- [x] Set up PostgreSQL Database.

### Phase 2: Agent Development (Documentation Only)
- Develop a standalone Node.js script `agent.js`.
- Implement system information fetching (`os` module).
- Implement `node-fetch` for API communication.
- Implement `child_process.exec` for command execution.

### Phase 3: Dashboard Logic
- Frontend to list agents.
- Terminal-like interface for sending commands.
- "AI Insights" panel for log analysis.
