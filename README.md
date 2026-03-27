# ds-lint

Scan your codebase for hardcoded colors, spacing, font sizes, and border-radius values that should use design tokens.

74% of React components contain hardcoded values that bypass design systems ([source](https://www.replay.build/blog/the-essential-guide-to-managing-design-token-drift-in-2026)). ds-lint finds them.

## Install

```bash
npm i -g ds-lint
# or run directly
npx ds-lint src/
```

## Usage

```bash
# Scan a directory
ds-lint src/

# Scan with token definitions (suggests replacements)
ds-lint src/ --tokens tokens.css

# Output as markdown
ds-lint src/ --format markdown --out report.md

# Fail in CI if violations found
ds-lint src/ --tokens tokens.css --strict
```

## What it detects

| Category | Patterns |
|----------|----------|
| **Colors** | `#hex`, `rgb()`, `rgba()`, `hsl()`, `hsla()`, named CSS colors |
| **Spacing** | `padding`, `margin`, `gap`, `top/right/bottom/left`, `width/height` in `px`/`rem` |
| **Font sizes** | `font-size`, `line-height`, `letter-spacing` in `px`/`rem` |
| **Radius** | `border-radius` in `px`/`rem` |

## Token sources

Provide a token file with `--tokens` to get replacement suggestions:

- **CSS** — reads `--custom-property` declarations
- **JSON** — reads `{ "$value": "..." }` or `{ "value": "..." }` format (DTCG compatible)
- **Markdown** — reads tables from `figma-to-design-md` output

## Inline ignore

```css
/* ds-lint-ignore */
.special { color: #ff0000; }
```

## Output formats

- `terminal` (default) — colored terminal output
- `markdown` — table format for PRs and docs
- `json` — machine-readable for CI pipelines

## Pipeline

```
design-system-ai-starter → define tokens
figma-to-design-md       → extract from Figma
ds-lint                  → enforce in code ← you are here
ds-coverage              → measure adoption
ds-health                → check live site
```

## License

MIT
