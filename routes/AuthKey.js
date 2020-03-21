var express = require('express');
var router = express.Router();
var redis = require('redis');
const QRCode = require('qrcode');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
var client = redis.createClient(6379, '127.0.0.1');

// app.io = require('socket.io')();

/* GET home page. */
// router.get('/', function (req, res, next) {
//     res.render('index', {title: 'Express'});
// });

router.get('/master', function (req, res, next) {

    console.log("마스터 QR기기 reload 감지됨.");

    console.log('마스터 QR기기 reload 완료');
    client.get('nowAuthKey', function (err, reply) {
        if (err) {
            client.set('oldAuthKey', randomString());
        }
        client.set('oldAuthKey', reply);
    });
    client.set('nowAuthKey', randomString());
    client.get('nowAuthKey', function (err, reply) {
        QRCode.toDataURL(reply, {errorCorrectionLevel: 'H', width: "160"}, function (err, qrcode) {
            if (err) throw err;
            res.render('AuthKeyMaster', {
                qrcode: qrcode,
                authKey: reply
            })
        });
    });

});

router.get('/slave', function (req, res, next) {

    console.log('슬레이브 QR기기 reload 완료');
    client.get('nowAuthKey', function (err, reply) {
        QRCode.toDataURL(reply, {errorCorrectionLevel: 'H', width: "160"}, function (err, qrcode) {
            if (err) throw err;
            res.render('AuthKeySlave', {
                qrcode: qrcode,
                authKey: reply
            })
        });
    });

});

function randomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz!@#$%^&*()";
    var string_length = 18;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }

    return randomstring;
}

module.exports = router;