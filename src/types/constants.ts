import {
  SwiperData,
  CardType,
  BookmakeIconType,
  BookmarkCardData,
  CardInformationData,
} from './index';

export const engineImage = {
  baidu: 'https://www.baidu.com/s?wd=',
  bing: 'https://www.bing.com/search?q=',
  yandex: 'https://yandex.com/search/?text=',
};



/**
 * 所有可用的卡片组件配置
 */
export const ALL_COMPONENT_CARD: ReadonlyArray<CardInformationData> = [
  {
    title: '书签',
    type: CardType.BOOKMARK,
    image: new URL('@/assets/card/bookmark.svg', import.meta.url).href,
    desc: '保存链接网页，方便快速访问常用网站，还能分类整理网页，提升浏览效率',
  },
  {
    title: '天气',
    type: CardType.WEATHER,
    image: new URL('@/assets/card/weather.svg', import.meta.url).href,
    desc: '显示当前城市天气状况，包括温度、湿度和未来几天天气预报.',
  },
  {
    title: '倒计时',
    type: CardType.COUNTDOWN,
    image: new URL('@/assets/card/countdown.svg', import.meta.url).href,
    desc: '倒计时功能，用于提示重要事件,节日,任务的剩余时间.',
  },
] as const;


enum LayoutType {
  ONE = '1x1',
  TWO = '2x1',
  THREE = '2x2',
}