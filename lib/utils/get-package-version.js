const request = require("./request");

const TAOBAO_REGISTRY = "https://registry.npm.taobao.org";

module.exports = async function getPackageVersion(packageName, range = "") {
  // https://docs.npmjs.com/about-packages-and-modules
  return request.get(
    `${TAOBAO_REGISTRY}/${encodeURIComponent(packageName).replace(
      /^%40/,
      "@"
    )}/${range}`
  );
};
