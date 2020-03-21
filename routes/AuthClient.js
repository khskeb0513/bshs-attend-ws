const express = require('express');
const router = express.Router();
const redis = require('redis');
const sql = require('mssql');
const moment = require('moment');
const qsb = require('node-qsb');

require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
var client = redis.createClient(6379, '127.0.0.1');
var config = {
    "mssql_settings": "",
    "user": "unicool",
    "password": "unicool",
    "server": "0.tcp.jp.ngrok.io",
    "port": 10632,
    "database": "busan_h"
};

router.post('/android', function (req, res) {

    var queryStudentInRecord = new qsb().select('studentin')
        .where('st_id', '=', req.body.st_id)
        .where('inDate', '=', moment().format("YYYY-MM-DD"))
        .build();
    var insertStudentInRecordData = {
        cols: ['inDate', 'inTime', 'st_id', 'class', 'gubun', 'bigo', 'state', 'STD_NAME'],
        vals: [moment().format("YYYY-MM-DD"), moment().format("HHmmss"), req.body.st_id, req.body.classNum, '', '', 'Y', '체크기1'],
    };
    var insertStudentInRecord = new qsb().insert('studentin')
        .values(insertStudentInRecordData.cols, insertStudentInRecordData.vals)
        .build();

    if (req.body.authKey == oldAuthKey() || req.body.authKey == nowAuthKey()) {
        sql.connect(config, err => {
            if (err) return res.json({success: false})

            new sql.Request().query(queryStudentInRecord.returnString(), (err, result) => {
                if (err) return res.json({success: false})
                if (result.recordset.length == 0) {
                    sql.connect(config, err => {
                        if (err) return res.json({success: false})

                        new sql.Request().query(insertStudentInRecord.returnString(), (err, result) => {
                            if (err) return res.json({success: false})
                            return res.json({success: true})
                        })
                    });
                } else {
                    return res.json({success: "conflicted"})
                }
            })
        });
    }

});

function oldAuthKey() {
    client.get('oldAuthKey', function (err, reply) {
        return reply
    })
}

function nowAuthKey() {
    client.get('nowAuthKey', function (err, reply) {
        return reply
    })
}

module.exports = router;