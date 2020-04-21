const express = require('express');
const router = express.Router();
const redis = require('redis');
const sql = require('mssql');
const moment = require('moment');
const async = require('async');

require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
const client = redis.createClient(6379, '127.0.0.1');
const config = {
    mssql_settings: "",
    user: "unicool",
    password: "unicool",
    server: "0.tcp.jp.ngrok.io",
    port: 10632,
    database: "busan_h",
    options: { "enableArithAbort": true }
};

const pool = new sql.ConnectionPool(config);

// noinspection JSUnresolvedFunction
router.post('/android', function (req, res) {

        const st_id = req.body.st_id;
        const classNum = req.body.classNum;
        const sendauthKey = req.body.authKey;
        const inDate = moment().format("YYYY-MM-DD");

        async.waterfall([
            function (done) {
                client.get('oldAuthKey', function (err, reply) {
                    done(null, reply)
                });
            },
            function (oldAuthKey, done) {
                client.get('nowAuthKey', function (err, reply) {
                    done(null, {oldAuthKey: oldAuthKey, nowAuthKey: reply});
                });
            },
            function (AuthKeyData, done) {
                if (sendauthKey === AuthKeyData.oldAuthKey || sendauthKey === AuthKeyData.nowAuthKey) {
                    return done(null)
                }
                return done("wrong_authkey", null)
            },
            function (done) {
                pool.connect(err => {
                    const ps = new sql.PreparedStatement(pool);
                    ps.input('st_id', sql.TYPES.NVarChar);
                    ps.input('inDate', sql.TYPES.DateTime);
                    ps.prepare('SELECT * FROM studentin WHERE st_id = @st_id AND inDate = @inDate', err => {
                        if (err) return done(err, null);
                        ps.execute({st_id: st_id, inDate: inDate}, (err, result) => {
                            if (err) return done(err, null);
                            if (result['rowsAffected'][0] === 0) {
                                return done(null)
                            } else {
                                return done("conflicted", result);
                            }
                        })
                    })
                })
            },
            function (done) {
                const inTime = moment().format("HHmmss");
                pool.connect(err => {
                    const ps = new sql.PreparedStatement(pool);
                    ps.input('inDate', sql.TYPES.DateTime);
                    ps.input('inTime', sql.TYPES.NVarChar);
                    ps.input('st_id', sql.TYPES.NVarChar);
                    ps.input('classNum', sql.TYPES.NVarChar);
                    ps.input('gubun', sql.TYPES.NVarChar);
                    ps.input('bigo', sql.TYPES.NVarChar);
                    ps.input('state', sql.TYPES.NVarChar);
                    ps.input('STD_NAME', sql.TYPES.NVarChar);
                    ps.prepare('INSERT INTO studentin (inDate,inTime,st_id,class,gubun,bigo,state,STD_NAME) VALUES '
                        + '(@inDate, @inTime, @st_id, @classNum, @gubun, @bigo, @state, @STD_NAME)', err => {
                        if (err) return done(err, null);
                        ps.execute(
                            {
                                st_id: st_id,
                                inDate: inDate,
                                inTime: inTime,
                                classNum: classNum,
                                gubun: "",
                                bigo: "",
                                state: "Y",
                                STD_NAME: "체크기1"
                            }, (err, result) => {
                                if (err) return done(err, result);
                                return done(null, result)
                            })
                    })
                })
            }
        ], function (err, result) {
            const personalInformation = " " + inDate + " " + classNum + "학년 " + st_id;
            if (err) {
                if (err.toString() === "conflicted") {
                    console.error("conflicted" + personalInformation);
                    console.error(result.recordset[0]);
                    return res.json({success: "conflicted"});
                } else if (err.toString() === "wrong_authkey") {
                    console.error("wrong_authkey" + personalInformation);
                    return res.json({success: false});
                } else {
                    console.error("SOMETHING WRONG!" + personalInformation);
                    console.error(err);
                    return res.json({success: false})
                }
            }
            console.log("attend" + personalInformation);
            return res.json({
                success: true,
                requestTime: moment().format("YYYY-MM-DD h:mm:ss").toString()
            })
        })
    }
);

module.exports = router;
