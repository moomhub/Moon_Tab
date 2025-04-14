import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 配置中文环境和时区插件
dayjs.locale('zh-cn');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Shanghai'); // 设置为中国时区

/**
 * Description 获取当前星期
 * @returns {any}
 */
export const getCurrentWeek = () => {
  const date = dayjs();
  return date.format('dddd');
};

/**
 * Description 计算传入时间与当前时间相差的天数
 * @param {string | number | Date} time - 要对比的时间，可以是字符串、时间戳或 Date 对象
 * @returns {number} 相差的天数，正数表示传入时间在当前时间之后，负数表示传入时间在当前时间之前
 */
export const getDaysDifference = (time: string | number | Date) => {
  const currentDate = dayjs().startOf('day');
  const compareDate = dayjs(time).startOf('day');
  return compareDate.diff(currentDate, 'day');
};

// 修正为正确的导出语句
export { dayjs };
