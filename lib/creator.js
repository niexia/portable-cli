const chalk = require("chalk");
const execa = require("execa"); // Process execution for humans
const fs = require("fs-extra");
const EventEmitter = require("events");

const { clearConsoleWithTitle } = require("./utils/clear-console");
const { logWithSpinner, stopSpinner } = require("./utils/spinner");
const { log, warn, error } = require("./utils/logger");
const { hasGit, isGitProject } = require("./utils/env");
const { readTemplateFromJson } = require("./utils/read-template-data");
const fetchRemotePreset = require("./utils/load-remote-preset");

module.exports = class Creator extends EventEmitter {
  constructor(name, context) {
    super();
    this.name = name;
    this.context = context; // 项目绝对路径
    process.env.ISSUES_BLOG_CLI_CONTEXT = this.context;
  }

  /**
   * Create a project by using the selected template
   *
   * @param {*} [options={}]
   * @returns
   */
  async create(options = {}) {
    const { name, context } = this;
    const templateJson = readTemplateFromJson();
    const gitRepo = templateJson[process.env.ISSUES_BLOG_CLI_TEMPLATE_NAME];

    let tmpdir;

    // clear log and check CLI version
    await clearConsoleWithTitle(true);

    // download template
    log(`📦 Creating project in ${chalk.yellow(context)}.\n`);
    try {
      stopSpinner();
      logWithSpinner(
        "⠋",
        "Download project template. This might take a while..."
      );
      this.emit("creation", { event: "download-template" });
      tmpdir = await fetchRemotePreset(gitRepo.download);
    } catch (e) {
      stopSpinner();
      error(`Failed to fetch remote git repo ${chalk.cyan(gitRepo)}: `);
      throw e;
    }

    // copy template to project path
    try {
      fs.copySync(tmpdir, context);
    } catch (e) {
      return error(`Error: ${e}`);
    }

    // init git
    const toInit = this.isNeedToInitGit();
    if (toInit) {
      stopSpinner();
      log();
      logWithSpinner(`🗃`, `Initializing git repository...`);
      this.emit("creation", { event: "git-init" });
      await this.run("git init");
    }

    // commit the file
    let gitCommitFailed = false;
    if (toInit) {
      await this.run("git add -A");
      try {
        await this.run("git", ["commit", "-m", "Initial commit"]);
      } catch (e) {
        gitCommitFailed = true;
      }
    }

    // success!
    stopSpinner();
    log();
    log(`🎉  Successfully created project ${chalk.yellow(name)}.`);
    this.emit("creation", { event: "done" });

    // prompt to commit failed
    if (gitCommitFailed) {
      warn(`
        Skipped git commit due to missing username and email in git config.\n
        You will need to perform the initial commit by yourself.\n
      `);
    }
  }

  /**
   * Run the command
   *
   * @param {*} command to be executed command
   * @param {*} args arguments for the command execution
   * @returns
   */
  run(command, args) {
    if (!args) {
      [command, ...args] = command.split(/\s+/);
    }
    return execa(command, args, { cwd: this.context });
  }

  /**
   * Determine if git should be initialized
   * @returns
   */
  isNeedToInitGit() {
    return hasGit() && !isGitProject(this.context);
  }
};
