const express = require('express');
const router = express.Router();
const redis = require('redis');
const sql = require('mssql');
const moment = require('moment');
const async = require('async');
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

        var st_id = req.body.st_id;
        var classNum = req.body.classNum;
        var sendauthKey = req.body.authKey;

        console.log(req.body)

        async.waterfall([
            function (callback) {
                client.get('oldAuthKey', function (err, reply) {
                    callback(null, reply)
                });
            },
            function (oldAuthKey, callback) {
                client.get('nowAuthKey', function (err, reply) {
                    callback(null, oldAuthKey, reply)
                });
            },
            function (oldAuthKey, nowAuthKey) {
                if (sendauthKey == oldAuthKey || sendauthKey == nowAuthKey) {
                    sql.connect(config, err => {
                        if (err) {
                            console.log(err);
                            return res.json({
                                success: false
                            })
                        }

                        var rootqueryString = "select * from studentin where st_id='" + st_id + "' and inDate = '" + moment().format("YYYY-MM-DD") + "'";

                        new sql.Request().query(rootqueryString, (err, result) => {
                            if (err) {
                                console.log(err);
                                return res.json({
                                    success: false
                                })
                            }
                            if (result.recordset.length == 0) {
                                sql.connect(config, err => {
                                    if (err) {
                                        console.log(err);
                                        return res.json({
                                            success: false
                                        })
                                    }

                                    var queryString = "insert into studentin (inDate,inTime,st_id,class,gubun,bigo,state,STD_NAME) VALUES ('" + moment().format("YYYY-MM-DD") + "','" + moment().format("HHmmss") +
                                        "','" + st_id + "','" + classNum + "','','','Y','체크기1')";
                                    console.dir(queryString);

                                    new sql.Request().query(queryString, (err, result) => {
                                        if (err) {
                                            console.log(err);
                                            return res.json({
                                                success: false
                                            })
                                        }
                                        return res.json({
                                            success: true,
                                            requestTime: moment().format("YYYY-MM-DD h:mm:ss").toString()
                                        })
                                    })
                                });
                            } else {
                                res.json({
                                    success: "conflicted"
                                })
                            }
                        })
                    });

                } else {
                    console.log("authKey is not correct.");
                    return res.json({
                        success: false
                    })
                }
            }
        ], function (err) {
            console.log(err)
        })
    }
);
module.exports = router;
