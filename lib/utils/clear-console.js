const chalk = require("chalk");
const semver = require("semver");

const { clearConsole } = require("./logger");
const getVersion = require("./version");

exports.generateTitle = async function generateTitle(checkToUpdate) {
  const { latest, current } = await getVersion();
  const isLatestGtCurrent = semver.gt(latest, current);
  let title = chalk.bold.blue(`PORTABLE CLI v${current}`);

  if (checkToUpdate && isLatestGtCurrent) {
    // 提示升级
    title += chalk.green(`
      ┌────────────────────${`-`.repeat(latest.length)}──┐
      │  Update available: ${latest}  │
      └────────────────────${`─`.repeat(latest.length)}──┘
    `);
  }

  return title;
};

exports.clearConsoleWithTitle = async function clearConsoleWithTitle(
  checkToUpdate
) {
  const title = await exports.generateTitle(checkToUpdate);
  clearConsole(title);
};
