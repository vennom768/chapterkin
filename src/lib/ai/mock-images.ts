function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function mockPageSvg(label: string, pageNumber: number) {
  const title = escapeXml(label.slice(0, 28) || "ChapterKin");
  const hues = ["#c45c26", "#2a3a5c", "#7a4e2d", "#4a6b4f", "#6b3f5b", "#3d5a80"];
  const color = hues[pageNumber % hues.length];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#f4e6c8"/>
  <circle cx="220" cy="180" r="140" fill="${color}" opacity="0.22"/>
  <circle cx="820" cy="260" r="200" fill="#e8b86d" opacity="0.35"/>
  <rect x="90" y="720" width="844" height="180" rx="28" fill="#fffaf2" opacity="0.9"/>
  <text x="512" y="800" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#2c1810">${title}</text>
  <text x="512" y="860" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="#8a6d5b">Layout preview · page ${pageNumber + 1}</text>
</svg>`;
}
