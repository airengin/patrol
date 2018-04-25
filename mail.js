let nodemailer = require("nodemailer");
let smtpTransport = require('nodemailer-smtp-transport');
let utils = require("./util");
let config = require("./config");

// 开启一个 SMTP 连接池
let transport = nodemailer.createTransport(smtpTransport({
    host: "myhost.com", // 主机
    secure: true, // 使用 SSL
    port: 465, // SMTP 端口
    auth: {
        user: "######", // 账号
        pass: "######" // 密码
    },
    tls: {rejectUnauthorized: false}
}));

/**
 *
 * @param sendto
 * @param content
 * @param attachments
 * @returns {{from: string, to: string, subject: string, html: string}}
 */
function setOptions(sendto, content, attachments) {
    // 设置邮件内容
    let mailOptions = {
        from: "<######@#####>", // 发件地址
        to: sendto ? sendto : "######@#####", // 收件列表
        subject: "值班", // 标题
        html: content,// html 内容
    };
    //存在附件
    if (attachments) {
        mailOptions.attachments = attachments;//附件
    }
    return mailOptions;
}
/**
 *  * 发送邮件
 * @param sendTo
 * @param content
 * @param attachments
 * @param logger
 */
function sendMail(sendTo, content, attachments, logger) {
    logger.info("sendTo:" + JSON.stringify(sendTo) + ",content:" + JSON.stringify(content));
    let mailOptions = setOptions(sendTo, content, attachments);
    // 发送邮件
    transport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.error(error);
        } else {
            logger.info("发送邮件到" + sendTo);
            logger.info(response);
        }
    });
}
/**
 * 向所有人发邮件
 * @param logger
 * @param title
 */

function sendMailToAll(logger, title) {
    //拷贝一份数据[发送时还没到下周，数据还是本周的，且不能修改]
    let nextMails = utils.mails.slice(0);
    //重排数据,准备下一周值班顺序
    utils.reOrderMails(nextMails);
    let content = "<b>下周值班应用:" + title + "</b><br /><b>值班顺序:</b><br /><br />";//发送内容，值班顺序
    let sendTo = "";//发送给谁
    for (let i = 0; i < 7; i++) {
        let mail = nextMails[i % nextMails.length];
        content += config.weekMap[i] + "  " + config.nameMap[mail] + "<br />";
        if (i < nextMails.length) {
            sendTo += nextMails[i] + ",";
        }
    }
    sendMail(sendTo, content, "", logger);
}


module.exports = {
    sendMail,
    sendMailToAll
}