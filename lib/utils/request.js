const request = require('request-promise-native')

module.exports = {
  get(url) {
    const options = {
      method: 'GET',
      timeout: 30000,
      resolveWithFullResponse: true,
      json: true,
      url
    };
    return request(options);
  }
}