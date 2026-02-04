#!/usr/bin/env -S node --no-warnings --loader tsx
/**
 * espdragon.ts
 *
 * Extended ESPDragon CLI (updated):
 *  - LLM prompt mode (calls Ollama)
 *  - Scan mode: non-destructive reconnaissance for target scopes
 *  - Evidence PoC reporter (non-exploit): creates human-readable, safe reproduction artifacts
 *  - Results saved in .espdragon/results/ and history in .espdragon/history.json
 *
 * Safety: Scans require explicit confirmation:
 *   - pass --confirm on the command line OR
 *   - set environment variable ESPDRAGON_AUTHORIZED="yes"
 *
 * New flag:
 *   --poc-name "8day"   # optional label for PoC/evidence files (metadata only)
 *
 * Usage:
 *   npx tsx bin/espdragon.ts --scan "https://example.com" --confirm --poc-name "8day"
 */

import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import net from "node:net";
import { spawnSync } from "node:child_process";

const BR = "\x1b[0m";
const BRIGHT_RED = "\x1b[1;91m";
const CYAN = "\x1b[36m";
const GREY = "\x1b[90m";
const BOLD = "\x1b[1m";

function red(text: string) { return `${BRIGHT_RED}${text}${BR}`; }
function cyan(text: string) { return `${CYAN}${text}${BR}`; }
function grey(text: string) { return `${GREY}${text}${BR}`; }

function argvFlag(name: string) {
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && idx + 1 < process.argv.length) return process.argv[idx + 1];
  return undefined;
}

async function readStdin(): Promise<string> {
  const stdin = process.stdin;
  if (stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of stdin) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8").trim();
}

/* ---------- Config / Flags ---------- */

const env = process.env;
const OLLAMA_PUBLIC_URL = env.OLLAMA_PUBLIC_URL ?? "";
const OLLAMA_MODEL = env.OLLAMA_MODEL ?? "";
const OLLAMA_API_PATH = env.OLLAMA_API_PATH ?? "/api/generate";

const PROMPT_ARG = argvFlag("--prompt") || argvFlag("-p");
const SCAN_ARG = argvFlag("--scan") || argvFlag("-s"); // comma-separated targets or path to file with targets
const OUTPUT_DIR_ARG = argvFlag("--output") || argvFlag("-o");
const INIT_WORKSPACE = process.argv.includes("--init-workspace");
const CONFIRM_FLAG = process.argv.includes("--confirm");
const DRY_RUN = process.argv.includes("--dry-run") || process.argv.includes("-d");
const VERBOSE = process.argv.includes("--verbose") || process.argv.includes("-v");
const POC_NAME = argvFlag("--poc-name") || undefined;

const AUTHORIZED = CONFIRM_FLAG || (env.ESPDRAGON_AUTHORIZED === "yes");

const DEFAULT_RESULTS_DIR = path.join(process.cwd(), ".espdragon");
const RESULTS_SUBDIR = "results";
const HISTORY_FILE = "history.json";

/* ---------- Print Helpers ---------- */

function printHeader() {
  const title = red(`${BOLD}ESPDRAGON LLM — Espionage Dragon Interface${BR}`);
  const dragon = red(`
         /\\                 /\\
        / \\'._   (\\_/)   _.'/ \\
       /_.''._'--('.')--'_.''._\\   ${BOLD}ESP / LLM
       | \\_ / ' \\/  "  \\/\\_// |
       \\/  \\__     |\\__/     __/  \\/
        '.___ \\    /  \\    / ___.' 
             / /  /____\\  \\ \\
            / /   |    |   \\ \\
           /_/    |____|    \\_\\
  `);
  console.log(title);
  console.log(dragon);
}

function printPrompt(promptText: string) {
  console.log(cyan(`${BOLD}>>> PROMPT${BR}`));
  console.log(`${grey(promptText)}\n`);
}

function printLLMMessage(role: string, message: string) {
  console.log(cyan(`${BOLD}${role.toUpperCase()}:${BR}`));
  console.log(`${message}\n`);
}

/* ---------- Workspace helpers ---------- */

function ensureWorkspace(baseDir = DEFAULT_RESULTS_DIR) {
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
  const resultsDir = path.join(baseDir, RESULTS_SUBDIR);
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
  const historyPath = path.join(baseDir, HISTORY_FILE);
  if (!fs.existsSync(historyPath)) fs.writeFileSync(historyPath, JSON.stringify([], null, 2));
  return { baseDir, resultsDir, historyPath };
}

function initWorkspaceGit(baseDir = DEFAULT_RESULTS_DIR) {
  try {
    const gitCheck = spawnSync("git", ["--version"], { encoding: "utf8" });
    if (gitCheck.status !== 0) {
      if (VERBOSE) console.error(grey("[git] git not available, skipping git init"));
      return false;
    }
    if (!fs.existsSync(path.join(baseDir, ".git"))) {
      const initRes = spawnSync("git", ["init"], { cwd: baseDir, stdio: VERBOSE ? "inherit" : "ignore" });
      if (initRes.status === 0) {
        if (VERBOSE) console.error(grey("[git] Initialized git repository in .espdragon"));
        return true;
      }
    } else {
      if (VERBOSE) console.error(grey("[git] .espdragon is already a git repo"));
      return true;
    }
  } catch (err) {
    if (VERBOSE) console.error(grey(`[git] git init error: ${String(err)}`));
  }
  return false;
}

function appendHistory(entry: any, baseDir = DEFAULT_RESULTS_DIR) {
  try {
    const historyPath = path.join(baseDir, HISTORY_FILE);
    const arr = fs.existsSync(historyPath) ? JSON.parse(fs.readFileSync(historyPath, "utf8")) : [];
    arr.push(entry);
    fs.writeFileSync(historyPath, JSON.stringify(arr, null, 2));
    if (VERBOSE) console.error(grey(`[history] Appended entry to ${historyPath}`));
  } catch (err) {
    console.error(red(`[ERR] Could not write history: ${String(err)}`));
  }
}

/* ---------- Network helpers (non-destructive) ---------- */

async function resolveDNS(hostname: string) {
  try {
    const ips = await dns.lookup(hostname, { all: true });
    return ips.map(a => a.address);
  } catch (err) {
    return { error: String(err) };
  }
}

function tcpConnect(host: string, port: number, timeout = 3000): Promise<{ open: boolean; rttMs?: number; error?: string }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const sock = new net.Socket();
    let finished = false;
    sock.setTimeout(timeout);
    sock.once("connect", () => {
      if (finished) return;
      finished = true;
      const rtt = Date.now() - start;
      sock.destroy();
      resolve({ open: true, rttMs: rtt });
    });
    sock.once("timeout", () => {
      if (finished) return;
      finished = true;
      sock.destroy();
      resolve({ open: false, error: "timeout" });
    });
    sock.once("error", (err) => {
      if (finished) return;
      finished = true;
      resolve({ open: false, error: String(err) });
    });
    sock.connect(port, host);
  });
}

async function httpProbe(urlStr: string, timeout = 8000) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(urlStr, { method: "GET", signal: controller.signal });
    clearTimeout(id);
    const headers: Record<string,string> = {};
    res.headers.forEach((v,k) => headers[k] = v);
    const textPreview = (await res.text()).slice(0, 5000);
    return {
      status: res.status,
      statusText: res.statusText,
      headers,
      bodyPreview: textPreview
    };
  } catch (err) {
    return { error: String(err) };
  }
}

async function discoverOpenApi(baseUrl: string) {
  const candidates = ["/openapi.json", "/openapi.yaml", "/swagger.json", "/swagger.yaml", "/.well-known/openapi.json"];
  for (const p of candidates) {
    try {
      const url = new URL(p, baseUrl).toString();
      const res = await fetch(url, { method: "GET" });
      if (res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const text = await res.text();
        return { path: p, url, contentType, textPreview: text.slice(0, 2000) };
      }
    } catch {
      // ignore
    }
  }
  return null;
}

/* ---------- Evidence PoC generator (SAFE, non-exploit) ---------- */

function safeCurlExamples(normalizedUrl: string) {
  // provide safe, read-only commands for reproduction
  const cmds = [
    `# HEAD (fast check HTTP headers)\ncurl -I --max-time 10 "${normalizedUrl}"`,
    `# Full GET (body preview)\ncurl -sS --max-time 10 "${normalizedUrl}" | sed -n '1,200p'`,
    `# OpenAPI discovery (if discovered)\ncurl -sS --max-time 10 "${normalizedUrl.replace(/\\/$/, '')}/openapi.json" | sed -n '1,200p'`,
    `# Robots (if present)\ncurl -sS --max-time 10 "${normalizedUrl.replace(/\\/$/, '')}/robots.txt" | sed -n '1,200p'`,
  ];
  return cmds.join("\n\n");
}

function writeEvidencePoC(out: any, resultsDir: string, pocLabel?: string) {
  try {
    const idSafe = (out.target || "unknown").replace(/[^a-z0-9\-_\.]/gi, "_").slice(0, 120);
    const timestamp = new Date(out.timestamp || Date.now()).toISOString().replace(/[:.]/g, "-");
    const baseName = `${timestamp}_${idSafe}${pocLabel ? `_poc-${pocLabel}` : ""}`;
    const pocPath = path.join(resultsDir, `${baseName}.poc.txt`);

    // Compose a safe evidence PoC: reproduction steps and captured data
    const lines = [];
    lines.push(`ESPDRAGON SAFE EVIDENCE PoC`);
    lines.push(`Timestamp: ${out.timestamp || new Date().toISOString()}`);
    lines.push(`Target: ${out.target}`);
    if (out.normalized) lines.push(`Normalized URL: ${out.normalized}`);
    lines.push("");
    lines.push("Summary of findings (non-destructive):");
    if (out.dns) lines.push(`  DNS: ${JSON.stringify(out.dns)}`);
    if (out.tcp) lines.push(`  TCP: ${JSON.stringify(out.tcp)}`);
    if (out.http) {
      lines.push(`  HTTP status: ${out.http.status ?? "N/A"} ${out.http.statusText ?? ""}`);
      if (out.http.headers) {
        lines.push(`  HTTP headers:`);
        for (const [k,v] of Object.entries(out.http.headers)) {
          lines.push(`    ${k}: ${v}`);
        }
      }
      if (out.http.bodyPreview) {
        lines.push("");
        lines.push("  Body preview (first 2000 chars):");
        lines.push(out.http.bodyPreview.slice(0, 2000).replace(/\r/g,""));
      }
    }
    if (out.openapi) {
      lines.push("");
      lines.push(`OpenAPI discovered at ${out.openapi.url} (preview):`);
      lines.push(out.openapi.textPreview.slice(0, 2000));
    }
    if (out.robots) {
      lines.push("");
      lines.push("robots.txt content (preview):");
      lines.push((out.robots || "").slice(0, 2000));
    }

    lines.push("");
    lines.push("Safe reproduction steps (non-destructive):");
    lines.push(safeCurlExamples(out.normalized ?? out.target ?? "http://example.com"));
    lines.push("");
    lines.push("Notes:");
    lines.push("- This PoC contains only safe, read-only commands and captured publicly visible responses.");
    lines.push("- No exploit code or instructions to exploit vulnerabilities are provided.");
    lines.push("- Include this PoC text as an attachment in a responsible disclosure report to vendors or platforms.");
    lines.push("");

    fs.writeFileSync(pocPath, lines.join("\n"));
    return pocPath;
  } catch (err) {
    if (VERBOSE) console.error(grey(`[poc] write error: ${String(err)}`));
    return null;
  }
}

/* ---------- Scan routine ---------- */

async function scanTarget(rawTarget: string, resultsDir: string) {
  const idSafe = rawTarget.replace(/[^a-z0-9\-_\.]/gi, "_").slice(0, 120);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsPath = path.join(resultsDir, `${timestamp}_${idSafe}.json`);
  const reportPath = path.join(resultsDir, `${timestamp}_${idSafe}.txt`);
  const out: any = { target: rawTarget, timestamp: new Date().toISOString(), steps: [] };

  try {
    let urlCandidate = rawTarget;
    if (!/^[a-zA-Z]+:\/\//.test(rawTarget)) {
      urlCandidate = "http://" + rawTarget;
    }
    const url = new URL(urlCandidate);
    out.normalized = url.toString();

    // DNS
    const host = url.hostname;
    if (VERBOSE) console.error(grey(`[scan] Resolving DNS for ${host}`));
    const dnsRes = await resolveDNS(host);
    out.dns = dnsRes;
    out.steps.push({ name: "dns", result: dnsRes });

    // TCP connect to small set of common ports (safe & limited)
    const ports = [Number(url.port || (url.protocol === "https:" ? 443 : 80)), 80, 443, 8080, 8443];
    const uniquePorts = Array.from(new Set(ports.filter(Boolean)));
    out.tcp = {};
    for (const p of uniquePorts) {
      if (VERBOSE) console.error(grey(`[scan] TCP connect ${host}:${p}`));
      const r = await tcpConnect(host, p, 3000);
      out.tcp[String(p)] = r;
    }
    out.steps.push({ name: "tcp", result: out.tcp });

    // HTTP probe
    if (VERBOSE) console.error(grey(`[scan] HTTP GET ${url.toString()}`));
    const httpRes = await httpProbe(url.toString(), 8000);
    out.http = httpRes;
    out.steps.push({ name: "http", result: httpRes });

    // CORS summary
    const cors = {
      allowedOrigin: httpRes?.headers?.["access-control-allow-origin"] ?? null,
      allowCredentials: httpRes?.headers?.["access-control-allow-credentials"] ?? null
    };
    out.cors = cors;
    out.steps.push({ name: "cors", result: cors });

    // OpenAPI discovery
    const openapi = await discoverOpenApi(url.toString());
    out.openapi = openapi;
    out.steps.push({ name: "openapi", result: openapi });

    // robots.txt probe
    try {
      const robotsUrl = new URL("/robots.txt", url).toString();
      const r = await fetch(robotsUrl, { method: "GET" });
      if (r.ok) {
        out.robots = await r.text();
      } else {
        out.robots = null;
      }
      out.steps.push({ name: "robots", result: Boolean(out.robots) });
    } catch {
      out.robots = null;
    }

    // Save results JSON and text report
    fs.writeFileSync(resultsPath, JSON.stringify(out, null, 2));
    const pretty = [
      `ESPDRAGON SCAN REPORT - ${out.timestamp}`,
      `Target: ${rawTarget}`,
      `Normalized URL: ${out.normalized ?? ""}`,
      ``,
      `DNS: ${JSON.stringify(out.dns)}`,
      `TCP: ${JSON.stringify(out.tcp)}`,
      `HTTP Status: ${out.http?.status ?? "ERR"} ${out.http?.statusText ?? ""}`,
      `CORS: Origin=${out.cors?.allowedOrigin ?? "none"} Credentials=${out.cors?.allowCredentials ?? "none"}`,
      `OpenAPI: ${out.openapi ? `${out.openapi.path} (${out.openapi.url})` : "none discovered"}`,
      ``,
      `Saved JSON: ${resultsPath}`,
    ].join("\n");
    fs.writeFileSync(reportPath, pretty);

    // Create evidence PoC (safe)
    const pocPath = writeEvidencePoC(out, resultsDir, POC_NAME);
    return { ok: true, resultsPath, reportPath, pocPath, out };
  } catch (err) {
    const errObj = { ok: false, error: String(err) };
    try { fs.writeFileSync(resultsPath, JSON.stringify(errObj, null, 2)); } catch {}
    return errObj;
  }
}

/* ---------- Ollama call (LLM) ---------- */

async function callOllama(prompt: string) {
  if (!OLLAMA_PUBLIC_URL) {
    return { ok: false, error: "OLLAMA_PUBLIC_URL not set" };
  }
  try {
    const base = new URL(OLLAMA_PUBLIC_URL);
    const full = new URL(OLLAMA_API_PATH, base);
    if (OLLAMA_MODEL) full.searchParams.set("model", OLLAMA_MODEL);
    const payload = {
      prompt,
      max_tokens: Number(env.OLLAMA_MAX_TOKENS ?? 512),
      temperature: Number(env.OLLAMA_TEMPERATURE ?? 0.2),
    };
    if (DRY_RUN) return { ok: true, status: 204, simulated: true, result: `--DRY-RUN-- prompt: ${prompt}` };
    const res = await fetch(full.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.OLLAMA_API_KEY ? { Authorization: `Bearer ${env.OLLAMA_API_KEY}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const json = await res.json();
      return { ok: res.ok, status: res.status, result: json };
    } else {
      const text = await res.text();
      return { ok: res.ok, status: res.status, result: text };
    }
  } catch (err) {
    return { ok: false, status: 500, error: String(err) };
  }
}

/* ---------- Main ---------- */

async function main() {
  printHeader();

  const { baseDir, resultsDir, historyPath } = ensureWorkspace(DEFAULT_RESULTS_DIR);
  if (INIT_WORKSPACE) {
    if (!AUTHORIZED) {
      console.error(red("[ERR] Workspace init requires confirmation. Use --confirm or set ESPDRAGON_AUTHORIZED=yes"));
      process.exit(2);
    }
    const gitOk = initWorkspaceGit(baseDir);
    console.log(gitOk ? grey("[OK] .espdragon workspace initialized and tracked with git (if available)") : grey("[OK] .espdragon workspace initialized"));
    appendHistory({ action: "init_workspace", timestamp: new Date().toISOString(), git: gitOk });
  }

  const stdinPrompt = await readStdin();
  const finalPrompt = PROMPT_ARG ?? (stdinPrompt || undefined);

  if (finalPrompt) {
    if (!OLLAMA_PUBLIC_URL) {
      console.error(red("[ERR] OLLAMA_PUBLIC_URL must be set to use LLM prompt mode."));
    } else {
      printPrompt(finalPrompt);
      const llmRes = await callOllama(finalPrompt);
      let messageStr = "";
      if (!llmRes.ok) {
        console.error(red(`[ERR] LLM call failed: ${llmRes.error ?? JSON.stringify(llmRes)}`));
      } else {
        if (llmRes.simulated) messageStr = String(llmRes.result);
        else if (typeof llmRes.result === "string") messageStr = llmRes.result;
        else if (typeof llmRes.result === "object") {
          if (typeof llmRes.result.text === "string") messageStr = llmRes.result.text;
          else if (Array.isArray(llmRes.result.generations) && llmRes.result.generations[0]?.text) messageStr = llmRes.result.generations[0].text;
          else messageStr = JSON.stringify(llmRes.result, null, 2);
        }
        printLLMMessage("assistant", red(messageStr));
        appendHistory({ action: "llm_prompt", timestamp: new Date().toISOString(), prompt: finalPrompt, response: messageStr });
      }
    }
  }

  if (SCAN_ARG) {
    if (!AUTHORIZED) {
      console.error(red("[ERR] Scanning requires explicit confirmation. Pass --confirm or set ESPDRAGON_AUTHORIZED=yes"));
      process.exit(2);
    }
    let targets: string[] = [];
    if (fs.existsSync(SCAN_ARG) && fs.statSync(SCAN_ARG).isFile()) {
      const txt = fs.readFileSync(SCAN_ARG, "utf8");
      targets = txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    } else {
      targets = SCAN_ARG.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (targets.length === 0) {
      console.error(red("[ERR] No targets provided to --scan"));
      process.exit(2);
    }
    console.log(grey(`[scan] Running non-destructive reconnaissance for ${targets.length} targets...`));
    appendHistory({ action: "scan_start", timestamp: new Date().toISOString(), targets, poc_name: POC_NAME });

    for (const target of targets) {
      try {
        console.log(cyan(`[scan] Scanning: ${target}`));
        const res = await scanTarget(target, resultsDir);
        if (res.ok) {
          console.log(grey(`[scan] Saved JSON: ${res.resultsPath}`));
          if (res.pocPath) console.log(grey(`[scan] Evidence PoC: ${res.pocPath}`));
          appendHistory({ action: "scan_result", timestamp: new Date().toISOString(), target, resultsPath: res.resultsPath, pocPath: res.pocPath });
        } else {
          console.error(red(`[scan] Error scanning ${target}: ${res.error}`));
          appendHistory({ action: "scan_error", timestamp: new Date().toISOString(), target, error: res.error });
        }
      } catch (err) {
        console.error(red(`[scan] Unexpected error for ${target}: ${String(err)}`));
        appendHistory({ action: "scan_exception", timestamp: new Date().toISOString(), target, error: String(err) });
      }
    }
    console.log(grey(`[scan] Completed.`));
  }

  if (!finalPrompt && !SCAN_ARG && !INIT_WORKSPACE) {
    console.log(grey("No prompt, scan, or workspace init requested. Run with --help for options."));
  }
}

await main();
