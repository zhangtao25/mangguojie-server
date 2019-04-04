let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');
let fs = require('fs');

// 引入mongodb包
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const url = 'mongodb://101.132.46.146:27017';
const dbName = 'mangguojie';

router.post('/usercover', function (req, res, next) {
  console.log(req.body.usercover)
  let user_email = req.headers.authorization.split(" ")[0]

  function saveUserCover(user_email){
    let imgData = req.body.usercover;
    let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    let dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile(`./public/usercover/${user_email}.png`, dataBuffer, function(err) {
      if(err){
        res.send(err);
      }else{
        res.send("保存成功！");
      }
    });
  }
  saveUserCover(user_email)
});

router.post('/useravatar', function (req, res, next) {
  console.log(req.body.useravatar)
  let user_email = req.headers.authorization.split(" ")[0]

  function saveUserCover(user_email){
    let imgData = req.body.useravatar;
    let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    let dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile(`./public/useravatar/${user_email}.png`, dataBuffer, function(err) {
      if(err){
        res.send(err);
      }else{
        res.send("保存成功！");
      }
    });
  }
  saveUserCover(user_email)
});
module.exports = router;
