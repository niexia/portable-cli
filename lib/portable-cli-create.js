const path = require("path");
const fs = require("fs");
const program = require("commander");
const chalk = require("chalk");
const inquirer = require("inquirer"); // A collection of common interactive command line user interfaces.
const validateProjectName = require("validate-npm-package-name");
const exec = require("child_process").exec;

const { pauseSpinner } = require("./utils/spinner");
const { clearConsoleWithTitle } = require("./utils/clear-console");
const { readTemplateFromJson } = require("./utils/read-template-data");

const Creator = require("./creator");

async function create(templateName, projectName, options) {
  // project template
  const templateJson = readTemplateFromJson();

  // 校验模版是否存在
  if (!templateJson[templateName]) {
    console.log(`  ${chalk.red(`Unknown template name ${templateName}.`)}`);
    program.outputHelp();
    return;
  }

  // 获取 node 进程的目录
  const cwd = process.cwd();
  // 是否是当前目录
  const isCurrentDir = projectName === ".";
  // 项目名称
  const finalProjectName = isCurrentDir
    ? path.relative("../", cwd)
    : projectName;

  // 校验项目名称是否合法
  const validNameResult = validateProjectName(finalProjectName);
  if (!validNameResult.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: ${finalProjectName}`));
    const { errors, warnings } = validNameResult;
    if (errors) {
      errors.forEach((error) => {
        console.error(chalk.red.dim(`Error: ${error}`));
      });
    }
    if (warnings) {
      warnings.forEach((warning) => {
        console.warn(chalk.yellow.dim(`Warning: ${warning}`));
      });
    }
    process.exit(1);
  }

  // 目录地址
  const projectDir = path.resolve(cwd, projectName);
  // 校验目录地址是否存在
  // 如果存在给用户提示，目录地址存在有 2 种情况：
  // 1. 当前目录创建
  // 2. 已经存在同名目录
  if (fs.existsSync(projectDir)) {
    await clearConsoleWithTitle();
    if (isCurrentDir) {
      const { ok } = await inquirer.prompt([
        {
          name: "ok",
          type: "confirm",
          message: "Generate project in current directory?"
        }
      ]);
      if (!ok) {
        return;
      }
    } else {
      const { action } = await inquirer.prompt([
        {
          name: "action",
          type: "list",
          message: `Target directory ${chalk.cyan(
            projectDir
          )} already exists, please pick an action:`,
          choices: [
            {
              name: "Overwrite",
              value: "overwrite"
            },
            {
              name: "Cancel",
              value: "cancel"
            }
          ]
        }
      ]);
      if (action === "cancel") {
        return;
      } else {
        console.log(`\nRemoving ${chalk.cyan(projectDir)}...`);
        await exec(`rm -rf ${projectDir}`);
      }
    }
  }

  // 目录不存在则开始创建项目
  process.env.PORTABLE_CLI_TEMPLATE_NAME = templateName;
  const creator = new Creator(finalProjectName, projectDir);
  await creator.create(options);

  return true;
}

module.exports = function portableCliCreate(
  templateName,
  projectName,
  ...args
) {
  return create(templateName, projectName, ...args).catch((err) => {
    pauseSpinner();
    console.error(err);
    process.exit(1);
  });
};
