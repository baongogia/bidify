/** Parse "Nhãn: Giá trị" per line → object for API */
export function parseAttributeLines(text) {
  if (!text || !String(text).trim()) return undefined;
  const obj = {};
  String(text)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > 0) {
        const k = line.slice(0, idx).trim();
        const v = line.slice(idx + 1).trim();
        if (k) obj[k] = v || "—";
      }
    });
  return Object.keys(obj).length ? obj : undefined;
}

/** API attributes → textarea lines */
export function attributesToLines(attributes) {
  if (!attributes) return "";
  let o = attributes;
  if (typeof o === "string") {
    try {
      o = JSON.parse(o);
    } catch {
      return "";
    }
  }
  if (typeof o !== "object" || o === null) return "";
  return Object.entries(o)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
