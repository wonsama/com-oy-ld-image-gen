/**
 * 이미지를 그릴때 2in1이 아닌 경우에 data를 2개를 보내면 1번째 데이터만 반영 처리 됨, 결국 그냥 동일 데이터 2개 보내면서 그리도록 처리 해도 무방
 * @param {Array<XMLDocument>} data 2in1 의 경우에만 data가 2개 존재, 그 외에는 1개
 * @returns
 */
export function createLdXml(data) {
  const xml = [];
  xml.push('<?xml version="1.0" encoding="UTF-8" standalone="no"?>');
  xml.push('<articles page="1">');
  xml.push("<enddevice>");
  xml.push("<labelCode>LABEL_CODE</labelCode>");
  xml.push("<labelTypeCode>labelTypeCode</labelTypeCode>");
  xml.push("</enddevice>");
  // 2in1 의 경우 data 가 2개 존재 해야 됨
  data.forEach((d, i) => appendData(xml, d, i + 1));
  xml.push("</articles>");

  return xml.join("");
}

function appendData(xml, data, index = 1) {
  xml.push(`<article index='${index}'><data>`);

  for (let [k, v] of Object.entries(data)) {
    if (v === null || v === "") {
      xml.push(`<${k} />`);
    } else {
      xml.push(`<${k}>${v.replace(/&/gi, "&amp;")}</${k}>`);
    }
  }

  xml.push("</data></article>");
}
