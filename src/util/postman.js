import { debug, error, info } from "./logger.js";

import FormData from "form-data";
import axios from "axios";
import fs from "fs";

/**
 * 일반적인 post 방식 처리
 * @param {string} url
 * @param {object} data
 * @returns
 */
export async function sendPost(url, data, options) {
  debug(`request post ${url}`);
  debug(data);
  const response = await axios.post(url, data, options);
  debug(
    `response ${response.data ? JSON.stringify(response.data) : "no data"}`
  );

  return response.data;
}

export async function sendGet(url, data) {
  debug(`request get ${url}`);
  if (data) {
    url = appendUrl(url, data);
    debug(`request get append ${url}`);
  }
  const response = await axios.get(url);
  debug(
    `response ${response.data ? JSON.stringify(response.data) : "no data"}`
  );

  return response.data;
}

/**
 * post 방식으로 전송하는데 주소 창에 파라미터가 노출되도록 함
 * @param {string} url
 * @param {object} data
 * @returns
 */
export async function sendPostGet(url, data) {
  debug(`request post ${url}`);
  debug(appendUrl(data));
  const response = await axios.post(appendUrl(data));
  debug(
    `response ${response.data ? JSON.stringify(response.data) : "no data"}`
  );

  return response.data;
}

function appendUrl(url, data) {
  url += "?";
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) {
      for (const e of v) {
        url += `${k}=${e}&`;
      }
    } else {
      url += `${k}=${v}&`;
    }
  }
  return url.slice(0, -1);
}

export async function sendPostFile(files, url) {
  debug(`send file to ${url}`);
  debug(`files : ${files.map((e) => e.path)}`);

  let formData = new FormData();
  for (let item of files) {
    if (!fs.existsSync(item.path)) {
      error(`file not found : ${item.path}`);
      return null;
    }
    let file = fs.createReadStream(item.path);
    formData.append(item.name, file);
  }
  let res;
  try {
    debug(`call api : ${url}`);
    res = await axios({
      method: "post",
      url: url,
      data: formData,
      headers: formData.getHeaders(),
    });
  } catch (e) {
    error(e.toString());
    return null;
  }

  return res.data;
}
