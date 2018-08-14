"use strict";

/**
 *
 * @param {Object} curBase - 当前DAO对象数据
 * @param {String} ebm - 表达式
 * @param {Array} cd - 操作数据 [键 值]
 * @param {String} m - 判断操作 默认不传为 等于操作 , 支持 >, >=, <, <=, !=
 */
let where = (curBase, ebm, cd, m) => {
    if (!cd) {
        return;
    }

    let n = curBase.sql.indexOf('WHERE') < 0;
    if (n) {
        if (cd[1] == null) {
            curBase.sql += ` WHERE ${cd[0]} ${m ? 'is not null' : 'is null'}`;
        } else {
            curBase.sql += ` WHERE ${cd[0]} ${m ? m : '='}?`;
        }
    } else if (ebm != 'WHERE') {
        if (cd[1] == null) {
            curBase.sql += ` ${ebm} ${cd[0]} ${m ? 'is not null' : 'is null'}`;
        } else {
            curBase.sql += ` ${ebm} ${cd[0]} ${m ? m : '='}=?`;
        }
    }
    if (cd[1] != null)
        curBase.values.push(cd[1]);
};

class Query {

    constructor(table, fields) {
        this.table = table;
        this.fields = fields;
        this.sql = '';
        this.values = [];
    }

    query(fields) {
        if(!Array.isArray(fields) || !fields)
           fields = [];
        let _fields;
        if (fields.length == 0) {
            let temp = [];
            for (let f of this.fields) {
                temp.push(f);
            }
            _fields = temp.toString();
        } else {
            _fields = fields.toString();
        }
        this.sql = `SELECT ${_fields} FROM ${this.table}`;
        return this;
    }

    update(obj) {
        let sets,
            temp = [];
        for (let f in obj) {
            temp.push(`${f}=?`);
            this.values.push(obj[f]);
        }
        sets = temp.toString();
        this.sql = `UPDATE ${this.table} set ${sets}`;
        return this;
    }

    add(obj) {
        let _fields,
            vals,
            temp = [],
            tempV = [];
        for (let f in obj) {
            temp.push(f);
            tempV.push('?');
            this.values.push(obj[f]);
        }
        _fields = temp.toString();
        vals = tempV.toString();
        this.sql = `INSERT INTO ${this.table}(${_fields}) VALUES(${vals})`;
        return this;
    }

    delete() {
        this.sql = `DELETE FROM ${this.table}`;
        return this;
    }

    where(cd, m) {
        where(this, 'WHERE', cd, m);
        return this;
    }

    and(cd, m) {
        where(this, 'AND', cd, m);
        return this;
    }

    or(cd, m) {
        where(this, 'OR', cd, m);
        return this;
    }

    between(op, field, val1, val2) {
        if (this.sql.indexOf('WHERE') < 0) {
            this.sql += ` WHERE `;
        } else {
            this.sql += ` ${op} `
        }
        this.sql += `${field} BETWEEN ? AND ?`;
        this.values.push(val1);
        this.values.push(val2);
        return this;
    }

    orderBy(field, rule = 'DESC') {
        this.sql += ` ORDER BY ${field} ${rule}`;
        return this;
    }

    limit(start, length) {
        this.sql += ` LIMIT ${start}`;
        if (length > 0) this.sql += `,${length}`;
        return this;
    }

    getQuery(){
        let q = {
            sql: this.sql, 
            params: this.values
        }
        this.clear();
        return q;
    }

    clear(){
        this.sql = '';
        this.values = [];
    }

}

module.exports = Query;