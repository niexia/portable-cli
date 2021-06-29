const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const download = require("download-git-repo");

module.exports = async function fetchRemotePreset(name, clone = false) {
  const tmpdir = path.resolve(os.tmpdir(), "issues-blog-cli");

  // clone 时把临时目录删除, 会生成目录
  if (clone) {
    await fs.remove(tmpdir);
  }

  return new Promise((resolve, reject) => {
    download(name, tmpdir, { clone }, (err) => {
      if (err) {
        // The earlier repo uses the master branch by default, try again!
        const { url, statusCode } = err;
        if (statusCode === 404 && /main.zip$/.test(url)) {
          return fetchRemotePreset(
            name.replace("main.zip", "master.zip"),
            clone
          )
            .then((val) => resolve(val))
            .catch((error) => reject(error));
        }
        return reject(err);
      }
      return resolve(tmpdir);
    });
  });
};
