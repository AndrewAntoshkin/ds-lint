/**
 * Regex patterns for detecting hardcoded design values in source code.
 * Each pattern returns matches with value and context.
 */

const HEX_3 = /#[0-9a-fA-F]{3}(?![0-9a-fA-F])/g;
const HEX_4 = /#[0-9a-fA-F]{4}(?![0-9a-fA-F])/g;
const HEX_6 = /#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g;
const HEX_8 = /#[0-9a-fA-F]{8}(?![0-9a-fA-F])/g;
const RGB = /rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*[\d.]+)?\s*\)/g;
const HSL = /hsla?\(\s*\d{1,3}\s*,\s*[\d.]+%\s*,\s*[\d.]+%(?:\s*,\s*[\d.]+)?\s*\)/g;

const SPACING_PROPS = [
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "gap", "row-gap", "column-gap", "top", "right", "bottom", "left",
  "inset", "width", "height", "min-width", "min-height", "max-width", "max-height",
];

const FONT_PROPS = ["font-size", "line-height", "letter-spacing"];

const RADIUS_PROPS = ["border-radius"];

const PX_VALUE = /:\s*(-?\d+(?:\.\d+)?px)/;
const REM_VALUE = /:\s*(-?\d+(?:\.\d+)?rem)/;

const CSS_VAR_DEF = /--[\w-]+\s*:\s*([^;]+)/;

const IGNORE_COMMENT = /ds-lint-ignore|ds-lint-disable/;

const NAMED_COLORS = new Set([
  "black", "white", "red", "green", "blue", "yellow", "orange", "purple",
  "pink", "gray", "grey", "cyan", "magenta", "brown", "navy", "teal",
  "coral", "salmon", "tomato", "gold", "silver", "crimson", "indigo",
  "violet", "plum", "khaki", "ivory", "beige", "linen", "aqua", "lime",
  "olive", "maroon", "fuchsia", "turquoise", "orchid", "sienna", "peru",
  "chocolate", "firebrick", "darkred", "darkgreen", "darkblue",
  "darkgray", "darkgrey", "lightgray", "lightgrey",
  "lightblue", "lightgreen", "lightyellow", "lightcoral", "lightsalmon",
  "deepskyblue", "dodgerblue", "royalblue", "steelblue", "slategray",
  "slategrey", "midnightblue", "cornflowerblue", "cadetblue",
  "mediumseagreen", "seagreen", "forestgreen", "limegreen",
  "springgreen", "mediumspringgreen", "darkslategray", "darkslategrey",
  "dimgray", "dimgrey", "gainsboro", "whitesmoke", "ghostwhite",
  "aliceblue", "lavender", "mistyrose", "antiquewhite", "lemonchiffon",
  "papayawhip", "blanchedalmond", "bisque", "peachpuff", "navajowhite",
  "moccasin", "cornsilk", "oldlace", "floralwhite", "honeydew",
  "mintcream", "azure", "snow", "seashell",
]);

export {
  HEX_3, HEX_4, HEX_6, HEX_8, RGB, HSL,
  SPACING_PROPS, FONT_PROPS, RADIUS_PROPS,
  PX_VALUE, REM_VALUE, CSS_VAR_DEF,
  IGNORE_COMMENT, NAMED_COLORS,
};
