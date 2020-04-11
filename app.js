var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

var authKeyRouter = require('./routes/AuthKey');
var authClientRouter = require('./routes/AuthClient');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authKeyRouter);
app.use('/client', authClientRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    if (err.status === 404) {
        res.render('error', {
            code: err.status,
            message: "찾을 수 없음.",
            // stacktrace: err
            stacktrace: null
        });
    } else {
        res.render('error', {
            code: err.status || 500,
            message: "내부 오류.",
            // stacktrace: err
            stacktrace: null
        });
    }
});

app.io = require('socket.io')();

app.io.on('connection', function (socket) {

    console.log("QR기기 연결됨.");

    socket.on('disconnect', function () {
        console.log('QR기기 연결종료됨.');
    });

    socket.on('authkey_status', function (msg) {
        if (msg === 'master client request reloading slave client') {
            console.log('마스터 QR기기 reload');
            socket.broadcast.emit('authkey_status', 'server request reloading slave client reasoned by master requested');
            console.log('슬레이브 QR기기 reload 요청');
        } else if (msg === 'request reloading master client manually by admin') {
            console.log('수동 마스터 QR기기 reload');
            socket.broadcast.emit('authkey_status', 'server request reloading master client manually');
            console.log('마스터 QR기기 reload 요청');
        }
    });

});

module.exports = app;
