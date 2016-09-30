#!/usr/bin/env node
const netstat = require('../lib/netstat');
const tcpstat = require('../lib/tcpstat');
const munin = require('munin-plugin');
const task = require('promise-util-task');

const arg = () => {
    return {
    }
}

const initialize = () => {
    global.Promise = require('bluebird')
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const finalize = (list) => munin.create(list)

const main = (arg) => {
    initialize();

    const tcpOption = {
        filter: {
            protocol: 'tcp'
        }
    }
    const tcp6Option = {
        filter: {
            protocol: 'tcp6'
        }
    }
    const netstatTcp = () => netstat(tcpOption).
        then(list => list.reduce((r,v) => {
            r[v.state]++;
            return r
        }, tcpstat.TCP_STATE_LIST.reduce((r,v)=>{r[v] = 0; return r},{})))
    const netstatTcp6 = () => netstat(tcp6Option).
        then(list => list.reduce((r,v) => {
            r[v.state]++;
            return r
        }, tcpstat.TCP_STATE_LIST.reduce((r,v)=>{r[v] = 0; return r},{})))

    return task.seq([
        () => netstatTcp().then(res => {
            const g = new munin.Graph('netstat tcp4','count','network');
            Object.keys(res).forEach(k => {
                g.add(new munin.Model.Default(k).setValue(res[k]).setDraw('STACK'));
            })
            return g;
        }),
        () => netstatTcp6().then(res => {
            const g = new munin.Graph('netstat tcp6','count','network');
            Object.keys(res).forEach(k => {
                g.add(new munin.Model.Default(k).setValue(res[k]).setDraw('STACK'));
            })
            return g;
        })
    ]).then(list => finalize(list))
}

main(arg())





