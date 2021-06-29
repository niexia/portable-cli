#!/usr/bin/env node

const program = require("commander"); // The complete solution for node.js command-line interfaces.
const chalk = require("chalk"); // Terminal string styling done right
const didyoumean = require("didyoumean"); //  A simple JavaScript matching engine
const semver = require("semver"); // The semantic versioner for npm

const enhanceErrorMessage = require("../lib/utils/enhance-error-message");
const requireNodeVersion = require("../package.json").engines.node;

function checkNodeVersion(targetVersion, cli) {
  const currentVersion = process.version;
  if (!semver.satisfies(currentVersion, targetVersion)) {
    console.log(
      chalk.red(`
        You are using Node ${currentVersion}, but this version of ${cli} require Node ${targetVersion}.\n
        Please upgrade your Node version.
      `)
    );
    // 退出进程
    process.exit(1);
  }
}

function suggestCommands(cmd) {
  const availableCommands = program.commands.map((cmd) => cmd._name);
  const suggestCommand = didyoumean(cmd, availableCommands);
  if (suggestCommand) {
    console.log(
      `  ` + chalk.yellow(`Did you mean ${chalk.green(suggestCommand)}?`)
    );
  }
}

function lowercase(str) {
  if (!str) {
    return "";
  }
  return str.toLocaleLowerCase();
}

/**
 * Get the params from `process.argv` and validate
 * whether the params enters by the user exceed the limit length.
 *
 * @param {*} argvLen
 * @param {*} maxArgvLen
 */
function validateArgsLen(argvLen, maxArgvLen) {
  if (argvLen > maxArgvLen) {
    console.log(
      chalk.yellow(
        `\n Info: you provided more than argument, the rest are ignored.`
      )
    );
  }
}

/** Check node version */
checkNodeVersion(requireNodeVersion, "portable-cli");

/** Init project template */
program
  .command("create <template-name> <project-name>")
  .description("create a new project from a template")
  .action((templateName, projectName, cmd) => {
    validateArgsLen(process.argv.length, 5);
    require("../lib/portable-cli-create")(lowercase(templateName), projectName);
  });

/** Add a project template */
program
  .command("add <template-name> <git-repo-address>")
  .description("add a project template")
  .action((templateName, gitRepoAddress, cmd) => {
    validateArgsLen(process.argv.length, 5);
    require("../lib/add-template")(lowercase(templateName), gitRepoAddress);
  });

/** List all templates */
program
  .command("list")
  .description("list all available project templates")
  .action((cmd) => {
    validateArgsLen(process.argv.length, 3);
    require("../lib/list-template")();
  });

/** Delete a project template */
program
  .command("delete <template-name>")
  .description("delete a project template")
  .action((templateName, cmd) => {
    validateArgsLen(process.argv.length, 4);
    require("../lib/delete-template")(templateName);
  });

/** Handle invalid command */
program.arguments("<command>").action((cmd) => {
  program.outputHelp();
  console.log(
    `  ` +
      chalk.red(`
        Unknown command ${chalk.yellow(cmd)}
      `)
  );
  suggestCommands(cmd);
});

/** Rewrite the commander methods */
enhanceErrorMessage("missingArgument", (argsName) => {
  return `Missing required argument ${chalk.yellow(`${argsName}`)}`;
});

/** Prase the argv */
program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
