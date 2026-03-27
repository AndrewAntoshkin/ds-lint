import { readFileSync, existsSync } from "node:fs";
import { resolve, extname } from "node:path";

/**
 * Load token definitions from various sources.
 * Returns { colors: Map<value, name>, spacing: Map<value, name>, fonts: Map<value, name>, radii: Map<value, name> }
 */
export function loadTokens(source) {
  if (!source) return defaultTokens();
  const p = resolve(source);
  if (!existsSync(p)) {
    console.error(`Token source not found: ${p}`);
    return defaultTokens();
  }
  const ext = extname(p).toLowerCase();
  const raw = readFileSync(p, "utf8");

  if (ext === ".css") return parseCSS(raw);
  if (ext === ".json") return parseJSON(raw);
  if (ext === ".md") return parseMD(raw);
  console.error(`Unsupported token format: ${ext} (use .css, .json, or .md)`);
  return defaultTokens();
}

function defaultTokens() {
  return { colors: new Map(), spacing: new Map(), fonts: new Map(), radii: new Map() };
}

function normalize(v) {
  return v.trim().toLowerCase();
}

function parseCSS(raw) {
  const tokens = defaultTokens();
  const varRegex = /--([\w-]+)\s*:\s*([^;]+)/g;
  let m;
  while ((m = varRegex.exec(raw)) !== null) {
    const name = `var(--${m[1]})`;
    const val = normalize(m[2]);
    categorize(tokens, name, val);
  }
  return tokens;
}

function parseJSON(raw) {
  const tokens = defaultTokens();
  try {
    const obj = JSON.parse(raw);
    walkJSON(tokens, obj, []);
  } catch { /* ignore parse errors */ }
  return tokens;
}

function walkJSON(tokens, obj, path) {
  if (obj && typeof obj === "object" && "$value" in obj) {
    const name = path.join(".");
    categorize(tokens, name, normalize(String(obj.$value)));
    return;
  }
  if (obj && typeof obj === "object" && "value" in obj && typeof obj.value === "string") {
    const name = path.join(".");
    categorize(tokens, name, normalize(String(obj.value)));
    return;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      walkJSON(tokens, v, [...path, k]);
    }
  }
}

function parseMD(raw) {
  const tokens = defaultTokens();
  const lines = raw.split("\n");
  for (const line of lines) {
    const cells = line.split("|").map(c => c.trim()).filter(Boolean);
    if (cells.length >= 2) {
      const name = cells[0];
      for (let i = 1; i < cells.length; i++) {
        const val = normalize(cells[i]);
        if (val.startsWith("#") || val.match(/^\d+px$/) || val.match(/^\d+rem$/)) {
          categorize(tokens, name, val);
        }
      }
    }
  }
  return tokens;
}

function categorize(tokens, name, val) {
  if (val.startsWith("#") || val.startsWith("rgb") || val.startsWith("hsl")) {
    tokens.colors.set(val, name);
  } else if (val.match(/^\d+(\.\d+)?px$/) || val.match(/^\d+(\.\d+)?rem$/)) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("radius") || nameLower.includes("round") || nameLower.includes("corner")) {
      tokens.radii.set(val, name);
    } else if (nameLower.includes("font") || nameLower.includes("text") || nameLower.includes("size")) {
      tokens.fonts.set(val, name);
    } else {
      tokens.spacing.set(val, name);
    }
  }
}
