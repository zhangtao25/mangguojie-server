let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');

// 引入mongodb包
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const url = 'mongodb://101.132.46.146:27017';
const dbName = 'mangguojie';
// 引入邮件验证码模块
const yzm = require('./../common/mail.js');

router.get('/vcode', (req, res, next) => {

  let user_email = req.query.user_email;
  MongoClient.connect(url, (err, client) => {
    const db = client.db(dbName);
    const collection = db.collection('User');
    collection.find({'user_email': user_email})
        .toArray((err, docs) => {
          if (docs.length == 0) {
            // 生成四位随机验证码
            let user_vcode = Math.floor(Math.random() * (9999 - 1000)) + 1000;
            // 发送验证码
            yzm.send(user_email, String(user_vcode));
            // 将未激活的用户存进数据库
            let new_reg_users = {
              'user_id': '123456789',
              'user_email': user_email,
              'user_password': '',
              'user_vcode': user_vcode,
              'user_vcode_date': new Date().valueOf(),
              'user_islive': false
            };
            collection.insertMany([new_reg_users], (err, result) => {
              res.send("验证码发送成功！");
            })
          } else {
            res.status(400).send({
              errid: "8017",
              msg: "该用户已注册"
            });
          }
        });

    // 60秒后，如果账号没有激活，则删除该账号
    setTimeout(() => {
      collection.find({'user_email': user_email})
          .toArray((err, docs) => {
            if (!docs[0].user_islive) {
              collection.deleteOne({'user_email': user_email}, (err, result) => {
                console.log('已删除过期未激活的账号')
              })
            }
          });
    }, 60000)
  });
});

router.post('/reg', function (req, res, next) {
  let user_email = req.body.user_email;
  let user_password = req.body.user_password;
  let user_vcode = req.body.user_vcode;
  MongoClient.connect(url, (err, client) => {
    const db = client.db(dbName);
    const collection = db.collection('User');
    collection.find({'user_email': user_email}).toArray((err, docs) => {
      if (docs.length == 0) {
        res.status(400).send({
          errid: "8017",
          msg: "该用户尚未注册，无法发送验证码"
        });
      } else {
        let isOverdue = new Date().valueOf() - docs[0].user_vcode_date < 60000;
        if (user_vcode == docs[0].user_vcode && isOverdue) {
          let whereStr = {'user_email': user_email};
          let updateStr = {
            'user_islive': true,
            'user_password': user_password
          };
          collection.updateOne(whereStr, {$set: updateStr}, (err, result) => {
            res.send({'msg': '校验成功'})
          })
        } else {
          res.status(400).send({
            errid: "8017",
            msg: "验证码校验失败"
          });
        }
      }
    });
  });
});

router.post('/login', function (req, res, next) {
  let user_email = req.body.user_email;
  let user_password = req.body.user_password;
  MongoClient.connect(url, (err, client) => {
    const db = client.db(dbName);
    const collection = db.collection('User');
    collection.find({'user_email': user_email}).toArray((err, docs)=>{
      if (docs.length!==0){
        if (docs[0].user_password == user_password){
          let info = {user_email,user_password}
          let token = jwt.sign(info, user_email, {expiresIn: 60 * 60 * 24});
          res.send(token)
        } else {
          res.status(401).send({
            errid: "401",
            msg: "账号密码错误"
          })
        }
      } else {
        res.status(401).send({
          errid: "401",
          msg: "账号密码错误"
        })
      }
    })
  });
});
router.post('/token', function (req, res, next) {
  let user_email = req.body.user_email;
  let token = req.body.token;
  // res.send(jwt.verify(token,user_email))
  jwt.verify(token,user_email,(err, decode)=>{
    if (err){
      res.status(401).send({
        errid: "401",
        msg: "无效的token"
      })
    } else {
      res.send(decode)
    }
  })
});
module.exports = router;
