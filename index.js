const curlMaker = require('curl-cmd');
const { parse } = require('url');
const urljoin = require('url-join');
const uuid = require('uuid/v4');

const normaliseKeys = obj => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key.toLowerCase()]:
        typeof value === 'object' ? normaliseKeys(value) : value,
    };
  }, {});
};

function isObject(data) {
  return typeof data === 'object';
}

function axiosCurl(
  axios,
  {
    log = str => {
      console.log(str);
    },
    writeToFS = true,
  } = {}
) {
  // eslint-disable-next-line func-names
  axios.interceptors.request.use(async function (config) {
    const url = config.baseURL
      ? urljoin(config.baseURL, config.url)
      : config.url;
    const { hostname, path, protocol } = parse(url);
    console.log('config', config);
    const configHeaders = normaliseKeys(config.headers);
    const {
      common,
      delete: del,
      get,
      head,
      post,
      put,
      patch,
      ...restHeaders
    } = configHeaders;
    const methodHeaders = {
      get,
      head,
      post,
      put,
      patch,
    };
    methodHeaders.delete = del;
    const headers = {
      ...common,
      ...methodHeaders[config.method],
      ...restHeaders,
    };
    const isJSON =
      headers['content-type'] === 'application/json' || isObject(config.data);
    const json = isJSON ? `--data '${JSON.stringify(config.data)}'` : '';

    const href = `${protocol}//${hostname}${path}`;
    const curl = `${curlMaker.cmd({
      href,
      method: config.method.toUpperCase(),
      headers,
    })} ${json}`;
    log(curl);
    if (writeToFS) {
      const fs = require('fs');
      const kebabCase = require('lodash.kebabcase');
      const process = require('process');
      const util = require('util');
      const { join: joinPath } = require('path');
      const promisify = util.promisify(fs.writeFile);
      const writeFile = promisify;
      fs.mkdir(joinPath(process.cwd(), 'curls'), { recursive: true }, err => {
        if (err) {
          return console.error('>>>', err);
        }
      });
      await writeFile(
        joinPath(
          process.cwd(),
          'curls',
          `${kebabCase(path)}.curl.${uuid()}.txt`
        ),
        curl,
        'utf-8'
      ).catch(e => console.error(e));
    }
    return config;
  });
}

module.exports = axiosCurl;
