import { sendGet, sendPostFile } from "../util/postman.js";

import { createLdXml } from "../util/xml.js";
import fs from "fs";
import { info } from "../util/logger.js";
import sharp from "sharp";

const LBL_TYP_NM = "LBL_TYP_NM";
const LBL_TYP_ENG_NM = "LBL_TYP_ENG_NM";
const DISPLAY_1 = "DISPLAY_1";
const SALE_ICON_TXT_1 = "SALE_ICON_TXT_1";
const OFFR_SP_CD_1 = "OFFR_SP_CD_1";
const BUY_TYP_STK_YN_1 = "BUY_TYP_STK_YN_1";
const USFL_STK_QTY_1 = "USFL_STK_QTY_1";
const SELPRC_UPRC_1 = "SELPRC_UPRC_1";
const PRMTN_SELPRC_UPRC_1 = "PRMTN_SELPRC_UPRC_1";
const CPN_SELPRC_UPRC_1 = "CPN_SELPRC_UPRC_1";
const PRMTN_STRT_YMD_1 = "PRMTN_STRT_YMD_1";
const PRMTN_END_YMD_1 = "PRMTN_END_YMD_1";
const CPN_PRMTN_STRT_YMD_1 = "CPN_PRMTN_STRT_YMD_1";
const CPN_PRMTN_END_YMD_1 = "CPN_PRMTN_END_YMD_1";



// SETTINGS
const LD_INPUT_ROOT = process.env.LD_INPUT_ROOT;
const LD_OUTPUT_ROOT = process.env.LD_OUTPUT_ROOT;
const TEST_ARTICLE_IDS = `${LD_INPUT_ROOT}/${process.env.PRODUCT_FILE_PATH}`;
const TEST_XSL_FILE_1 = `${LD_INPUT_ROOT}/${process.env.XSL_FILE_PATH_1}`;
const TEST_XSL_FILE_2 = `${LD_INPUT_ROOT}/${process.env.XSL_FILE_PATH_2}`;
const TEMP_STATION_CODE = process.env.STATION_ID;
const TEMP_XML = `${LD_INPUT_ROOT}/imageData.xml`;
const TEST_PNG_PREFIX_1 = TEST_XSL_FILE_1.replace(".xsl", "").split("/").pop();
const TEST_PNG_PREFIX_2 = TEST_XSL_FILE_2.replace(".xsl", "").split("/").pop();
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
    `<head><style>table,td,th{border-collapse:collapse;border:1px solid black;text-align:center;}body{text-align:center;}</style></head>`
  );
  html.push(`<h1>(기존)${TEST_PNG_PREFIX_1} / (신규)${TEST_PNG_PREFIX_2} LD프리뷰테스트</h1>`);
  html.push(
    `<table><thead><tr><th>No</th><th>ArticleId</th><th>기존 Image</th><th>신규 Image</th><th>상품명</th><th>영문상품명</th><th>DISPLAY</th><th>세일ICON</th><th>오퍼 코드</th><th>판매분상품여부</th><th>가용수량</th><th>판매가</th><th>1차 행사 가격</th><th>2차 행사 가격</th><th>1차 행사시작일</th><th>1차 행사종료일</th><th>2차 행사시작일</th><th>2차 행사종료일</th></tr></thead><tbody>`
  );


  let count = 1;
  for (let articleId of ARTICLE_IDS) {
    // LD주소, PORTAL API 에도 동일한 기능 존재
    const article = await sendGet(
      `${API_URL_ARTICLE}/${articleId}?stationCode=${TEMP_STATION_CODE}`
    );

    // // STEP 1. GET_ARTICLE - N개의 상품 정보 중 1번째 정보를 활용
    const data = article[0].data;

    // STEP 2. CREATE_IMAGE_DATA_XML
    const xml = createLdXml([data, data]); // 2in1 의 경우 동일한 데이터를 2번 사용하도록 처리
    fs.writeFileSync(TEMP_XML, xml, "utf-8");

//     // STEP 3. CREATE_IMAGE
    const files1 = [
    { name: "file", path: TEST_XSL_FILE_1 },
    { name: "imageData", path: TEMP_XML },
  ];
  const files2 = [
    { name: "file", path: TEST_XSL_FILE_2 },
    { name: "imageData", path: TEMP_XML },
  ];
  const res1 = await sendPostFile(files1, API_URL_IMADE_GEN);
  const res2 = await sendPostFile(files2, API_URL_IMADE_GEN);
  
  // STEP 4. SAVE_IMAGE
  sharp(Buffer.from(res1.image, "base64")).toFile(
    `${LD_OUTPUT_ROOT}/img/${TEST_PNG_PREFIX_1}-${articleId}.png`
  );
  sharp(Buffer.from(res2.image, "base64")).toFile(
    `${LD_OUTPUT_ROOT}/img/${TEST_PNG_PREFIX_2}-${articleId}.png`
  );
  info(
    `save images ${TEST_PNG_PREFIX_1}-${articleId}.png and ${TEST_PNG_PREFIX_2}-${articleId}.png - ${count}/${ARTICLE_IDS.length}`
  );

    // STEP 5. CREATE_HTML
    html.push(
    `<tr><td>${count}</td><td>${articleId}</td>` +
    `<td><img src="./img/${TEST_PNG_PREFIX_1}-${articleId}.png" /></td>` +
    `<td><img src="./img/${TEST_PNG_PREFIX_2}-${articleId}.png" /></td>` +
    `<td>${data[LBL_TYP_NM] || '-'}</td>` +
    `<td>${data[LBL_TYP_ENG_NM] || '-'}</td>` +
    `<td>${data[DISPLAY_1] || '-'}</td>` +
    `<td>${data[SALE_ICON_TXT_1] || '-'}</td>` +
    `<td>${data[OFFR_SP_CD_1] || '-'}</td>` +
    `<td>${data[BUY_TYP_STK_YN_1]}</td>` +
    `<td>${data[USFL_STK_QTY_1]}</td>` +
    `<td>${data[SELPRC_UPRC_1] || '-'}</td>` +
    `<td>${data[PRMTN_SELPRC_UPRC_1] || '-'}</td>` +
    `<td>${data[CPN_SELPRC_UPRC_1] || '-'}</td>` +
    `<td>${data[PRMTN_STRT_YMD_1] || '-'}</td>` +
    `<td>${data[PRMTN_END_YMD_1] || '-'}</td>` +
    `<td>${data[CPN_PRMTN_STRT_YMD_1] || '-'}</td>` +
    `<td>${data[CPN_PRMTN_END_YMD_1] || '-'}</td>`
  );

    // UPDATE COUNT
    count++;
  }
  html.push(`</tbody></html>`);
  fs.writeFileSync(
    `${LD_OUTPUT_ROOT}/${TEST_PNG_PREFIX_1}__${TEST_PNG_PREFIX_2}.html`,
    html.join("\n"),
    "utf-8"
  );

  info("test_ld_template - end");
}
init();