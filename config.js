var startTime = new Date();//开始时间
startTime.setFullYear(2017);
startTime.setMonth(10);
startTime.setDate(27);
startTime.setHours(0);
startTime.setMinutes(0);
startTime.setSeconds(0);

module.exports = {
    mails: [
        "######@#####",
        "######@#####",
        "######@#####"
    ],
    nameMap: {
        "######@#####": "name",
        "######@#####": "name",
        "######@#####": "name"
    },
    weekMap: [
        "周一",
        "周二",
        "周三",
        "周四",
        "周五",
        "周六",
        "周日"
    ],
    content: [
        "production1,production2",
        "production2，productio3"
    ],
    intervalTime: 60 * 60 * 1000, //轮询时间
    changeMailOrderInterval: 60 * 1000,//修改邮件顺序的轮询时间
    sendTime: 5,//发邮件时间,
    startTime: startTime || new Date(),//从什么时间开始
    whichHourSendToAll: 15,//0-23 下午3点
    whichDaySendToAll: 5//0-6  ,每周五
};