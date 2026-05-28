export function textToPoints({
  text = "Oh, løøk",
  font = "bold 180px Arial",
  sampleGap = 4,
  width = 1200,
  height = 400,
}) {
  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;
  const ctx = off.getContext("2d");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  // Soporte básico para saltos de línea
  const lines = String(text).split("\n");

  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";

  const lineHeight = height / (lines.length + 1);
  lines.forEach((line, idx) => {
    const y = height / 2 + (idx - (lines.length - 1) / 2) * lineHeight;
    ctx.fillText(line, width / 2, y);
  });

  const data = ctx.getImageData(0, 0, width, height).data;
  const points = [];

  for (let y = 0; y < height; y += sampleGap) {
    for (let x = 0; x < width; x += sampleGap) {
      const i = (y * width + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2],
        a = data[i + 3];

      if (a > 32 && r > 200 && g > 200 && b > 200) {
        const px = (x - width / 2) / (width / 2);
        const py = (height / 2 - y) / (height / 2);
        points.push([px, py, 0]);
      }
    }
  }

  return points;
}
