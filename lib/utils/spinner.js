const ora = require("ora"); // Elegant terminal spinner
const chalk = require("chalk");

const spinner = ora();
let lastMsg = null;

exports.logWithSpinner = (symbol, msg) => {
  if (!msg) {
    msg = symbol;
    symbol = chalk.green("✔");
  }

  if (lastMsg) {
    // Stop the spinner and change the symbol or text.
    const { symbol, text } = lastMsg;
    spinner.stopAndPersist({
      symbol,
      text
    });
  }

  lastMsg = {
    symbol: `${symbol} `,
    text: msg
  };

  spinner.text = ` ${msg}`;
  spinner.start();
};

exports.stopSpinner = (persist) => {
  if (lastMsg && !persist) {
    const { symbol, text } = lastMsg;
    spinner.stopAndPersist({
      symbol,
      text
    });
  } else {
    spinner.stop();
  }

  lastMsg = null;
};

exports.pauseSpinner = () => {
  spinner.stop();
};

exports.startSpinner = () => {
  spinner.start();
};
