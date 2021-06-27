const chalk = require("chalk");
const inquirer = require("inquirer");

const { log } = require("./utils/logger");
const {
  readTemplateFromJson,
  writeTemplateJson
} = require("./utils/read-template-data");
const { stopSpinner } = require("./utils/spinner");

async function deleteProjectTemplate(templateName) {
  const templateJson = readTemplateFromJson();

  if (!templateJson[templateName]) {
    console.log(
      `  ${chalk.red(`template name ${templateName} is not existing.`)}`
    );
    return;
  }

  const { ok } = inquirer.prompt([
    {
      name: "ok",
      type: "confirm",
      message: `Make sure that you want to delete the template ${templateName}?`
    }
  ]);
  if (!ok) {
    return;
  }

  delete templateJson[templateName];
  writeTemplateJson(templateName);
  stopSpinner();
  log();
  log(
    `🎉  Successfully delete project template ${chalk.yellow(templateName)}.`
  );
  log();
}

module.exports = function deleteTemplate(templateName) {
  return deleteProjectTemplate(templateName).catch((err) => {
    console.error(err);
    process.exit(1);
  });
};
