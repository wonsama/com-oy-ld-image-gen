import { debug } from "./logger.js";
import sharp from "sharp";

function toHex(r, g, b) {
  return "#" + ((r << 16) | (g << 8) | b).toString(16);
}

export async function cropImage(sourceFile, targetFile, extractInfo) {
  const sourceImage = sharp(sourceFile);
  debug(`source image : ${sourceImage}`);
  await sourceImage
    .extract({
      width: extractInfo.width,
      height: extractInfo.height,
      left: extractInfo.left,
      top: extractInfo.top,
    })
    .toFile(targetFile);
  debug(`extracted image : ${targetFile}`);
}

export async function pixelCount(sourceFile) {
  const sourceImage = sharp(sourceFile);

  return new Promise((resolve, reject) => {
    const results = {};
    sourceImage
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then((res) => {
        const data = res.data;
        const { channels } = res.info;
        for (let i = 0; i < data.length; i += channels) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          const hex = toHex(r, g, b);
          if (results[hex]) {
            results[hex]++;
          } else {
            results[hex] = 1;
          }
          debug(results);
          resolve(results);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}
