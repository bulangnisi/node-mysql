"use strict";

const mysql = require('mysql');
const Monkey = require('./Monkey');
const {remove} = require('lodash');

class DbHandle {

    constructor() {
        this.DBPool = null;
        this.monkeys = [];
    }

    instance(conf){
        this.DBPool = mysql.createPool(conf);
        return this;
    }

    getConnection() {
        return new Promise((resolve, reject) => {
            this.DBPool.getConnection((err, connection) => {
                if(err) 
                    reject(err);
                else
                    resolve(connection);
            });
        }).catch(err => {
            return Promise.reject(err);
        })
    }

    __dissolve(mark){
        remove(this.monkeys, m => { return mark == m.mark });
    }

    exec(queries){
        return new Promise((resolve, reject) => {
            return this.getConnection().then(conn => {
                if(conn){
                    let mm = new Monkey(conn, queries, resolve, reject, this.__dissolve.bind(this));
                    this.monkeys.push(mm);
                    mm.run();
                }
            }).catch(err => reject(err)); 
        })
    }
}

module.exports = new DbHandle();