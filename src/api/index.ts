import axios from 'axios';
import { IconUploadResultData } from '@/types/resources';
import { RequestMethodResponse } from 'tdesign-vue-next';
import { BingWallpaperData, BingWallpaperResuleData } from '@/types/wallpaper';
import { convertBingWallpaperData } from '@/utils/wallpaper';

// 创建 Axios 实例
const instance = axios.create();

/**
 * @deprecated
 *
 * Description  上传图标（第三方网络图标，目前已经废弃）
 * @param {FormData} data
 * @returns {any}
 */
export const uploadCardIcon = async (
  data: FormData
): Promise<RequestMethodResponse> => {
  try {
    const response = await instance.post(
      'https://movetab.jianyueku.com/api/bookmark',
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-locale': 'zh',
        },
      }
    );
    const result: IconUploadResultData = response.data;
    return {
      status: 'success',
      response: {
        url: result.data.icon,
      },
    };
  } catch (error) {
    console.error('上传图标失败:', error);
    return {
      status: 'fail',
      error: 'upload fail',
      response: {},
    };
  }
};

// 获取 Bing 每日壁纸数据
export const getBingDailyWallpaperData =
  async (): Promise<BingWallpaperData> => {
    try {
      const response = await instance.get(
        'https://www.bing.com/HPImageArchive.aspx',
        {
          params: {
            format: 'js',
            idx: 0,
            n: 1, // 获取8张图片
            mkt: 'zh-CN',
            w: '1920',
            h: '1080',
          },
        }
      );
      const result: BingWallpaperResuleData = response.data;
      return convertBingWallpaperData(result);
    } catch (error) {
      console.error('Failed to fetch Bing wallpaper:', error);
      throw new Error('Failed to fetch Bing wallpaper');
    }
  };
