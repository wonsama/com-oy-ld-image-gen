import { sendGet, sendPostFile } from "../util/postman.js";

import { createLdXml } from "../util/xml.js";
import fs from "fs";
import { info } from "../util/logger.js";
import sharp from "sharp";

const TEST_TYPES = {
  NORMAL: { KOR: "SHRT_GDS_NM", ENG: "GDS_ENG_NM" }, // 일반
  TWO_IN_ONE: { KOR: "SHRT_GDS_NM", ENG: "GDS_ENG_NM" }, // 2in1
  CROSS: { KOR: "LBL_TYP_NM", ENG: "LBL_TYP_ENG_NM " }, // 교차
  COLOR: { KOR: "LABEL_NAME", ENG: "LABEL_ENG_NAME" }, // 색조대표
};

// SETTINGS
const LD_INPUT_ROOT = process.env.LD_INPUT_ROOT;
const LD_OUTPUT_ROOT = process.env.LD_OUTPUT_ROOT;
const TEST_ARTICLE_IDS = `${LD_INPUT_ROOT}/${process.env.PRODUCT_FILE_PATH}`;
const TEST_XSL_FILE = `${LD_INPUT_ROOT}/${process.env.XSL_FILE_PATH}`;
const TEST_EXTRACT_KOR = TEST_TYPES[process.env.TEMPLATE_TYPE].KOR;
const TEMP_STATION_CODE = process.env.STATION_ID;
const TEMP_XML = `${LD_INPUT_ROOT}/imageData.xml`;
const TEST_PNG_PREFIX = TEST_XSL_FILE.replace(".xsl", "").split("/").pop();
const API_URL_ARTICLE = process.env.API_URL_ARTICLE;
const API_URL_IMADE_GEN = process.env.API_URL_IMADE_GEN;

// ENTRY POINT
async function init() {
  // STEP 1. 작업 대상에 대한 articleId 목록 정보를 가져옴
  const ARTICLE_IDS = JSON.parse(fs.readFileSync(TEST_ARTICLE_IDS, "utf-8"));
  info(`TEST ARTICLE_IDS COUNT : ${ARTICLE_IDS.length}`);

  const html = [];
  html.push(`<html>`);
  html.push(
    `<head><style>table,td,th{border-collapse:collapse;border:1px solid black;}</style></head>`
  );
  html.push(`<h1>${TEST_PNG_PREFIX} Test</h1>`);
  html.push(
    `<table><thead><tr><th>No</th></th><th>ArticleId</th><th>Name</th><th>Image</th></tr></thead><tbody>`
  );

  let count = 1;
  for (let articleId of ARTICLE_IDS) {
    // LD주소, PORTAL API 에도 동일한 기능 존재
    const article = await sendGet(
      `${API_URL_ARTICLE}/${articleId}?stationCode=${TEMP_STATION_CODE}`
    );

    // STEP 1. GET_ARTICLE - N개의 상품 정보 중 1번째 정보를 활용
    const data = article[0].data;

    // STEP 2. CREATE_IMAGE_DATA_XML
    const xml = createLdXml([data, data]); // 2in1 의 경우 동일한 데이터를 2번 사용하도록 처리
    fs.writeFileSync(TEMP_XML, xml, "utf-8");

    // STEP 3. CREATE_IMAGE
    const files = [
      { name: "file", path: TEST_XSL_FILE },
      { name: "imageData", path: TEMP_XML },
    ];
    const res = await sendPostFile(files, API_URL_IMADE_GEN);

    // STEP 4. SAVE_IMAGE
    sharp(Buffer.from(res.image, "base64")).toFile(
      `${LD_OUTPUT_ROOT}/img/${TEST_PNG_PREFIX}-${articleId}.png`
    );
    info(
      `save image ${TEST_PNG_PREFIX}-${articleId}.png - ${count}/${ARTICLE_IDS.length}`
    );

    // STEP 5. CREATE_HTML
    html.push(
      `<tr><td>${count}</td></td><td>${articleId}</td><td>${data[TEST_EXTRACT_KOR]}</td><td><img src="./img/${TEST_PNG_PREFIX}-${articleId}.png" /></td></tr>`
    );

    // UPDATE COUNT
    count++;
  }
  html.push(`</tbody></html>`);
  fs.writeFileSync(
    `${LD_OUTPUT_ROOT}/${TEST_PNG_PREFIX}.html`,
    html.join("\n"),
    "utf-8"
  );

  info("test_ld_template - end");
}
init();
