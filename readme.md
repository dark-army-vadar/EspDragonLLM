# ðŸ‰ EspionageDragonLLM

**Advanced AI-Powered Security Testing Framework with Adaptive Cipher Detection & Auto-Mutating Attack Patterns**

<div align="center">

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-green.svg)](#)

*Red dragon-themed penetration testing framework inspired by Kali Linux*

[Features](#-features) â€¢ [Installation](#-installation) â€¢ [Quick Start](#-quick-start) â€¢ [Documentation](#-documentation)

</div>

---

## ðŸŽ¯ What is EspionageDragon?

EspionageDragon is a **next-generation penetration testing framework** that combines:

- ðŸ” **Cipher Detection** - Identifies Base64, Hex, ROT13, Caesar, MD5, SHA-1, SHA-256, JWT encoding patterns
- ðŸŽ² **8 Randomized Attack Patterns** - Each mutates on every execution (no two attacks are identical)
- ðŸ¤– **LLM-Powered Generation** - Claude AI creates context-aware exploits in real-time
- ðŸŒ **Web Exploitation** - Full SQL injection, XSS, LFI, SSRF, XXE, RCE, IDOR testing
- ðŸš€ **Automated Workflows** - 5-phase attack pipeline: WAF detection â†’ Crawling â†’ Scanning â†’ Prediction â†’ Exploitation
- ðŸ“Š **Interactive Dashboard** - Real-time cyber warfare visualization with ASCII art map
- ðŸ“± **Mobile-Ready** - Responsive design (tested on Motorola G 2025)

---

## âœ¨ Key Features at a Glance

### **8 Polymorphic Attack Vectors** (All Auto-Mutating)

| Vector | Attack Type | Adaptation |
|--------|------------|-----------|
| 1ï¸âƒ£ | Dynamic Encoding | base64â†’hexâ†’rot13 chains (random) |
| 2ï¸âƒ£ | Header Rotation | User-Agent, XFF, Authorization (random) |
| 3ï¸âƒ£ | Timing Obfuscation | 0.001s-1.0s delays for IDS bypass |
| 4ï¸âƒ£ | Parameter Tampering | Random SQL/fuzzing payloads |
| 5ï¸âƒ£ | Cookie Injection | Random session token generation |
| 6ï¸âƒ£ | Concurrent Distribution | Multi-threaded (3-50 workers) bypass |
| 7ï¸âƒ£ | Adaptive Fuzzing | Context-aware mutation-based testing |
| 8ï¸âƒ£ | LLM-Adaptive Payloads | Claude-powered intelligent generation |

### **Combined Axis Attack**
Unified attack integrating ALL 8 vectors with intelligent response-based adaptation.

### **Real-Time Dashboard**
```
â”Œâ”€ DRAGON SECURITY FRAMEWORK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”œâ”€ SERVICES â”‚ CYBER WARFARE MAP â”‚ VULNS          â”‚
â”œâ”€ ðŸ” CIPHER DETECTOR & CODE MUTATOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Detected: BASE64, MD5, rate_limit, auth       â”‚
â”‚ Patterns Generated: 8 | Auto-Mutating: âœ“      â”‚
â”œâ”€ FEED (Real-time attack log) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [12:45:23] ðŸ” Cipher: Base64 Detected        â”‚
â”‚ [12:45:24] âš¡ AI Security: rate_limit         â”‚
â”‚ [12:45:25] âœ“ Generated 8 randomized patterns  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸš€ Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/espionagedragon.git
cd espionagedragon

# Install dependencies
pip install -r requirements.txt

# Set API key (optional, has fallback)
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### Basic Usage

```bash
# Interactive dashboard (RECOMMENDED)
python main.py

# Full automated test
python main.py --target https://example.com --type all

# SQL injection shell
python main.py --target https://example.com --type sql --sql-shell

# Web API discovery
python main.py --target https://api.example.com --type crawl --crawl-depth 3

# Save results to JSON
python main.py --target https://example.com --type all --output results.json
```

### Advanced Examples

```bash
# Test with proxy
python main.py --target https://example.com --proxy http://127.0.0.1:8080 --type all

# Extended crawl (depth 5) with API endpoint mapping
python main.py --target https://example.com --type crawl --crawl-depth 5 --output api_map.json

# SQL shell with file operations
python main.py --target https://example.com --type sql --sql-shell
# Then in shell:
#   query SHOW DATABASES
#   read /etc/passwd
#   write /tmp/shell.php

# Export to CSV
python main.py --target https://example.com --type all --csv results.csv

# Generate exploits without execution (payload only)
python main.py --target https://example.com --type all --no-execute --output payloads.json
```

---

## ðŸ“š Documentation

- **[FEATURES.md](FEATURES.md)** - Complete feature reference (20+ features)
- **[GITHUB_REPO_NAME.md](GITHUB_REPO_NAME.md)** - Repository structure and setup
- **[examples/](examples/)** - Working code examples
- Inline code documentation with docstrings throughout

---

## ðŸ”§ Supported Vulnerabilities

| Type | Support | Status |
|------|---------|--------|
| SQL Injection | UNION, Blind, Time-based, Error-based, Stacked | âœ… Full |
| XSS | Reflected, Stored, DOM-based | âœ… Full |
| LFI | Path traversal, Null byte, Encoding bypass | âœ… Full |
| SSRF | Internal services, Cloud metadata | âœ… Full |
| XXE | Entity injection, DTD bypass | âœ… Full |
| RCE | Command injection, Code execution | âœ… Full |
| IDOR | ID enumeration, Parameter fuzzing | âœ… Full |
| WAF Bypass | Header injection, Encoding, Chunking | âœ… Full |

---

## ðŸ¤– How It Works

### **Attack Pipeline**

1. **Phase 0: WAF/CDN Detection** - Identify Cloudflare, AWS WAF, Akamai, Imperva
2. **Phase 1: Web Crawling** - Async crawling with API endpoint discovery
3. **Phase 2: Service Scanning** - Port detection and service identification
4. **Phase 3: Vulnerability Prediction** - AI analyzes services for vulnerabilities
5. **Phase 4: Exploit Generation** - Claude generates context-aware payloads
6. **Phase 5: Execution & Analysis** - Run exploits and analyze results

### **Cipher Detection in Action**

When a cipher/encoding is detected in responses:
1. EspionageDragon identifies the cipher type
2. Detects AI security patterns (rate limits, auth barriers)
3. Generates 8 randomized attack patterns
4. Each pattern mutates on every execution
5. Combined axis attack integrates all vectors
6. Real-time feedback on dashboard

---

## ðŸŽ¨ Interactive Features

### Cyber Warfare Dashboard
- **Keyboard Navigation**: Arrow keys to switch panels, E/S/Q for actions
- **Real-Time Updates**: 4 refreshes per second
- **Color-Coded Status**: Green (success), Yellow (warning), Red (critical)
- **Auto-Scrolling Feed**: Shows last 18-20 messages

### Exploit Execution Menu
- **7 Vulnerability Types**: SQLi, XSS, LFI, SSRF, XXE, RCE, IDOR
- **Keyboard Shortcuts**: 1-7 for each type, 'E' to launch
- **Live Parameters**: Input target-specific parameters
- **Real HTTP Execution**: Tests against live targets

### SQL Shell
```
sql> databases        # List databases
sql> tables          # Show tables
sql> columns         # Show columns
sql> query SHOW USERS  # Execute SQL
sql> read /etc/passwd  # Read files via injection
sql> write           # Upload webshell
sql> dump            # Dump database
```

---

## ðŸ” Security & Anti-Detection

EspionageDragon is built to **evade detection**:

âœ… **Polymorphic Code** - No two attacks are identical
- Random variable names
- Random payloads
- Random encoding chains
- Random timing delays
- Random User-Agents
- Random IP spoofing

âœ… **Distributed Execution**
- Multi-threaded attacks (3-50 workers)
- Concurrent request distribution
- Rate limit bypass built-in

âœ… **AI-Driven Adaptation**
- Claude analyzes responses
- Adjusts payloads based on feedback
- Context-aware pattern selection

---

## ðŸ“Š Dashboard Screenshots

### Desktop View (100+ chars)
Full dashboard with all panels:
- Services list on left
- Cyber warfare ASCII map in center  
- Vulnerabilities on right
- Cipher detection panel below
- Live feed at bottom

### Mobile View
Responsive single-column layout optimized for small terminals

### Cipher Detection Panel
Shows:
- Detected cipher types in table format
- AI security patterns with icons
- Randomization stats (pattern count, mutation status)
- Obfuscation level

---

## ðŸ› ï¸ Requirements

- **Python**: 3.8+
- **Dependencies**: See `requirements.txt`
  - requests (HTTP client)
  - rich (terminal UI)
  - anthropic (Claude API)
  - aiohttp (async HTTP)
  - beautifulsoup4 (HTML parsing)

---

## ðŸŽ“ Usage Examples

```python
# Example 1: Direct cipher detection
from src.cipher_detector import CipherDetector

detector = CipherDetector()
response = "SGVsbG8gV29ybGQ="  # Base64 encoded
findings = detector.analyze_response(response, target="https://example.com")
print(findings['ciphers_detected'])  # [{'type': 'base64', 'name': 'Base64', ...}]

# Example 2: Generate randomized patterns
patterns = detector.generate_brute_force_patterns("https://example.com")
print(f"Generated {len(patterns)} randomized attack patterns")

# Example 3: Combined axis attack
from src.llm_pattern_axis import LLMPatternAxis
axis = LLMPatternAxis()
result = axis.generate_combined_axis(
    target="https://example.com",
    detected_patterns=["rate_limit", "auth_required"]
)
print(result['code'])  # Ready-to-execute Python code
```

---

## âš™ï¸ Configuration

### Environment Variables

```bash
# Required
export ANTHROPIC_API_KEY="your-api-key"

# Optional
export HTTP_PROXY="http://proxy:8080"
export HTTPS_PROXY="http://proxy:8080"
export REQUEST_TIMEOUT="5"
```

### Custom Wordlists

Place custom payloads in `wordlists/` directory:
```
wordlists/
â”œâ”€â”€ common.txt
â”œâ”€â”€ sql_payloads.txt
â”œâ”€â”€ xss_payloads.txt
â””â”€â”€ custom.txt
```

---

## ðŸ› Troubleshooting

| Issue | Solution |
|-------|----------|
| Cipher panel not visible | Terminal must be 100+ chars wide |
| LLM not generating patterns | Set ANTHROPIC_API_KEY or use fallback |
| SQL injection not working | Try different databases (MySQL/PostgreSQL/MSSQL) |
| Rate limiting blocking requests | Use timing bypass (built-in) or increase delays |
| Mobile UI broken | Terminal must be at least 50 chars wide |

---

## ðŸ¤ Contributing

Contributions welcome! 

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## ðŸ“œ License

MIT License - see [LICENSE](LICENSE) for details

**âš ï¸ Disclaimer**: For authorized security testing only. Unauthorized access is illegal.

---

## ðŸ™ Acknowledgments

Inspired by:
- OWASP Foundation
- Kali Linux
- Burp Suite Community

Built with:
- Python
- Rich (beautiful terminal UIs)
- Anthropic Claude API

---

## ðŸ’œ Support Dragon Security

EspionageDragon relies on **Anthropic's Claude AI** for intelligent exploit generation and analysis. If you find this tool valuable, please consider supporting its development:

### Donation Addresses

- **Bitcoin**: `1MmZZCwx7HPWBBgHdL9tw52JFyEmgUDBgo`
- **USD Coin (USDC)**: `0xbf6002807b809b92906a234c82f9b28ba5d5163e`
- **Monero (XMR)**: `4Ae5KLiz5TCCJjWAA5oWQPHw9Bs89iJLpFzs3An3jZ2EgcxukMa9sVNPjbJfwUEMA1i7MNKoJfLzxMbavr8TDio3Sbe8JCR`

Your support helps maintain:
- ðŸ¤– Claude API subscriptions for LLM code generation
- ðŸ”„ Continuous framework updates & new exploit patterns
- ðŸ“š Documentation & educational resources
- ðŸ‰ Community-driven security research

View donation info in CLI:
```bash
python main.py --donations
```

---

## ðŸ“ž Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/espionagedragon/issues)
- **Email**: security@yoursite.com
- **Documentation**: [FEATURES.md](FEATURES.md)

---

<div align="center">

**Made with ðŸ‰ by security researchers**

[Star the repo if you find it useful!](https://github.com/yourusername/espionagedragon)

</div>
