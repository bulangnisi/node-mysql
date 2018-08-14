"use strict";

const mysql = require('mysql');
const queues = require('mysql-queues');

class DbHandle {

    constructor() {
        this.DBPool = null;
        this.__initTransaction();
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

    __initTransaction(){
        this.transaction = null;
        this.errCount = 0;
        this.queryCount = 0;
        this.queries = [];
        this.resolve = null;
        this.reject = null;
    }

    __queryResult(err, result){
        this.queryCount ++;
        if(err) this.errCount ++;
        if(this.queryCount == this.queries.length) {
            if (this.errCount == 0) {
                this.transaction.commit();
                this.resolve(result);
            }else{
                this.transaction.rollback();
                this.reject(err);
            }
            this.__initTransaction();
        }
    }

    exec(queries){
        return new Promise((resolve, reject) => {
            return this.getConnection().then(conn => {
                this.queries = Array.isArray(queries) ? queries : [queries];
                this.resolve = resolve;
                this.reject = reject;
                if(conn != null){
                    queues(conn);
                    this.transaction = conn.startTransaction();
                }
                for(let q of this.queries){
                    this.transaction.query(q.sql, q.params, this.__queryResult.bind(this));
                }
                this.transaction.execute();
            }).catch(err => reject(err)); 
        })
    }
}

module.exports = new DbHandle();