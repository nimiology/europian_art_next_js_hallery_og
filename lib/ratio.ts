// "Oil on canvas, 63 x 51 cm" is height x width; we use it to reserve the image box before it loads.
// shortcut: ~53% of rows carry a size, and photos may include frames, so the ratio is approximate;
// upgrade by storing real image width/height if the remaining layout shift matters.
const SIZE = /(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*(?:x\s*\d+(?:[.,]\d+)?\s*)?(?:cm|mm|m)\b/;

export function aspectFromType(type: string, title: string): string | undefined {
  if (/detail/i.test(title)) return undefined; // a detail crop doesn't match the whole work's size
  const m = type.match(SIZE);
  if (!m) return undefined;
  const h = parseFloat(m[1].replace(",", ".")), w = parseFloat(m[2].replace(",", "."));
  const r = w / h;
  return h && w && r > 0.2 && r < 5 ? `${w} / ${h}` : undefined;
}
