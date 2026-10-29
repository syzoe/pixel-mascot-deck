// Upscale pxl sprites with nearest-neighbour so PowerPoint never blurs the pixels.
//   NODE_PATH=<deck>/node_modules node upscale.js <pxl out/sprites dir> [out dir] [scale=16]
// Writes <name>@<scale>.png for every PNG not starting with "_".
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const [src, out = ".", scale = "16"] = process.argv.slice(2);
if (!src) { console.error("usage: node upscale.js <sprites dir> [out dir] [scale]"); process.exit(2); }
const k = Number(scale);
(async () => {
  for (const f of fs.readdirSync(src).filter((f) => f.endsWith(".png") && !f.startsWith("_"))) {
    const img = sharp(path.join(src, f));
    const { width, height } = await img.metadata();
    const dest = path.join(out, f.replace(/\.png$/, `@${k}.png`));
    await img.resize(width * k, height * k, { kernel: "nearest" }).png().toFile(dest);
    console.log(`${dest}  ${width}x${height} -> ${width * k}x${height * k}`);
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
