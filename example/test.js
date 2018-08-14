const {Query, DBHandle} = require('../index');

let conf = {
    connectionLimit: 1000,
    connectTimeout: 60 * 1000,
    aquireTimeout: 60 * 1000,
    timeout: 60 * 1000,
    host: 'localhost',
    user: 'root',
    password: '1111111',
    database: 'nodetest',
    port: 3306,
    useConnectionPooling: true
}

let testQuery = new Query('test', ['id', 'name', 'pwd']);

// select * ...
let sel1 = testQuery.query(['name']).getQuery();

// select name ...
let sel2 = testQuery.query([]).getQuery();

// insert into ...
let add1 = testQuery.add({ name: 'u1', pwd: 'p1' }).getQuery();

let add2 = testQuery.add({ name: 'u2', pwd: 'p2' }).getQuery();

// update ...
let upd = testQuery.update({ name: 'up1', pwd: 'pp1' }).where(['id', 1]).getQuery();

// delete ...
let del = testQuery.delete().where(['id', 2]).getQuery();

let db = DBHandle.instance(conf);

db.exec([add1, add2]).then(() => {
    console.log('add done ');
    db.exec(sel2).then(res => {
        console.log('select done ', res);
    }).catch(err => console.log('!!!error ', err));
}).catch(err => console.log('!!!error ', err));

