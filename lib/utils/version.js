const semver = require("semver");
const getPackageVersion = require("./get-package-version");

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// 缓存上次校验获取到的最新版本和本地版本
let cached;

// 上次版本校验获取到的最新版本和校验时间
const lastCheckResult = {
  latestVersion: undefined,
  checkTime: 0
};

/**
 * Get the cli latest version and cache the version info
 *
 * @param {*} localLatestVersion
 */
async function getAndCacheLatestVersion(localLatestVersion) {
  try {
    const res = await getPackageVersion("portable-cli", "latest");
    const {
      statusCode,
      body: { version }
    } = res;
    if (statusCode === 200) {
      if (semver.valid(version) && version !== localLatestVersion) {
        Object.assign(lastCheckResult, {
          latestVersion: version,
          checkTime: Date.now()
        });
        return version;
      }
    }
  } catch (error) {
    return localLatestVersion;
  }
}

/**
 * 获取发布的最新版本和本地的版本
 * @returns
 */
module.exports = async function getVersion() {
  // if (cached) {
  //   return cached;
  // }

  let latest;
  const localVersion = require("../../package.json").version;

  const { latestVersion = localVersion, checkTime = 0 } = lastCheckResult;

  const cachedLatestVersion = latestVersion;
  // 有效期为 1 天
  const isExpired = (Date.now() - checkTime) / ONE_DAY_MS > 1;
  if (isExpired) {
    // 如果过期需要等待最新版本的校验结果
    latest = await getAndCacheLatestVersion(cachedLatestVersion);
  } else {
    // 否则进行异步的更新并直接使用缓存的版本返回
    getAndCacheLatestVersion(cachedLatestVersion);
    latest = cachedLatestVersion;
  }

  cached = {
    latest,
    current: localVersion
  };
  return cached;
};
