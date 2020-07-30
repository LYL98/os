/**
 * 数据处理模块
 * xuxuepu create 2016-3-16
 */

export default {
  //分转元
  returnPrice(price) {
    if(!price) return 0;
    let v = price / 100;
    let p = v.toFixed(2);
    if(p.substring(p.length - 3, p.length) === '.00'){
      return p.substring(0, p.length - 3);
    }
    if(p.substring(p.length - 1, p.length) === '0'){
      return p.substring(0, p.length - 1);
    }
    return p;
  },
  //处理价格(元转为分)
  handlePrice(price){
    if(!price) return 0;
    let v = price * 100;
    return Math.round(v);
  },
  //折扣
  returnDiscount(discount) {
    if(!discount) return 0;
    let v = discount / 10;
    let p = v.toFixed(1);
    if(p.substring(p.length - 2, p.length) === '.0'){
      return p.substring(0, p.length - 2);
    }
    return p;
  },
  //处理折扣
  handleDiscount(discount) {
    if(!discount) return 0;
    let v = discount * 10;
    return Math.round(v);
  },
  //返回重量
  returnWeight(data) {
    if(!data) return 0;
    return data / 10;
  },
  //处理重量
  handleWeight(data){
    if(!data) return 0;
    let v = data * 10;
    return Math.round(v);
  },
  //返回加价率
  returnMarkup(data){
    if(!data) return 0;
    let v = data / 10;
    let p = v.toFixed(1);
    if(p.substring(p.length - 2, p.length) === '.0'){
      return p.substring(0, p.length - 2);
    }
    return p;
  },
  //处理加价率
  handleMarkup(data){
    if(!data) return 0;
    let v = data * 10;
    return Math.round(v);
  },
  //返回计算百分比
  returnPercent(data){
    if(!data) return 0;
    let v = data / 100;
    let p = v.toFixed(2);
    if(p.substring(p.length - 3, p.length) === '.00'){
      return p.substring(0, p.length - 3);
    }
    if(p.substring(p.length - 1, p.length) === '0'){
      return p.substring(0, p.length - 1);
    }
    return p;
  },
  //处理百分比
  handlePercent(data){
    if(!data) return 0;
    let v = data * 100;
    return Math.round(v);
  },
  //数字前面自动补零(num传入的数字，n需要的字符长度)
  prefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
  },
  //日期格式化
  /**
   *
   yyyy：年
   MM：月
   dd：日
   hh：1~12小时制(1-12)
   HH：24小时制(0-23)
   mm：分
   ss：秒
   S：毫秒
   E：星期几
   D：一年中的第几天
   F：一月中的第几个星期(会把这个月总共过的天数除以7)
   w：一年中的第几个星期
   W：一月中的第几星期(会根据实际情况来算)
   a：上下午标识
   k：和HH差不多，表示一天24小时制(1-24)。
   K：和hh差不多，表示一天12小时制(0-11)。
   z：表示时区
   */
  returnDateFormat(dateStr, format) {
    if (!dateStr){
      return ''
    }else if (format === 'yyyy-MM-dd') {
      return dateStr.substring(0, 10);
    } else if (format === 'MM-dd') {
      return dateStr.substring(5, 10);
    } else if (format === 'HH:mm:ss') {
      return dateStr.substring(11, 19);
    } else {
      return dateStr;
    }
  },

  /**
   * 对Date对象进行格式化
   * @param date 要格式化的Date对象
   * @param fmt 格式，例如 yyyy-MM-dd
   * @returns 格式化后的字符串
   */
  formatDate(date, fmt) {
    let o = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(), //日
      "h+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  },
};
