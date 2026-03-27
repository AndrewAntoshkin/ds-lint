import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { loadTokens } from "../lib/tokens.js";

const TMP = join(import.meta.dirname, "__tmp_tokens");

describe("loadTokens", () => {
  before(() => mkdirSync(TMP, { recursive: true }));
  after(() => rmSync(TMP, { recursive: true, force: true }));

  it("parses CSS custom properties", () => {
    const p = join(TMP, "tokens.css");
    writeFileSync(p, `:root {\n  --color-primary: #3b82f6;\n  --space-4: 16px;\n  --radius-md: 8px;\n  --text-sm: 14px;\n}`);
    const t = loadTokens(p);
    assert.ok(t.colors.has("#3b82f6"));
    assert.ok(t.spacing.has("16px"));
    assert.ok(t.radii.has("8px"));
  });

  it("parses JSON tokens with $value format", () => {
    const p = join(TMP, "tokens.json");
    writeFileSync(p, JSON.stringify({
      color: { primary: { $value: "#3b82f6" } },
      space: { sm: { $value: "8px" } },
    }));
    const t = loadTokens(p);
    assert.ok(t.colors.has("#3b82f6"));
    assert.ok(t.spacing.has("8px"));
  });

  it("parses JSON tokens with value format", () => {
    const p = join(TMP, "tokens2.json");
    writeFileSync(p, JSON.stringify({
      color: { primary: { value: "#ff0000" } },
    }));
    const t = loadTokens(p);
    assert.ok(t.colors.has("#ff0000"));
  });

  it("returns empty maps for missing file", () => {
    const t = loadTokens("/nonexistent/tokens.css");
    assert.equal(t.colors.size, 0);
    assert.equal(t.spacing.size, 0);
  });

  it("returns empty maps for null source", () => {
    const t = loadTokens(null);
    assert.equal(t.colors.size, 0);
  });

});
