import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { scanFile } from "../lib/scanner.js";

const TMP = join(import.meta.dirname, "__tmp_lint");

function write(name, content) {
  const p = join(TMP, name);
  writeFileSync(p, content);
  return p;
}

const emptyTokens = { colors: new Map(), spacing: new Map(), fonts: new Map(), radii: new Map() };

describe("scanFile", () => {
  before(() => mkdirSync(TMP, { recursive: true }));
  after(() => rmSync(TMP, { recursive: true, force: true }));

  it("detects hex colors", () => {
    const f = write("hex.css", `body { color: #ff0000; background: #00f; }`);
    const v = scanFile(f, emptyTokens);
    const colors = v.filter(x => x.category === "color");
    assert.ok(colors.length >= 2, `Expected at least 2 color violations, got ${colors.length}`);
  });

  it("detects rgb colors", () => {
    const f = write("rgb.css", `.btn { color: rgb(255, 0, 0); background: rgba(0,0,0,0.5); }`);
    const v = scanFile(f, emptyTokens);
    const colors = v.filter(x => x.category === "color");
    assert.ok(colors.length >= 2);
  });

  it("detects hardcoded spacing", () => {
    const f = write("spacing.css", `.card { padding: 16px; margin: 8px; gap: 12px; }`);
    const v = scanFile(f, emptyTokens);
    const spacing = v.filter(x => x.category === "spacing");
    assert.ok(spacing.length >= 3, `Expected 3 spacing violations, got ${spacing.length}`);
  });

  it("detects font sizes", () => {
    const f = write("font.css", `h1 { font-size: 32px; line-height: 1.5rem; }`);
    const v = scanFile(f, emptyTokens);
    const fonts = v.filter(x => x.category === "font");
    assert.ok(fonts.length >= 1);
  });

  it("detects border-radius", () => {
    const f = write("radius.css", `.btn { border-radius: 8px; }`);
    const v = scanFile(f, emptyTokens);
    const radii = v.filter(x => x.category === "radius");
    assert.equal(radii.length, 1);
  });

  it("ignores CSS variable declarations", () => {
    const f = write("vars.css", `:root { --color-primary: #3b82f6; --space-4: 16px; }`);
    const v = scanFile(f, emptyTokens);
    assert.equal(v.length, 0);
  });

  it("ignores lines with ds-lint-ignore comment", () => {
    const f = write("ignore.css", `/* ds-lint-ignore */\n.x { color: #ff0000; }`);
    const v = scanFile(f, emptyTokens);
    assert.equal(v.length, 0);
  });

  it("skips 0px values", () => {
    const f = write("zero.css", `.x { padding: 0px; margin: 0px; }`);
    const v = scanFile(f, emptyTokens);
    assert.equal(v.length, 0);
  });

  it("suggests token replacement when available", () => {
    const tokens = {
      colors: new Map([["#3b82f6", "var(--color-primary)"]]),
      spacing: new Map([["16px", "var(--space-4)"]]),
      fonts: new Map(),
      radii: new Map(),
    };
    const f = write("suggest.css", `.btn { color: #3b82f6; padding: 16px; }`);
    const v = scanFile(f, tokens);
    const colorV = v.find(x => x.category === "color");
    assert.equal(colorV?.suggestion, "var(--color-primary)");
    const spacingV = v.find(x => x.category === "spacing");
    assert.equal(spacingV?.suggestion, "var(--space-4)");
  });

  it("handles JSX/TSX files", () => {
    const f = write("comp.tsx", `const Btn = () => <div style={{ color: "#ff0000", padding: "12px" }}>Hi</div>;`);
    const v = scanFile(f, emptyTokens);
    assert.ok(v.length >= 1);
  });

});
