const { execSync } = require('child_process')
const LRU = require('lru-cache')

let _hasGit;
const _projectGit = new LRU({
  max: 10, // size
  maxAge: 1000, // expired time
})

/**
 * 是否安装了 git
 * @returns 
 */
exports.hasGit = () => {
  if (_hasGit) {
    return true;
  }

  try {
    // 通过执行指令是否成功来判断是否安装了 git
    execSync('git --version', { stdio: 'ignore'})
    return (_hasGit = true)
  } catch {
    return (_hasGit = false)
  }
}

/**
 * 是否是一个 git 项目
 * @param {*} cwd 
 * @returns 
 */
exports.isGitProject = cwd => {
  if (_projectGit.has(cwd)) {
    return _projectGit.get(cwd);
  }

  let flag;
  try {
    execSync('git status', {stdio: 'ignore'}, cwd)
    flag = true;
  } catch  {
    flag = false;
  }

  _projectGit.set(cwd, flag);
  return flag;
}