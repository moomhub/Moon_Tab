import { SwiperData } from '@/types/index';

import { defineStore } from 'pinia';
import persist from './plugin';
import * as Types from '@/types';
import { findSwiperAvailablePosition, getAllCardPosition } from '@/utils/swiper';
import { generateID } from '@/utils/system';
import { defaultBookmarkData } from '@/constants/card';

// 多个位置信息被改变
interface CardPosition {
  id: string;
  position: Types.Position;
}

// 书签数据
const useSwiperStore = defineStore(
  'swiperStore',
  () => {
    // 滑动页面数据
    const swiperData = ref<Array<Types.SwiperData>>([]);

    /**
     * Description 添加滑动页面
     * @returns {any}
     */
    function addSwiper() {
      swiperData.value.push({
        id: generateID(),
        data: [],
      });
    }

    /**
     * Description 最后一个页面
     * @returns {any}
     */
    function deleteSwiper() {
      // 前端限制，至少保留一个页面,所以不需要判断
      // if (swiperData.value.length === 1) {
      //   MessagePlugin.warning('总得保留一个页面吧');
      //   return;
      // }
      swiperData.value.pop();
    }

    /**
     * Description 获取最后一个页面中所有卡片的名称
     * @returns {any}
     */
    function getLastSwiperAllCardName() {
      const lastSwiper = swiperData.value[swiperData.value.length - 1];
      return lastSwiper.data.map((card) => card.name);
    }

    /**
     * Description 初始化数据
     * @returns {any}
     */
    function init() {
      if (swiperData.value.length === 0) {
        console.log('init swiper data...');
        swiperData.value = [...defaultBookmarkData];
      }
    }

    function getSwiperDataById(swiperId: string): Types.AllCardData[] {
      const swiper = swiperData.value.find((item) => item.id === swiperId);
      if (!swiper) {
        return [];
      }
      return swiper.data;
    }

    /**
     * Description 根据ID获取书签卡片数据
     * @param {string} swiperId
     * @param {string} cardId
     * @returns {any}
     */
    function getCardBySwiperIdAndCardId(swiperId: string, cardId: string) {
      let targetCard: Types.AllCardData | undefined;
      swiperData.value.forEach((swiper: Types.SwiperData) => {
        if (swiper.id === swiperId) {
          swiper.data.forEach((card: Types.AllCardData) => {
            if (card.id === cardId) {
              targetCard = card;
            }
          });
        }
      });
      return targetCard;
    }

    /**
     * Description 更新书签卡片的位置（宽高）
     * @param {string} swiperId 滑块ID
     * @param {string} data 卡片ID和位置数据
     * @returns {any}
     */
    function updateCardPositionBySwiperId(
      swiperId: string,
      data: CardPosition[]
    ) {
      console.log('updateCardPositionBySwiperId', swiperId, data);
      let targetCard: Types.AllCardData | undefined;
      swiperData.value.find((swiper: Types.SwiperData) => {
        if (swiper.id === swiperId) {
          swiper.data.find((card: Types.AllCardData) => {
            data.forEach((item: CardPosition) => {
              if (card.id === item.id) {
                card.position = item.position;
              }
            });
          });
        }
      });
    }

    /**
     * Description 更新书签卡片的位置（宽高）
     * @param {string} swiperId 滑块ID
     * @param {string} data 卡片ID和位置数据
     * @returns {any}
     */
    function updateCardPositionBySwiperIdss(swiperId: string, data: []) {
      console.log('updateCardPositionBySwiperId', swiperId, data);
      let targetCard: Types.AllCardData | undefined;
      swiperData.value.find((swiper: Types.SwiperData) => {
        if (swiper.id === swiperId) {
          swiper.data.find((card: Types.AllCardData) => {
            data.forEach((item: any) => {
              if (card.id === item.cardId) {
                card.position = item.position;
              }
            });
          });
        }
      });
    }

    /**
     * Description 跟新滑动页面数据
     * @param {string} swiperId
     * @param {Array<Types.AllCardData>} data
     * @returns {any}
     */
    function updateSwiperDataBySwiperId(
      swiperId: string,
      data: Array<Types.AllCardData>
    ) {
      const targetSwiperData: Types.SwiperData | undefined =
        swiperData.value.find((swiper) => swiper.id === swiperId);
      if (targetSwiperData) {
        targetSwiperData.data = [...data];
      }
    }

    function saveOrUpataCardBySwiperId(
      swiperId: string,
      bookmark: Types.AllCardData
    ) {
      const targetSwiperData = swiperData.value.find(
        (swiper) => swiper.id === swiperId
      );

      if (!targetSwiperData) {
        console.error(`Swiper with id ${swiperId} not found`);
        return;
      }

      if (bookmark.id) {
        const index = targetSwiperData.data.findIndex(
          (card) => card.id === bookmark.id
        );
        if (index !== -1) {
          targetSwiperData.data[index] = { ...bookmark };
        }
        console.log('update bookmark data...');
      } else {
        bookmark.id = generateID();
        const availablePosition = findSwiperAvailablePosition(
          getAllCardPosition(targetSwiperData)
        );
        bookmark.position = { ...availablePosition };
        targetSwiperData.data.push(bookmark);
        console.log('save bookmark data...');
      }
    }

    /**
     * Description 删除卡片
     * @param {string} swiperId
     * @param {string} cardId
     * @returns {any}
     */
    function deleteCardBySwiperIdAndCardId(swiperId: string, cardId: string) {
      let target: Types.AllCardData[] | undefined;
      swiperData.value.find((swiper: Types.SwiperData) => {
        if (swiper.id === swiperId) {
          target = swiper.data.filter((card) => card.id !== cardId);
          swiper.data = target;
        }
      });
    }

    return {
      swiperData,
      init,
      addSwiper,
      deleteSwiper,
      getSwiperDataById,
      getLastSwiperAllCardName,
      updateCardPositionBySwiperIdss,
      saveOrUpataCardBySwiperId,
      getCardBySwiperIdAndCardId,
      updateCardPositionBySwiperId,
      updateSwiperDataBySwiperId,
      deleteCardBySwiperIdAndCardId,
    };
  },
  {
    persist: persist('swiper'),
  }
);

export default useSwiperStore;
