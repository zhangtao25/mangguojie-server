let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');

let authRouter = require('./routes/auth');
let userinfoRouter = require('./routes/userinfo')

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "x-requested-with,Authorization");
  res.setHeader("Access-Control-Expose-Headers", "*");
  next();
});

app.use(bodyParser.json({limit: 10*1024*1024}))
app.use(bodyParser.urlencoded({limit: 10*1024*1024, extended: true}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req,res,next){
  // 设置不需要验证的路径
  console.log(req.url)
  if(
      req.url.includes('/auth/login')||
      req.url.includes('/auth/reg')||
      req.url.includes('/auth/vcode')||
      req.url.includes('/auth/token')||
      req.url.includes('/useravatar')
  ){
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
app.use('/userinfo', userinfoRouter)

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
