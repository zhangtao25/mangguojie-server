const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
  service: 'qq',// 运营商选择
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: '905019230@qq.com', // 发送方的邮箱
    pass: 'vxlxqybivuvibdaa' //   pop3 授权码
  }
});
let mail={
  transporter:transporter,
  send(tomail,msg){
    //邮件内容
    let mailOptions = {
      from: '"IT 学习平台 👻" <905019230@qq.com>', // 发送方邮箱
      to: tomail, // list of receivers
      subject: '这里是标题', // Subject line
      text: '文本信息?', // plain text body
      html: msg // html body
    };
    //发送邮件
    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);

    });
  }
}
module.exports=mail;
