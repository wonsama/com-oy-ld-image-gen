import { error, info } from "../util/logger.js";

import { sendGet } from "../util/postman.js";
import sharp from "sharp";

const AIMS_LABELS_OUTPUT_ROOT = process.env.AIMS_LABELS_OUTPUT_ROOT;
const DB_LABELS_DETAIL = "/dashboardservice/common/labels/detail";
const DB_LABELS = "/dashboardservice/common/labels";

// ENTRY POINT
async function init() {
  // CHECK REQUIRED PARAMETERS
  const param = process.argv;
  if (param.length < 4) {
    error(`required parameters are missing`);
    info(
      `Usage: npm run label <store:DDAA> <label:0575BCDEB293> <mode:dev or prd / default:dev>`
    );
    return;
  }

  const store = param[2].toUpperCase();
  const label = param[3];
  const mode = (param[4] || "dev").toUpperCase();
  const company = encodeURIComponent("올리브영");
  const AIMS_DASHBOARD_URL = process.env[`AIMS_URL_${mode}`];

  // GET LABEL IMAGE INFO
  const res = await sendGet(`${AIMS_DASHBOARD_URL}${DB_LABELS_DETAIL}`, {
    company,
    store,
    label,
  });
  if (res.currentImage.length == 0) {
    error(`label image not found`);
    return;
  }

  // SAVE LABEL IMAGE
  const IMAGE_PATH = `${AIMS_LABELS_OUTPUT_ROOT}/img/${mode}-${store}-${label}.png`;
  sharp(Buffer.from(res.currentImage[0].content, "base64")).toFile(IMAGE_PATH);
  info(`save image : ${IMAGE_PATH}`);

  // sendGet("https://www.naver.com");

  // 라벨 이미지 정보 조회
  // /dashboardservice/common/labels/detail?company=%EC%98%AC%EB%A6%AC%EB%B8%8C%EC%98%81&store=D578&label=0575BCFDB292

  // 라벨 상세정보 조회
  // /dashboardservice/common/labels?company=%EC%98%AC%EB%A6%AC%EB%B8%8C%EC%98%81&store=D578&label=0575BCFDB292&isLabelAlive=true
}
init();
