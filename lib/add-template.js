const chalk = require("chalk");
const isGitUrl = require("is-git-url");

const { stopSpinner } = require("./utils/spinner");
const { log } = require("./utils/logger");
const {
  readTemplateFromJson,
  writeTemplateToJson
} = require("./utils/read-template-data");

const sshRegexp = /^git@github.com:(.+)\/(.+).git$/;
const httpsRegexp = /^https:\/\/github.com\/(.+)\/(.+).git$/;
const generateAddress = (username, repoName) =>
  `github:${username}/${repoName}`;

/**
 * Format address
 *
 * @param {*} gitRepoAddress shh or https git repo address
 * @returns
 * @example
 * formatGitRepoAddress(https://github.com/niexia/issues-blog-template)
 * formatGitRepoAddress(git@github.com:niexia/issues-blog-template.git)
 * =>
 * github:niexia/issues-blog-template.git
 */
function formatGitRepoAddress(gitRepoAddress) {
  if (sshRegexp.test(gitRepoAddress)) {
    const [, username, repoName] = gitRepoAddress.match(sshRegexp);
    return generateAddress(username, repoName);
  }
  if (httpsRegexp.test(generateAddress)) {
    const [, username, repoName] = gitRepoAddress.match(httpsRegexp);
    return generateAddress(username, repoName);
  }
  throw new Error(
    `Format git repo address failed, cannot process this address ${gitRepoAddress}`
  );
}

async function addProjectTemplate(templateName, gitRepoAddress) {
  const templateJson = readTemplateFromJson();

  if (templateJson[templateName]) {
    console.log(`  ${chalk.red(`template name ${templateName} is existing.`)}`);
    return;
  }

  if (!isGitUrl(gitRepoAddress)) {
    console.log(
      `  ${chalk.red(
        `git repo address ${gitRepoAddress} is not a correct git address, please check the address.`
      )}`
    );
    return;
  }

  const formattedAddress = formatGitRepoAddress(gitRepoAddress);
  templateJson[templateName] = {
    github: gitRepoAddress,
    download: formattedAddress
  };
  writeTemplateToJson(templateJson);
  stopSpinner();
  log();
  log(`🎉  Successfully add project template ${chalk.yellow(templateName)}.`);
  log();
}

module.exports = function addTemplate(templateName, gitRepoAddress) {
  return addProjectTemplate(templateName, gitRepoAddress).catch((err) => {
    console.error(err);
    process.exit(1);
  });
};
