// 表单常量
import dayjs from 'dayjs';
import {
  BookmakeIconType,
  BookmarkCardData,
  CardType,
  CountdownCardData,
  WeatherCardData,
} from '@/types';
import { FormRule } from 'tdesign-vue-next';

/**
 * 默认书签表单数据
 */
export const DEFAULT_BOOKMARK_FORM_DATA: BookmarkCardData = {
  type: CardType.BOOKMARK,
  name: '',
  placeholder: false,
  position: {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  },
  url: '',
  desc: '',
  icons: [],
  iconType: BookmakeIconType.TEXT,
  bgColor: '',
};

/**
 * 默认倒计时表单数据
 */
export const DEFAULT_COUNTDOWN_FORM_DATA: CountdownCardData = {
  type: CardType.COUNTDOWN,
  name: '倒计时',
  position: {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  },
  text: '',
  date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  background: '',
};

/**
 * 默认天气表单数据
 */
export const DEFAULT_WEATHER_FORM_DATA: WeatherCardData = {
  type: CardType.WEATHER,
  name: '天气',
  position: {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  },
  city: '成都',
  region: '武侯区',
};

// 书签表单规则
export const RULES_BOOKMARK_FORM: Record<string, FormRule[]> = {
  name: [{ required: true, message: '请输入书签名称', trigger: 'blur' }],
  placeholder: [{ required: true, message: '请选择书签类型', trigger: 'blur' }],
};

// 倒计时表单规则
export const RULES_COUNTDOWN_FORM: Record<string, FormRule[]> = {
  text: [{ required: true, message: '请输入倒计时文本', trigger: 'blur' }],
  date: [{ required: true, message: '请选择倒计时时间', trigger: 'blur' }],
  background: [{ required: true, message: '请选择背景图片', trigger: 'all' }],
};
