/**
 * Format violations into terminal, markdown, or JSON output.
 */

const CATEGORY_LABEL = { color: "Color", spacing: "Spacing", font: "Font Size", radius: "Radius" };
const CATEGORY_ICON = { color: "🎨", spacing: "📏", font: "🔤", radius: "◐" };

export function formatTerminal(violations) {
  if (!violations.length) return "\n  ✅ No hardcoded values found. Your codebase is clean!\n";

  const grouped = groupByFile(violations);
  const lines = ["\n"];

  for (const [file, items] of grouped) {
    lines.push(`  ${file}`);
    for (const v of items) {
      const arrow = v.suggestion ? ` → ${v.suggestion}` : "";
      lines.push(`    L${v.line}:${v.col}  ${v.raw}${arrow}  (${CATEGORY_LABEL[v.category]})`);
    }
    lines.push("");
  }

  const stats = computeStats(violations);
  lines.push("  ─────────────────────────────────");
  lines.push(`  Total: ${violations.length} hardcoded values in ${grouped.size} files`);
  lines.push(`  Colors: ${stats.color}  Spacing: ${stats.spacing}  Fonts: ${stats.font}  Radius: ${stats.radius}`);
  lines.push(`  Fixable (token match found): ${stats.fixable} of ${violations.length}`);
  lines.push("");

  return lines.join("\n");
}

export function formatMarkdown(violations) {
  if (!violations.length) return "# ds-lint Report\n\n✅ No hardcoded values found.\n";

  const grouped = groupByFile(violations);
  const stats = computeStats(violations);
  const lines = [
    "# ds-lint Report\n",
    `**${violations.length}** hardcoded values in **${grouped.size}** files\n`,
    `| Category | Count |`,
    `|----------|-------|`,
    `| Color | ${stats.color} |`,
    `| Spacing | ${stats.spacing} |`,
    `| Font Size | ${stats.font} |`,
    `| Radius | ${stats.radius} |`,
    `| **Fixable** | **${stats.fixable}** |`,
    "",
  ];

  for (const [file, items] of grouped) {
    lines.push(`## ${file}\n`);
    lines.push("| Line | Value | Suggestion | Category |");
    lines.push("|------|-------|------------|----------|");
    for (const v of items) {
      const sug = v.suggestion || "—";
      lines.push(`| ${v.line}:${v.col} | \`${v.raw}\` | \`${sug}\` | ${CATEGORY_LABEL[v.category]} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function formatJSON(violations) {
  const stats = computeStats(violations);
  return JSON.stringify({ total: violations.length, stats, violations }, null, 2);
}

function groupByFile(violations) {
  const map = new Map();
  for (const v of violations) {
    if (!map.has(v.file)) map.set(v.file, []);
    map.get(v.file).push(v);
  }
  return map;
}

function computeStats(violations) {
  const s = { color: 0, spacing: 0, font: 0, radius: 0, fixable: 0 };
  for (const v of violations) {
    s[v.category] = (s[v.category] || 0) + 1;
    if (v.suggestion) s.fixable++;
  }
  return s;
}
