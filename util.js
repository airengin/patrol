let config = require("./config");
var fs = require('fs');
let mails = config.mails;//巡检顺序

function whichWeek(logger) {
    let today = new Date();//获取当前时间
    let year = today.getFullYear();
    let date1 = today;
    let date0 = new Date();
    date0.setFullYear(year, 0, 1);
    let count = (date1.valueOf() - date0.valueOf()) / 86400000;
    let whichWeek = Math.ceil((count + date0.getDay() ) / 7);
    logger.info("whichWeek=" + whichWeek);
    return whichWeek;
}

function whoPatrol(logger) {
    let today = new Date();//获取当前时间
    let d = today.getDay() - 1;//星期几0-6,
    if (d == -1) {
        d = 6;
    }
    logger.info("星期：" + (d + 1));
    let numb = d % mails.length;//第几个
    logger.info("巡检次序" + numb);
    let reutrnWho = mails[numb] + "";
    logger.info("巡检人：" + reutrnWho);
    logger.info("当前巡检顺序：" + JSON.stringify(mails));
    return reutrnWho;
}
/**
 * 谁巡检，排除一个aMail
 * @param logger
 * @param aMail
 * @returns {string}
 */
function whoPatrolWithoutRepeat(logger, aMail) {
    let who = whoPatrol(logger);
    //发送给某人
    if (who !== aMail) {
        who += ',' + aMail;
    }
    return who;
}

//巡检顺序写到文件中
function writeToFile(mails, logger) {
    fs.exists('./saved', function (exists) {
        try {
            fs.writeFile('./saved', mails, 'utf8',
                function (err) {
                    if (err) {
                        throw err;
                    } else {
                        logger.info("保存数据成功");
                    }
                }
            );
        } catch (e) {
            logger.info("保存数据失败:" + JSON.stringify(e));
        }
    });
}
//是否是数组
function isArray(o) {
    return Object.prototype.toString.call(o) == '[object Array]';
}
/*
 根据巡检人数，排列下次mails顺序
 */
function reOrderMails(mails) {
    if (isArray(mails)) {
        //移动个数
        let move = 1;
        //当人数小于7时
        if (mails.length <= 7) {
            move = 7 % mails.length;
        } else {
            move = 7;
        }
        //如果是0，正好7位时，往前移动一位
        if (move == 0) {
            move = 1;
        }
        //复制一份mails
        let record = mails.slice(0);
        //值班次数少一次的前移move 位
        for (let i = 0; i + move < record.length; i++) {
            mails[i] = record[i + move];
        }
        //值班次数多的后移mails.length - move 位
        for (let i = mails.length - move, j = 0; i < mails.length && j < move; i++, j++) {
            mails[i] = record[j];
        }
    }
}
/**
 * 初始化mails
 * @param callback
 */

function initMails(callback, logger) {
    fs.exists('./saved', function (exists) {
        if (exists) {
            try {
                fs.readFile('./saved', 'utf8', function (err, data) {
                    if (err) {
                        throw err;
                    } else {
                        logger.info("读取./saved 数据:" + data);
                        mails = data.split(",") || mails;
                        logger.info("mails 数据:" + JSON.stringify(mails));
                        if (callback instanceof Function) {
                            callback.apply(this);
                        }
                    }
                });
            } catch (e) {
                logger.info("读取./saved 数据错误:" + JSON.stringify(e));
                if (callback instanceof Function) {
                    callback.apply(this);
                }
            }
        } else {
            logger.info("./saved 不存在");
            if (callback instanceof Function) {
                callback.apply(this);
            }
        }
    });
}
/**
 * 星期天23点59,修改巡检顺序
 */
function changePatrolOrder(logger) {
    let today = new Date();//获取当前时间
    //当前时间是星期天且是23点59时，重新设置mails数组
    if (today.getDay() == 0 && today.getHours() === 23 && today.getMinutes() === 59) {
        reOrderMails(mails);
        logger && logger.info("下周巡检顺序：" + JSON.stringify(mails));
        writeToFile(mails, logger);
    }
}
/**
 * 是否是巡检时间
 * @param curDate
 * @returns {boolean}
 */

function isPatrolTime(curDate) {
    for (let i = 0; i < config.patrolTimes.length; i++) {
        if (curDate.getHours() === config.patrolTimes[i]) {
            return true;
        }
    }
    return false;
}
module.exports = {
    whichWeek, whoPatrol, whoPatrolWithoutRepeat, reOrderMails, initMails, mails, isPatrolTime, changePatrolOrder
}