let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let jwt = require('jsonwebtoken')

let authRouter = require('./routes/auth');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use(function(req,res,next){
  // 设置不需要验证的路径
  console.log(req.url)
  if(req.url=='/auth/login'||req.url=='/auth/reg'||req.url=='/auth/vcode'||req.url=='/auth/token'){
    console.log(1)
    next()
  }else{
    let user_email = req.headers.authorization.split(" ")[0]
    let token = req.headers.authorization.split(" ")[1]
    console.log(user_email,token)
    jwt.verify(token,user_email,function(err,decode){
      if(err){
        res.status(401).send({
          errid: "401",
          msg: "无效的token"
        })
      }else{
        console.log('校验成功')
        next();
      }
    })
  }
});

app.use('/auth', authRouter);

// console.log(req.headers.authorization)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
