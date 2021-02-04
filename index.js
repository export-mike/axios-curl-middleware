const curl = require('curl-cmd');
const {parse, resolve} = require('url');

const normaliseKeys = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        return {
            ...acc,
            [key.toLowerCase()]: typeof(value) === 'object' ? normaliseKeys(value) : value 
        }
    }, {})
}

function axiosCurl(axios, {
    log = (str) => { console.log(str) },
    writeToFS = true
} = {}) {
    axios.interceptors.request.use(function (config) {
        const url = config.baseURL ? resolve(config.baseURL, config.url) : config.url;
        const {hostname, port, path} = parse(url)
        const configHeaders = normaliseKeys(config.headers);
        const {
            common, delete: del, get, head, post, put, patch,
            ...restHeaders
        } = configHeaders;
        const methodHeaders = {
            get, head, post, put, patch,
        };
        methodHeaders['delete'] = del;
        const headers = {
            ...common,
            ...methodHeaders[config.method],
            ...restHeaders
        } 
        const isJSON = headers['content-type'] === 'application/json';
        const json = isJSON ? `--data ${JSON.stringify(config.data)}` : '';
        log(`${curl.cmd({
            hostname,
            port,
            path: path,
            method: config.method,
            headers,
        })} ${json}`);
        if (writeToFS) {
            const fs = require('fs');
            const kebabCase = require('lodash.kebabcase');
            const process = require('process');
            const util = require('util');
            const { join: joinPath } = require('path');
            const promisify = util.promisify(fs.writeFile);
            const writeFile = promisify;
            writeFile(joinPath(process.cwd(), `./src/curls/${kebabCase(path)}.curl.txt`), curl.cmd({
                hostname,
                port,
                path,
                method: config.method,
                headers,
            }), 'utf-8').catch(e => console.error(e));
        }
        return config;
    });
}

module.exports = axiosCurl;