// scripts/audit/runtime-audit.mjs
import { spawn } from "node:child_process";

const PORT = Number(process.env.AUDIT_PORT || 3100);
const BASE = `http://127.0.0.1:${PORT}`;

const CMD = process.platform === "win32" ? "npx.cmd" : "npx";
const NEXT_ARGS = ["next", "dev", "-p", String(PORT), "--hostname", "127.0.0.1"];

const BANNED_SECRETS = [
  /ghp_[A-Za-z0-9]{20,}/,                 // classic GitHub PAT
  /github_pat_[A-Za-z0-9_]{20,}/,         // fine-grained PAT
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/,   // PEM
  /\bAKIA[0-9A-Z]{16}\b/,                 // AWS access key
];

function fail(msg) {
  console.error(`RUNTIME_AUDIT_FAILED: ${msg}`);
  process.exit(1);
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { accept: "*/*" },
    cache: "no-store",
  });
  const text = await res.text();
  return { res, text };
}

function assertNoSecrets(text, where) {
  for (const re of BANNED_SECRETS) {
    if (re.test(text)) fail(`${where}: secret pattern matched: ${re}`);
  }
}

function isRepoLike(obj) {
  if (!obj || typeof obj !== "object") return false;
  const keys = Object.keys(obj);
  return (
    keys.includes("private") ||
    keys.includes("visibility") ||
    keys.includes("full_name") ||
    keys.includes("repoName") ||
    keys.includes("html_url") ||
    keys.includes("default_branch") ||
    keys.includes("stargazers_count")
  );
}

function assertNoPrivateRepoLeak(json) {
  const stack = [{ v: json, p: "$" }];

  while (stack.length) {
    const { v, p } = stack.pop();

    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) stack.push({ v: v[i], p: `${p}[${i}]` });
      continue;
    }

    if (v && typeof v === "object") {
      if (isRepoLike(v)) {
        const priv =
          v.private === true ||
          v.isPrivate === true ||
          v.visibility === "private";

        if (priv) {
          const badStringFields = ["name", "full_name", "repoName", "description"];
          for (const k of badStringFields) {
            if (typeof v[k] === "string" && v[k].trim() !== "") {
              fail(`private repo leak at ${p}.${k}: non-empty string`);
            }
          }

          const badArrayFields = ["recentMessages", "adrFiles", "commitMessages", "messages"];
          for (const k of badArrayFields) {
            if (Array.isArray(v[k]) && v[k].length > 0) {
              fail(`private repo leak at ${p}.${k}: non-empty array`);
            }
          }

          for (const [k, val] of Object.entries(v)) {
            if (/(commit|message)/i.test(k) && typeof val === "string" && val.trim() !== "") {
              fail(`private repo leak at ${p}.${k}: non-empty commit/message`);
            }
          }
        }
      }

      for (const [k, val] of Object.entries(v)) {
        stack.push({ v: val, p: `${p}.${k}` });
      }
    }
  }
}

async function waitServer() {
  for (let i = 0; i < 180; i++) {
    try {
      const r = await fetch(`${BASE}/`, { cache: "no-store" });
      if (r.ok) return;
    } catch {}
    await sleep(250);
  }
  fail("server did not become ready");
}

function stopServer(child) {
  if (!child || child.killed) return;
  child.kill("SIGINT");
}

(async () => {
  const child = spawn(CMD, NEXT_ARGS, {
    stdio: "pipe",
    shell: process.platform === "win32",
    env: { ...process.env, NODE_ENV: "development" },
  });

  let logs = "";
  child.stdout.on("data", (d) => (logs += d.toString()));
  child.stderr.on("data", (d) => (logs += d.toString()));

  try {
    await waitServer();

    // 1) apple-touch-icon must be served
    {
      const { res, text } = await fetchText("/apple-touch-icon.png");
      if (!res.ok) fail(`/apple-touch-icon.png status ${res.status}`);
      assertNoSecrets(text, "/apple-touch-icon.png");
      console.log(`  OK /apple-touch-icon.png → ${res.status}`);
    }

    // 2) robots must exist and contain Sitemap
    {
      const { res, text } = await fetchText("/robots.txt");
      if (!res.ok) fail(`/robots.txt status ${res.status}`);
      assertNoSecrets(text, "/robots.txt");
      if (!/User-agent:/i.test(text)) fail("/robots.txt missing User-agent");
      if (!/Sitemap:/i.test(text)) fail("/robots.txt missing Sitemap");
      console.log(`  OK /robots.txt → ${res.status}`);
    }

    // 3) sitemap must exist and be XML urlset
    {
      const { res, text } = await fetchText("/sitemap.xml");
      if (!res.ok) fail(`/sitemap.xml status ${res.status}`);
      assertNoSecrets(text, "/sitemap.xml");
      if (!/<urlset\b/i.test(text)) fail("/sitemap.xml missing <urlset>");
      if (!/<loc>https?:\/\/[^<]+<\/loc>/i.test(text)) fail("/sitemap.xml missing <loc> URLs");
      console.log(`  OK /sitemap.xml → ${res.status}`);
    }

    // 4) homepage must embed JSON-LD Person
    {
      const { res, text } = await fetchText("/");
      if (!res.ok) fail(`/ status ${res.status}`);
      assertNoSecrets(text, "/");
      if (!/application\/ld\+json/i.test(text)) fail("homepage missing application/ld+json");
      if (!/"@type"\s*:\s*"Person"/i.test(text)) fail("homepage JSON-LD missing @type Person");
      console.log(`  OK / → ${res.status} (JSON-LD Person present)`);
    }

    // 5) /api/audit must not leak anything sensitive
    {
      const { res, text } = await fetchText("/api/audit");
      assertNoSecrets(text, "/api/audit");

      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          fail("/api/audit returned invalid JSON");
        }

        if (!res.ok) {
          const hasRepoKeys =
            (json && typeof json === "object" && ("repos" in json || "repositories" in json)) ||
            /"repos"\s*:|"repositories"\s*:/i.test(text);
          if (hasRepoKeys) fail("/api/audit error response includes repos/repositories");
        }

        if (res.ok) assertNoPrivateRepoLeak(json);
      } else {
        if (!res.ok && /repos|repositories|commit|message/i.test(text)) {
          fail("/api/audit non-JSON error contains repo/commit/message tokens");
        }
      }
      console.log(`  OK /api/audit → ${res.status} (no secrets / no private repo leak)`);
    }

    console.log("RUNTIME_AUDIT_OK");
  } finally {
    stopServer(child);
  }
})();
