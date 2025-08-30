import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const URL = process.env.TARGET_URL || "https://video-streaming-platform-plxz.vercel.app/";
const INTERVAL_MS = Number(process.env.INTERVAL_MS || 600000);

let timer = null;
let counter = 0;

function now() {
  return new Date().toISOString();
}

async function hit() {
  const start = Date.now();
  try {
    const res = await axios.get(URL, { timeout: 10000 });
    const dur = Date.now() - start;
    console.log(`[${now()}] #${++counter} -> ${res.status} ${res.statusText} in ${dur}ms`);
  } catch (err) {
    console.error(`[${now()}] ERROR: ${err.message}`);
  } finally {
    scheduleNext();
  }
}

function scheduleNext() {
  clearTimeout(timer);
  timer = setTimeout(hit, INTERVAL_MS);
}

export function startBot() {
  console.log(`reqbot started. Target: ${URL}, Interval: ${INTERVAL_MS}ms`);
  hit();
  process.on("SIGINT", () => {
    console.log("\nreqbot stopped.");
    clearTimeout(timer);
    process.exit(0);
  });
}
