const chalk = require("chalk");

const { readTemplateFromJson } = require("./utils/read-template-data");
const { stopSpinner } = require("./utils/spinner");
const { log } = require("./utils/logger");

const isTemplateEmpty = (templates) => Object.keys(templates).length === 0;

async function listAllTemplate() {
  const templateJson = readTemplateFromJson();

  if (isTemplateEmpty(templateJson)) {
    stopSpinner();
    log();
    log("💔  No any template.");
    log();
    return;
  }

  for (const [key, value] of Object.entries(templateJson)) {
    stopSpinner();
    log();
    log(
      `➡️  Template name: ${chalk.yellow(key)}, Github address ${chalk.yellow(
        value.github
      )}`
    );
    log();
  }
}

module.exports = function listTemplate() {
  return listAllTemplate().catch((err) => {
    console.error(err);
    process.exit(1);
  });
};
