var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

var authKeyRouter = require('./routes/AuthKey');
var authClientRouter = require('./routes/AuthClient');
var usersRouter = require('./routes/users');

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
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.io = require('socket.io')();

app.io.on('connection', function(socket){

  console.log("QR기기 연결됨.");

  socket.on('disconnect', function(){
    console.log('QR기기 연결종료됨.');
  });

  socket.on('master', function(msg){
      if (msg == 'reload') {
          console.log('마스터 QR기기 reload');
          socket.broadcast.emit('slave','reload');
          console.log('슬레이브 QR기기 reload 요청');
      }
  });

  function alertReload() {
      socket.broadcast.emit('slave','reload');
      console.log('슬레이브 QR기기 reload 요청');
  }

});

module.exports = app;
