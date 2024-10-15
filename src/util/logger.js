// 설정 정보는 로거에서 최초 설정

import chalk from "chalk";
import { config } from "dotenv";
import dayjs from "dayjs";
import fs from "fs";

config();

const LOG_LEVEL = (process.env.LOG_LEVEL || "DEBUG").toUpperCase();
const isPrint = (targetLevel = "DEBUG") => {
  const map = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };
  const source = map[LOG_LEVEL] ? map[LOG_LEVEL] : -1;
  const target = map[targetLevel] ? map[targetLevel] : -1;

  return source > target;
};

function logger(message, level = "DEBUG") {
  const time = dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");

  const color = {
    DEBUG: chalk.gray,
    INFO: chalk.green,
    WARN: chalk.yellow,
    ERROR: chalk.red,
  };

  // print log
  console.log(color[level](`[${time}][${level}]`), message);

  // write log
  const filename = `logs/${dayjs().format("YYYY-MM-DD")}.log`;
  fs.writeFileSync(
    filename,
    `${time} ${level} ${JSON.stringify(message)}\n`,
    { flag: "a" },
    (err) => {
      if (err) console.error(err);
    }
  );
}

export function debug(message) {
  if (isPrint("DEBUG")) return;
  logger(message, "DEBUG");
}
export function info(message) {
  if (isPrint("INFO")) return;
  logger(message, "INFO");
}
export function warn(message) {
  if (isPrint("WARN")) return;
  logger(message, "WARN");
}
export function error(message) {
  if (isPrint("ERROR")) return;
  logger(message, "ERROR");
}
