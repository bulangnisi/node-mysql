const queues = require('mysql-queues');
class Monkey {

    constructor(connect, queries, resolve, reject, dissolve){
        this.mark = this.__initMark();
        this.connect = connect;
        queues(this.connect);
        this.transaction = this.connect.startTransaction();
        this.queries = queries;
        if(!Array.isArray(queries)) this.queries = [queries];
        this.resolve = resolve;
        this.reject = reject;
        this.dissolve = dissolve;
        this.errCount = 0;
        this.queryCount = 0;
    }

    run(){
        for(let q of this.queries){
            this.transaction.query(q.sql, q.params, this.__queryBack.bind(this));
        }
        this.transaction.execute();
        this.connect.release();
    }

    __queryBack(err, result){
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
            console.log('猴子跑完了');
            if(this.dissolve) this.dissolve(this.mark);
        }
    }

    __initMark(){
        return Date.now() + Math.round(Math.random() * 1000) + '';
    }

}

module.exports = Monkey;