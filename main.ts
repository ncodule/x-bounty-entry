// Entry program for the X promotion bounty.
// The actual entry is a public post on X; this file only hands
// its address to the grader by copying POST.json into the output
// folder, byte for byte, so the house can read the post itself.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const sourceDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const targetDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const inputPath = join(sourceDir, "POST.json");
const outputPath = join(targetDir, "POST.json");

let payload: Buffer;
try {
  payload = readFileSync(inputPath);
} catch {
  console.error("POST.json is missing from the entry folder.");
  process.exit(1);
}

// Fail loudly here rather than handing the grader a file it
// cannot use: the JSON must parse and name an X status address.
let parsed: unknown;
try {
  parsed = JSON.parse(payload.toString("utf8"));
} catch {
  console.error("POST.json does not contain valid JSON.");
  process.exit(1);
}
const urlValue =
  parsed !== null && typeof parsed === "object" && "url" in parsed
    ? (parsed as { url: unknown }).url
    : undefined;
if (typeof urlValue !== "string" || !/^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+/.test(urlValue)) {
  console.error("POST.json must hold an https X status address in its url field.");
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });
writeFileSync(outputPath, payload);
