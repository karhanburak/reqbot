import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const URL = process.env.TARGET_URL || "https://video-streaming-platform-plxz.vercel.app/";
const INTERVAL_MS = Number(process.env.INTERVAL_MS || 30000);
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 10000);
const JITTER_MS = Number(process.env.JITTER_MS || 0);

let timer = null;
let counter = 0;

function now() {
  return new Date().toISOString();
}

async function hit() {
  const start = Date.now();
  try {
    const res = await axios.get(URL, {
      timeout: TIMEOUT_MS,
      headers: {
        "User-Agent": "periodic-get-bot/1.0 (+https://example.local)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Cache-Control": "no-cache",
      }
    });

    const dur = Date.now() - start;
    console.log(`[${now()}] #${++counter} -> ${res.status} ${res.statusText} in ${dur}ms`);
  } catch (err) {
    const dur = Date.now() - start;
    const status = err.response?.status;
    const code = err.code || "UNKNOWN_ERR";
    console.error(
      `[${now()}] #${++counter} -> ERROR ${status ?? ""} (${code}) in ${dur}ms: ${err.message}`
    );
  } finally {
    scheduleNext();
  }
}

function scheduleNext() {
  const jitter = JITTER_MS ? Math.floor((Math.random() * 2 - 1) * JITTER_MS) : 0;
  const delay = Math.max(0, INTERVAL_MS + jitter);
  clearTimeout(timer);
  timer = setTimeout(hit, delay);
}

function start() {
  console.log(`Starting periodic GETs:
  URL          : ${URL}
  INTERVAL_MS  : ${INTERVAL_MS} ${JITTER_MS ? `(±${JITTER_MS} jitter)` : ""}
  TIMEOUT_MS   : ${TIMEOUT_MS}
  Press Ctrl+C to stop.
  `);
  hit(); // ilk isteği hemen at
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nStopping...");
  clearTimeout(timer);
  process.exit(0);
});

start();
