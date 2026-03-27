#!/usr/bin/env node

import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { walkDir } from "../lib/walk.js";
import { scanFile } from "../lib/scanner.js";
import { loadTokens } from "../lib/tokens.js";
import { formatTerminal, formatMarkdown, formatJSON } from "../lib/reporter.js";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
  ds-lint — Scan for hardcoded design values

  Usage:
    ds-lint [path] [options]

  Options:
    --tokens <file>    Token source (.css, .json, or .md)
    --format <type>    Output: terminal (default), markdown, json
    --out <file>       Write report to file
    --strict           Exit with code 1 if violations found
    --version          Print version
    --help             Print this help

  Examples:
    ds-lint src/
    ds-lint src/ --tokens tokens.css
    ds-lint . --format markdown --out report.md
    ds-lint src/ --tokens design-tokens.json --strict
`);
  process.exit(0);
}

if (args.includes("--version")) {
  const pkg = JSON.parse((await import("node:fs")).readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  console.log(pkg.version);
  process.exit(0);
}

const targetIdx = args.findIndex(a => !a.startsWith("-"));
const target = targetIdx >= 0 ? resolve(args[targetIdx]) : resolve(".");

const tokensIdx = args.indexOf("--tokens");
const tokensPath = tokensIdx >= 0 ? args[tokensIdx + 1] : null;

const formatIdx = args.indexOf("--format");
const format = formatIdx >= 0 ? args[formatIdx + 1] : "terminal";

const outIdx = args.indexOf("--out");
const outPath = outIdx >= 0 ? args[outIdx + 1] : null;

const strict = args.includes("--strict");

if (!existsSync(target)) {
  console.error(`Path not found: ${target}`);
  process.exit(1);
}

const tokens = loadTokens(tokensPath);
const files = walkDir(target);

if (!files.length) {
  console.log("No source files found.");
  process.exit(0);
}

console.log(`Scanning ${files.length} files...`);

const allViolations = [];
for (const f of files) {
  try {
    const v = scanFile(f, tokens);
    allViolations.push(...v);
  } catch (e) {
    // skip unreadable files
  }
}

let output;
if (format === "markdown" || format === "md") output = formatMarkdown(allViolations);
else if (format === "json") output = formatJSON(allViolations);
else output = formatTerminal(allViolations);

if (outPath) {
  writeFileSync(resolve(outPath), output, "utf8");
  console.log(`Report written to ${outPath}`);
} else {
  console.log(output);
}

if (strict && allViolations.length > 0) {
  process.exit(1);
}
