import { IconData, IconStoreType } from '@/types/icon';

// ==========================本地默认图标===================================
export const DEFAULT_BOOKMARK_DEEPSEEK_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/deepseek.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_KIMI_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/kimi.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_TIEBA_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/tieba.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_DOUYIN_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/douyin.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_NETEASE_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/netease.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_BILIBILI_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/bilibili.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_TOUTIAO_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/toutiao.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_WEIBO_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/weibo.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_ZHIHU_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/zhihu.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_TAOBAO_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/taobao.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_JD_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/jd.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_GITHUB_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/github.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_DOUBAO_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/doubao.svg', import.meta.url).href,
};

export const DEFAULT_BOOKMARK_QWEN_ICON: IconData = {
  store: IconStoreType.LOCAL,
  url: new URL('@/assets/bookmark/qwen.svg', import.meta.url).href,
};


// 默认书签图标
export const DEFAULT_BOOKMARK_ICON = new URL(
  '@/assets/bookmark/bookmark.svg',
  import.meta.url
).href;


export const DEFAULT_BOOKMARK_ICON_DATA: IconData = {
  store: IconStoreType.LOCAL,
  url: DEFAULT_BOOKMARK_ICON,
};

// 本地图标数据
export const ICON_LOCAL_DATA = [
  DEFAULT_BOOKMARK_DEEPSEEK_ICON,
  DEFAULT_BOOKMARK_KIMI_ICON,
  DEFAULT_BOOKMARK_TIEBA_ICON,
  DEFAULT_BOOKMARK_DOUYIN_ICON,
  DEFAULT_BOOKMARK_NETEASE_ICON,
  DEFAULT_BOOKMARK_BILIBILI_ICON,
  DEFAULT_BOOKMARK_TOUTIAO_ICON,
  DEFAULT_BOOKMARK_WEIBO_ICON,
  DEFAULT_BOOKMARK_ZHIHU_ICON,
  DEFAULT_BOOKMARK_TAOBAO_ICON,
  DEFAULT_BOOKMARK_JD_ICON,
  DEFAULT_BOOKMARK_GITHUB_ICON,
  DEFAULT_BOOKMARK_DOUBAO_ICON,
  DEFAULT_BOOKMARK_QWEN_ICON,
];
