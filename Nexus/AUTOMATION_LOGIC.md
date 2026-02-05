# C2 Dashboard - Automation & Agent Suggestion Logic

This document describes the design-time logic for identifying UI elements and suggesting agent automations.

## UI Interconnectivity & Design Detection

The C2 Dashboard integrates with agent-side layout detectors to analyze target application interfaces.

### 1. View Hierarchy Extraction
Agents running on Android can extract the current view hierarchy using accessibility services or `uiautomator`.
- **Input:** XML dump of the current activity.
- **Analysis:** Identifying resource IDs, text labels, and class types (e.g., `android.widget.Button`, `android.widget.EditText`).

### 2. Feature Mapping
The C2 server maps these UI elements to functional capabilities:
- **Input Fields (ID: `password`, `token`):** Automatically suggests "Token Extraction" or "Credential Input Simulation" agents.
- **Transaction Buttons (Text: "Send", "Transfer"):** Suggests "Financial Automation" or "Workflow Interception" agents.
- **Navigation Menus:** Suggests "Structure Mapping" agents to crawl the app's internal pages.

## Agent Creation Suggestions

Based on the detected environment, the C2 UI provides a "Suggested Agents" sidebar:

### Scenario: High-Privilege Process Detected (Windows)
- **Detection:** Agent reports `lsass.exe` or `vaultsvc.exe` in process list.
- **Suggestion:** "Identity Provider Key Extraction Agent" - automates memory analysis of the specific process.

### Scenario: Messaging App Foregrounded (Android)
- **Detection:** Agent reports `com.whatsapp` or `com.signal.messenger` as active package.
- **Suggestion:** "Encrypted Message Backup Agent" - triggers a sequence to navigate UI and initiate a backup to a controlled endpoint.
- **Advanced Automation:** 
  - **Exfiltration:** Capture `msgstore.db.crypt14` and upload to C2 files.
  - **Regex Intercept:** Monitor UI for specific strings (e.g., "secret", "password") and exfiltrate the containing element's value.

### Scenario: Browser with Active Tab (Cross-Platform)
- **Detection:** Agent detects browser process with specific domain in title bar.
- **Suggestion:** "Session Persistence Agent" - attempts to locate and extract session cookies or local storage for that specific origin.

## Deep UI Inspection & Data Exfiltration

The C2 Dashboard now supports granular UI element targeting and multi-stage exfiltration:

### 1. Element Selectors
Automations can target specific UI properties:
- **Text/Value:** Extract string content from labels, inputs, or messages.
- **Images:** Snap region-specific screenshots or OCR target elements.
- **Hierarchy:** Match based on view depth or sibling relationships (e.g., "Find the text next to the 'Balance' label").

### 2. C2 File Uplink
Agents can now stream binary data directly to the C2 storage:
- **WhatsApp Backups:** Automated discovery and upload of encrypted database files.
- **Screen Scraping:** Real-time capture of specific UI regions based on visibility logic.
- **Value Extraction:** Automated regex matching on all visible text elements with immediate C2 reporting.

## Automation Scripting (LLM Assisted)

The "Agent Builder" in the dashboard allows natural language input:
- **Operator Prompt:** "I want to monitor whenever the user opens their banking app and capture the screen."
- **AI Response:** Generates a script that:
  1.  Sets a listener for the active package change event.
  2.  Triggers a screenshot when the target package is detected.
  3.  Sends the image to the C2 `/api/logs` endpoint as a binary attachment.
