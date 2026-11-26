// One-sentence absurd invention pitch: the Snooze Pillow.
//
// The program writes the chosen pitch to <MAKEFUN_OUTPUT_DIR>/entry.txt
// and validates it against the competition gate BEFORE writing, so a
// would-be-invalid entry fails loudly here instead of silently scoring
// Valid 0 on the server.
//
// Gate (from RULES.txt / competition.yaml):
//   /output/entry.txt is UTF-8 text of 1 to 220 characters, not only
//   whitespace. Only a valid entry goes before the judge.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "The Snooze Pillow detects your alarm, swallows it whole, and lets you sleep in while politely lying to your boss in a voice that sounds exactly like you.";

// Count characters as the gate does: Unicode code points, not bytes.
// (For this ASCII-only entry the two agree, but code points are the
// correct measure for the "1 to 220 characters" rule.)
const charCount = [...ENTRY].length;

// Validate the entry against every part of the gate, and fail loudly
// with a specific reason if any check fails.
const failures: string[] = [];

if (charCount < 1 || charCount > 220) {
  failures.push(`length ${charCount} characters is outside the 1-220 gate`);
}

if (ENTRY.trim().length === 0) {
  failures.push("entry is only whitespace");
}

if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  failures.push("entry is not a single line (contains a line break)");
}

const roundTripped = Buffer.from(ENTRY, "utf8").toString("utf8");
if (roundTripped !== ENTRY) {
  failures.push("entry does not survive a UTF-8 encode/decode round trip");
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`GATE FAIL: ${failure}`);
  }
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
// Write the entry exactly as validated: no trailing newline, no
// trailing space, no byte added or removed.
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
console.error(
  `gate OK: ${charCount} characters, 1 line, UTF-8 round trip clean`,
);
