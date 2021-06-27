const chalk = require("chalk");
const readline = require("readline"); // https://nodejs.org/api/readline.html
const EventEmitter = require("events");

const { padStart } = String.prototype;
const chalkTag = (tag) => chalk.bgBlackBright.white.dim(` ${tag} `);

const events = new EventEmitter();

function log(type, tag, message) {
  if (message) {
    events.emit("log", {
      message,
      type,
      tag
    });
  }
}

function format(label = "", msg = "") {
  // use `reset` to reset the current color chain.
  const pad = chalk.reset(label).length;

  return msg.split("\n").map(
    (line, index) => (index === 0 ? `${label} ${line}` : padStart(line, pad)) // align
  );
}

exports.events = events;

exports.clearConsole = (title) => {
  // 判断 Node.js 是否被运行在一个文本终端（TTY）上下文中
  const isTTY = process.stdout.isTTY;
  if (!isTTY) {
    return;
  }
  const blank = "\n".repeat(process.stdout.rows);
  console.log(blank);

  // 将光标移动到给定的 TTY stream 中的起始位置
  readline.cursorTo(process.stdout, 0, 0);
  // 从光标的当前位置向下清除给定的 TTY 流
  readline.clearScreenDown(process.stdout);

  if (title) {
    console.log(title);
  }
};

exports.warn = (msg, tag = "") => {
  console.warn(
    format(
      chalk.bgYellow.black(" WARN ") + (tag ? chalkTag(tag) : ""),
      chalk.yellow(msg)
    )
  );

  log("warn", tag, msg);
};

exports.error = (msg, tag = "") => {
  console.error(
    format(chalk.bgRed(" ERROR ") + (tag ? chalkTag(tag) : ""), chalk.red(msg))
  );

  log("error", tag, msg);

  if (msg instanceof Error) {
    console.error(msg.stack);
    log("error", tag, msg.stack);
  }
};

exports.log = (msg, tag = "") => {
  console.log(format(tag ? chalkTag(tag) : "", msg));

  log("log", tag, msg);
};

exports.info = (msg, tag = "") => {
  console.log(
    format(chalk.bgBlue.black(" INFO ") + tag ? chalkTag(tag) : "", msg)
  );

  log("info", tag, msg);
};
