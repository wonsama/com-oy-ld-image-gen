export function createLdXml(data) {
  const xml = [];
  xml.push('<?xml version="1.0" encoding="UTF-8" standalone="no"?>');
  xml.push('<articles page="1">');
  xml.push("<enddevice>");
  xml.push("<labelCode>LABEL_CODE</labelCode>");
  xml.push("<labelTypeCode>labelTypeCode</labelTypeCode>");
  xml.push("</enddevice>");
  xml.push("<article index='1'><data>");

  for (let [k, v] of Object.entries(data)) {
    if (v === null || v === "") {
      xml.push(`<${k} />`);
    } else {
      xml.push(`<${k}>${v.replace(/&/gi, "&amp;")}</${k}>`);
    }
  }

  xml.push("</data></article>");
  xml.push("</articles>");

  return xml.join("");
}
