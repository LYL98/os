/**
 * 日期格式化为字符串 {year: 2019, month: 10, date: 12} => '2019-11-12'
 */
export function formatDate(v) {
  let { year, month, date } = v;
  month++;
  return [year, month, date].map(n => (n += '')[1] ? n : '0' + n).join('-');
}

/**
 *
 * 字符串格式化为日期对象 '2019-11-12' => {year: 2019, month: 10, date: 12}
 */
export function convertDate(v) {
  v = new Date(v.replace(/-/g, '/')); // 兼容 mac 系统
  return { year: v.getFullYear(), month: v.getMonth(), date: v.getDate() };
}

/**
 * 上一个月
 * @param year
 * @param month
 * @returns {{month: *, year: *}}
 */
export function prevMonth(year, month) {
  if (month !== 0) {
    month--;
  } else {
    month = 11;
    year--;
  }
  return { year, month };
}

/**
 * 下一个月
 * @param year
 * @param month
 * @returns {{month: *, year: *}}
 */
export function nextMonth(year, month) {
  if (month === 11) {
    year++;
    month = 0;
  } else {
    month++;
  }
  return { year, month };
}

/**
 * 生成日历
 * @param year
 * @param month
 * @param limit
 * @param weekStartsWith
 * @returns {{weeks: *, month: *, year: *}}
 */
export function generateCalendar (year, month, limit = { }, weekStartsWith = 0) {
  let rows = [];
  try {
    // 本月的第一天
    let firstDay = new Date(year, month, 1);

    // 上个月最后一天
    let prevMonthLastDate = new Date(year, month, 0).getDate();

    let startIndex = firstDay.getDay();

    // 本月的天数
    let daysNum = new Date(year, month + 1, 0).getDate();

    let weekOffset = 0;

    if (weekStartsWith > startIndex) {
      weekOffset = 7 - weekStartsWith
    } else {
      weekOffset = 0 - weekStartsWith
    }

    for (let i = 0; i < 6; i++) {
      rows.push([]);
      for (let j = 0 - weekOffset; j < 7 - weekOffset; j++) {
        let currentIndex = i * 7 + j;
        let date = {year: year, disabled: false};
        // date in and not in current month
        if (currentIndex < startIndex) {
          date.date = prevMonthLastDate - startIndex + currentIndex + 1;
          if (month > 0) {
            date.month = month - 1
          } else {
            date.month = 11;
            date.year--
          }
        } else if (currentIndex < startIndex + daysNum) {
          date.date = currentIndex - startIndex + 1;
          date.month = month
        } else {
          date.date = currentIndex - startIndex - daysNum + 1;
          if (month < 11) {
            date.month = month + 1
          } else {
            date.month = 0;
            date.year++
          }
        }
        // process limit dates
        let dateObj = new Date(date.year, date.month, date.date);

        let beforeFrom = false;
        let afterTo = false;
        if (limit && limit.from) {
          beforeFrom = dateObj < new Date(limit.from.replace(/-/g, '/'))
        }
        if (limit && limit.to) {
          afterTo = dateObj > new Date(limit.to.replace(/-/g, '/'))
        }
        date.disabled = beforeFrom || afterTo;
        // date.classes = isFunction(this.dateClass) ? this.dateClass(dateObj) : ''
        rows[i].push(date)
      }
    }
  } catch (err) {
    console.warn('[pgyos]: calendar generate fail: ', err);
  }

  return { year: year, month: month, weeks: rows }
}

/**
 * 选择固定日期范围
 * @param type
 * @returns {[{date: *, month: *, year: *}, {date: *, month: *, year: *}]}
 */
export function fixDateRange(type) {
  let beginDate, endDate;
  switch (type) {
    case 1: {
      //今日
      let today = new Date();
      beginDate = endDate = today;
      break;
    }
    case 2: {
      //昨日
      let today = new Date();
      let yesterday = new Date(today.setDate(today.getDate() - 1));
      beginDate = endDate = yesterday;
      break;
    }
    case 3: {
      //本周
      const today = new Date();
      const nowDay = today.getDate();
      const nowDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
      beginDate = new Date(today.getFullYear(), today.getMonth(), nowDay - nowDayOfWeek + 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), nowDay + (6 - nowDayOfWeek + 1));
      break;
    }
    case 4: {
      //上周
      const today = new Date();
      const nowDay = today.getDate();
      const nowDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
      beginDate = new Date(today.getFullYear(), today.getMonth(), nowDay - nowDayOfWeek - 7 + 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), nowDay - nowDayOfWeek - 1 + 1);
      break;
    }
    case 5: {
      //最近7天
      const start = new Date();
      const end = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
      beginDate = start;
      endDate = end;
      break;
    }
    case 6: {
      //本月
      const today = new Date();
      beginDate = new Date(today.getFullYear(), today.getMonth(), 1);
      let end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const interval = (end.getTime() - beginDate.getTime()) / (1000 * 60 * 60 * 24);
      endDate = new Date(today.getFullYear(), today.getMonth(), interval);
      break;
    }
    case 7: {
      //上月
      const start = new Date();
      start.setDate(1);
      start.setMonth(start.getMonth() - 1);
      const endTime = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      beginDate = new Date(start.getFullYear(), start.getMonth(), 1);
      const interval = endTime.getTime() - beginDate.getTime();
      endDate = new Date(start.getFullYear(), start.getMonth(), interval / (1000 * 60 * 60 * 24));
      break;
    }
    case 8: {
      //最近30天
      const start = new Date();
      const end = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      beginDate = start;
      endDate = end;
      break;
    }
    case 9: {
      //本年
      const today = new Date();
      beginDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      break;
    }
    case 10: {
      //上年
      const today = new Date();
      beginDate = new Date(today.getFullYear() - 1, 0, 1);
      endDate = new Date(today.getFullYear(), 0, 0);
      break;
    }
  }

  beginDate = {year: beginDate.getFullYear(), month: beginDate.getMonth(), date: beginDate.getDate()};
  endDate = {year: endDate.getFullYear(), month: endDate.getMonth(), date: endDate.getDate()};

  return [beginDate, endDate];
}
