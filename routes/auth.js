let express = require('express');
let router = express.Router();

// 引入mongodb包
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const url = 'mongodb://101.132.46.146:27017';
const dbName = 'mangguojie';
// 引入邮件验证码模块
const yzm = require("./../common/mail.js");//发送验证码

router.get('/vcode', function (req, res, next) {
  let user_email = req.query.user_email;
  MongoClient.connect(url, (err, client) => {
    const db = client.db(dbName);
    const collection = db.collection('User');
    collection.find({'user_email': user_email}).toArray((err, docs) => {
      if (docs.length == 0) {
        // 生成四位随机验证码
        let user_vcode = Math.floor(Math.random() * (9999 - 1000)) + 1000;
        // 发送验证码
        yzm.send(user_email, String(user_vcode));
        // 将未激活的用户存进数据库
        let new_reg_users = {
          "user_id": "123456789",
          "user_email": user_email,
          "user_password": "",
          "user_vcode": user_vcode,
          "user_vcode_date": new Date().valueOf(),
          "user_islive": false
        };
        collection.insertMany([new_reg_users], function (err, result) {
          res.send({'msg': "已将未激活的用户存进数据库"})
        })
      } else {
        res.send({"msg": "该用户已注册"})
      }
    });

    // 60秒后，如果账号没有激活，则删除该账号
    setTimeout(function () {
      collection.find({'user_email': user_email}).toArray((err, docs) => {
        console.log(docs[0].user_islive)
        if (!docs[0].user_islive) {
          collection.deleteOne({"user_email": user_email}, function (err, result) {
            console.log("已删除")
          })
        }
      });
    }, 60000)
  });
});

router.post('/reg', function (req, res, next) {
  let user_email = req.body.user_email;
  let user_vcode = req.body.user_vcode;
  MongoClient.connect(url, (err, client) => {
    const db = client.db(dbName);
    const collection = db.collection('User');
    collection.find({'user_email': user_email}).toArray((err, docs) => {
      if (docs.length == 0) {
        res.send({"msg": "尚未注册"})
      } else {
        let isOverdue = new Date().valueOf() - docs[0].user_vcode_date < 60000;
        if (user_vcode == docs[0].user_vcode && isOverdue) {

          // let
          collection.updateOne({'user_email': user_email}, {$set: {user_islive: true}}, function () {

          })
          res.send({"msg": "校验成功"})
        } else {
          res.send({"msg": "校验失败"})
        }
      }
    });
  });
});
module.exports = router;
