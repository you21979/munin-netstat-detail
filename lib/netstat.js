'use strict';
const _netstat = require('node-netstat');

const mergeParams = (a, b) => {
    let w = {};
    Object.keys(a || {}).forEach((key) => {
        w[key] = a[key]
    })
    Object.keys(b || {}).forEach((key) => {
        w[key] = b[key]
    })
    return w
}

const netstat = module.exports = (options) =>
    new Promise((resolve,rejected) => {
        let result = [];
        const opt = mergeParams({
            done: (e) => {
                if(e)   rejected(e)
                else    resolve(result)
            }, 
        }, options || {})
        _netstat(opt, (data) => {
            result.push(data)
        });
    })

