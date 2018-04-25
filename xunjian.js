let logger = require("./logger").logger("normal");
let config = require("./config");
let utils = require("./util");
let mail = require("./mail");

let dailySendMailTime;//记录已发送过的时间
let weeklySendMailTime;//记录已向全部人员发送邮件的时间


//执行一次
function sendPatrolOrderMail() {
    let nowDate = new Date();
    let week = utils.whichWeek(logger);
    //每周whichDaySendToAll(周几)发送一次全部人员的
    if (nowDate.getDay() === config.whichDaySendToAll && nowDate.getHours() >= config.whichHourSendToAll) {
        if (!weeklySendMailTime || weeklySendMailTime.getDate() !== nowDate.getDate()) {
            weeklySendMailTime = nowDate;
            //下周需要值班的apps
            let nextTitle = "";
            if (!isNaN(week)) {
                let order = (week % 2) ? 0 : 1;
                nextTitle = config.content && config.content[order];
            }
            mail.sendMailToAll(logger, nextTitle);
        }
    }
    //每天只发一次，提醒今天值班的人
    if (dailySendMailTime && dailySendMailTime.getDate() === nowDate.getDate()) {
        logger.info("今天已发送");
        return null;
    } else {
        //每天 sendTime 时发送一次
        if (nowDate.getHours() >= config.sendTime && nowDate.getTime() > config.startTime) {
            let who = utils.whoPatrolWithoutRepeat(logger, "#####");
            dailySendMailTime = nowDate;
            let title = "";
            if (!isNaN(week)) {
                title = config.content && config.content[week % 2];
            }
            let content = "<b>今天轮到你值班啦，请按时值班。值班应用:" + title + "</b> ";
            mail.sendMail(who, content, "", logger);
        }
    }
}

/**
 * 修改巡检顺序
 */
function modifyPatrolOrder() {
    utils.changePatrolOrder(logger);
}

function start() {
    //每天发送巡检提醒邮件，以及发送下周巡检顺序
    sendPatrolOrderMail();
    setInterval(sendPatrolOrderMail, config.intervalTime);
    //周日最后一分钟修改巡检顺序
    modifyPatrolOrder();
    setInterval(modifyPatrolOrder, config.changeMailOrderInterval);
}
utils.initMails(start, logger);
