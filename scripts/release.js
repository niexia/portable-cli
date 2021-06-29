const inquirer = require("inquirer");
const chalk = require("chalk");
const semver = require("semver");
const { execSync } = require("child_process");

const currentVersion = require("../package.json").version;
const { log } = require("../lib/utils/logger");
const RELEASE_ACTIONS = ["patch", "minor", "major"];

async function release() {
  console.log(`Current portable cli version is ${currentVersion}`);

  const versions = {};
  // 生产预发布的版本信息
  const releaseChoices = RELEASE_ACTIONS.map((type) => {
    versions[type] = semver.inc(currentVersion, type);
    return {
      name: `${type} ${versions[type]}`,
      value: type
    };
  });

  // 选择发布的版本
  const { release } = await inquirer.prompt([
    {
      name: "release",
      message: "Select a release type",
      type: "list",
      choices: releaseChoices
    }
  ]);

  // 选择的版本
  const releaseVersion = versions[release];

  // 二次确认
  const { yes } = await inquirer.prompt([
    {
      name: "yes",
      message: `Confirm releasing ${releaseVersion}`,
      type: "confirm"
    }
  ]);
  if (yes) {
    execSync(`standard-version -r ${releaseVersion}`, {
      stdio: "inherit"
    });
  }

  return releaseVersion;
}

release()
  .then((version) => {
    log(`🎉  Successfully release ${chalk.yellow(version)}.`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
