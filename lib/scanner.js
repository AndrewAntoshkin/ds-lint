import { readFileSync } from "node:fs";
import {
  HEX_3, HEX_4, HEX_6, HEX_8, RGB, HSL,
  SPACING_PROPS, FONT_PROPS, RADIUS_PROPS,
  IGNORE_COMMENT, NAMED_COLORS,
} from "./patterns.js";

/**
 * Scan a single file and return an array of violations.
 * Each violation: { file, line, col, raw, category, suggestion }
 */
export function scanFile(filePath, tokens) {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const violations = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : "";

    if (IGNORE_COMMENT.test(line) || IGNORE_COMMENT.test(prevLine)) continue;
    if (isCommentLine(line)) continue;

    findColors(line, i + 1, filePath, tokens, violations);
    findSpacing(line, i + 1, filePath, tokens, violations);
    findFonts(line, i + 1, filePath, tokens, violations);
    findRadii(line, i + 1, filePath, tokens, violations);
  }

  return violations;
}

function isCommentLine(line) {
  const t = line.trim();
  return t.startsWith("//") || t.startsWith("/*") || t.startsWith("*") || t.startsWith("<!--");
}

function findColors(line, lineNum, file, tokens, out) {
  if (isVarDeclaration(line)) return;

  const colorPatterns = [HEX_8, HEX_6, HEX_4, HEX_3, RGB, HSL];
  for (const pat of colorPatterns) {
    pat.lastIndex = 0;
    let m;
    while ((m = pat.exec(line)) !== null) {
      const raw = m[0];
      const suggestion = findNearest(raw.toLowerCase(), tokens.colors);
      out.push({ file, line: lineNum, col: m.index + 1, raw, category: "color", suggestion });
    }
  }

  const words = line.match(/(?:color|background|fill|stroke|border)[\s:]*(\w+)/gi);
  if (words) {
    for (const w of words) {
      const parts = w.split(/[\s:]+/);
      const val = parts[parts.length - 1]?.toLowerCase();
      if (val && NAMED_COLORS.has(val)) {
        const idx = line.toLowerCase().lastIndexOf(val);
        const suggestion = findNearest(val, tokens.colors);
        out.push({ file, line: lineNum, col: idx + 1, raw: val, category: "color", suggestion });
      }
    }
  }
}

function findSpacing(line, lineNum, file, tokens, out) {
  if (isVarDeclaration(line)) return;
  for (const prop of SPACING_PROPS) {
    const re = new RegExp(`${prop}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)(px|rem)`, "gi");
    let m;
    while ((m = re.exec(line)) !== null) {
      const raw = `${m[1]}${m[2]}`;
      if (raw === "0px" || raw === "0rem") continue;
      const suggestion = findNearest(raw.toLowerCase(), tokens.spacing);
      out.push({ file, line: lineNum, col: m.index + 1, raw, category: "spacing", suggestion });
    }
  }
}

function findFonts(line, lineNum, file, tokens, out) {
  if (isVarDeclaration(line)) return;
  for (const prop of FONT_PROPS) {
    const re = new RegExp(`${prop}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)(px|rem)`, "gi");
    let m;
    while ((m = re.exec(line)) !== null) {
      const raw = `${m[1]}${m[2]}`;
      const suggestion = findNearest(raw.toLowerCase(), tokens.fonts);
      out.push({ file, line: lineNum, col: m.index + 1, raw, category: "font", suggestion });
    }
  }
}

function findRadii(line, lineNum, file, tokens, out) {
  if (isVarDeclaration(line)) return;
  for (const prop of RADIUS_PROPS) {
    const re = new RegExp(`${prop}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)(px|rem)`, "gi");
    let m;
    while ((m = re.exec(line)) !== null) {
      const raw = `${m[1]}${m[2]}`;
      if (raw === "0px" || raw === "0rem") continue;
      const suggestion = findNearest(raw.toLowerCase(), tokens.radii);
      out.push({ file, line: lineNum, col: m.index + 1, raw, category: "radius", suggestion });
    }
  }
}

function isVarDeclaration(line) {
  return /--[\w-]+\s*:/.test(line) || /var\(--[\w-]+\)/.test(line);
}

function findNearest(value, tokenMap) {
  if (!tokenMap.size) return null;
  const exact = tokenMap.get(value);
  if (exact) return exact;

  const numVal = parseFloat(value);
  if (isNaN(numVal)) return null;

  let closest = null;
  let minDist = Infinity;
  for (const [tv, tn] of tokenMap) {
    const tvNum = parseFloat(tv);
    if (isNaN(tvNum)) continue;
    const d = Math.abs(tvNum - numVal);
    if (d < minDist) { minDist = d; closest = tn; }
  }
  return minDist <= numVal * 0.3 ? closest : null;
}
