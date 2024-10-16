import { cropImage, pixelCount } from "../util/canvas.js";

import { info } from "../util/logger.js";

const DIFF_INPUT_ROOT = process.env.DIFF_INPUT_ROOT;
const DIFF_OUTPUT_ROOT = process.env.DIFF_OUTPUT_ROOT;

async function init() {
  info("start");

  await printCircleInfo(`${DIFF_INPUT_ROOT}/1.png`);
  await printCircleInfo(`${DIFF_INPUT_ROOT}/2.png`);

  info("end");
}

async function printCircleInfo(sourceFile) {
  const [targetFile, white, red] = await extractCircleInfo(sourceFile);
  info(
    `sourceFile : ${sourceFile}, targetFile : ${targetFile}, white : ${white}, red : ${red}`
  );
}

async function extractCircleInfo(sourceFile) {
  // 1. CROP IMAGE
  const targetFile = `${DIFF_OUTPUT_ROOT}/${sourceFile
    .split("/")
    .pop()
    .replace(".png", "-crop.png")}`;
  const extractInfo = { width: 100, height: 98, left: 200, top: 0 };
  await cropImage(sourceFile, targetFile, extractInfo);

  // 2. COUNT PIXELS ( RED, WHITE )
  const counts = await pixelCount(targetFile);
  return [targetFile, counts["#ffffff"], counts["#ff0000"]]; // [targetFile, white, red]
}

init();
