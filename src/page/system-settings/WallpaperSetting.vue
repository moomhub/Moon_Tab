<template>
  <t-form class="form-padding-left narrow-scrollbar" label-align="top" colon>
    <t-form-item label="当前壁纸配置">
      <t-radio-group v-model="wallpaperStore.type">
        <t-radio :value="WallpaperType.LOCAL">本地壁纸</t-radio>
        <t-radio :value="WallpaperType.BING">Bing每日壁纸</t-radio>
      </t-radio-group>
    </t-form-item>
    <t-form-item label="本地壁纸">
      <t-space break-line>
        <t-upload
          ref="uploadRef"
          v-model="uploadFiles"
          theme="custom"
          accept="image/*,video/*"
          :size-limit="{
            size: 20,
            unit: 'MB',
          }"
          :request-method="customUpload"
          auto-upload
          @success="handleSuccess"
          @fail="handleFail"
        >
          <t-loading size="small" :loading="loading">
            <div class="wallpaper-upload">
              <div class="upload">
                <UploadIcon />
                <span class="content">上传壁纸</span>
                <span class="help">支持图片和视频(动态壁纸)</span>
              </div>
            </div>
          </t-loading>
        </t-upload>
        <div
          class="wallpaper-item"
          v-for="(item, index) in customWallpaperList"
          :key="index"
          :class="{
            'is-checked': wallpaperStore.localWallpapreId === item.id,
          }"
          @click="wallpaperStore.localWallpapreId = item.id"
        >
          <div class="wallpaper">
            <img :src="handleIamgeData(item.imageData)" />
          </div>
          <div v-if="item.videoData" class="dynamics">动态</div>
          <div v-if="item.id !== 'local'" class="operate">
            <DownloadIcon
              class="operate-icon"
              @click="downlaodWallpaper(item)"
            />
            <div class="line"></div>
            <DeleteIcon class="operate-icon" @click="deleteWallpaper(item)" />
          </div>
          <div class="checked">
            <CheckIcon />
          </div>
        </div>
      </t-space>
    </t-form-item>
  </t-form>
</template>

<script setup lang="ts" name="WallpaperSetting">
import { WallpaperImage, WallpaperType } from '@/types/wallpaper';
import { useIndexedDB, useWallpaperStore } from '@/store';
import {
  UploadIcon,
  CheckIcon,
  DeleteIcon,
  DownloadIcon,
} from 'tdesign-icons-vue-next';
import {
  RequestMethodResponse,
  SuccessContext,
  UploadFailContext,
  UploadFile,
} from 'tdesign-vue-next';
import { getLocalWallpapersFromDB } from '@/utils/wallpaper';
import { LOCAL_WALLPAPER } from '@/constants';
import { generateID } from '@/utils/system';
import saveAs from 'file-saver';
// pinia store 实例化
const wallpaperStore = useWallpaperStore();
// 上传文件加载状态
const loading = ref(false);
// 上传文件列表
const uploadFiles = ref<UploadFile[]>([]);

// 自定义壁纸列表
const customWallpaperList = ref<WallpaperImage[]>([]);

async function getLocalWallpaper() {
  const result = await getLocalWallpapersFromDB();
  result.unshift(LOCAL_WALLPAPER);
  return result;
}

onMounted(async () => {
  customWallpaperList.value = await getLocalWallpaper();
});

function handleIamgeData(value: string | Blob | undefined) {
  return value instanceof Blob ? URL.createObjectURL(value) : value;
}

// 自定义上传方法
const customUpload = async (files: UploadFile | UploadFile[]) => {
  loading.value = true;
  let uploadResult: RequestMethodResponse = {
    status: 'success',
    response: {},
  };
  try {
    const fileList = Array.isArray(files) ? files : [files];
    const file = fileList[0].raw;
    if (!file) {
      throw new Error('未获取到文件');
    }
    const isVideo = file.type.startsWith('video/');
    let imageBlob: Blob | undefined;
    let videoBlob: Blob | undefined;
    if (isVideo) {
      // 处理视频文件
      videoBlob = new Blob([file], { type: file.type });
      // 提取视频封面
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      await new Promise((resolve) => {
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          video.currentTime = 0.1; // 取第0.1秒作为封面
          video.onseeked = () => {
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                imageBlob = blob;
              }
              resolve(null);
            }, 'image/jpeg');
          };
        };
      });
    } else {
      // 处理图片文件
      imageBlob = new Blob([file], { type: file.type });
    }
    // 生成图片文件
    const id = generateID();
    const value: WallpaperImage = {
      id,
      type: WallpaperType.LOCAL,
      imageData: imageBlob,
      videoData: isVideo ? videoBlob : undefined,
      createdAt: new Date(),
    };

    const indexedDB = useIndexedDB();
    await indexedDB.wallpaperDB.setItem(id, value);
    return uploadResult;
  } catch (error) {
    console.error('上传本地壁纸失败:', error);
    uploadResult = {
      status: 'fail',
      error: 'upload fail',
      response: {},
    };
    return uploadResult;
  } finally {
    loading.value = false;
  }
};
const handleSuccess = async (res: SuccessContext) => {
  customWallpaperList.value = await getLocalWallpaper();
};
// 处理图片上传失败
const handleFail = (res: UploadFailContext) => {
  MessagePlugin.error('上传本地壁纸失败');
};

// 删除壁纸
const deleteWallpaper = async (item: WallpaperImage) => {
  const indexedDB = useIndexedDB();
  await indexedDB.wallpaperDB.removeItem(item.id);
  try {
    customWallpaperList.value = await getLocalWallpaper();
    if (item.id === wallpaperStore.localWallpapreId) {
      wallpaperStore.localWallpapreId = 'local';
    }
  } catch (error) {
    console.error('删除本地壁纸失败:', error);
  }
};

// 下载壁纸
const downlaodWallpaper = async (item: WallpaperImage) => {
  const blob = (item.videoData ? item.videoData : item.imageData) as Blob;
  const fileName =
    blob.type === 'image/jpeg' ? `${item.id}.jpg` : `${item.id}.mp4`;
  // 保存文件到本地
  saveAs(blob, fileName);
};
</script>

<style lang="less" scoped>
.wallpaper-item {
  position: relative;
  width: 144px;
  height: 90px;
  border-radius: var(--td-radius-medium);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);

    .wallpaper {
      img {
        transform: scale(1.2);
      }
    }
    .operate {
      display: flex;
    }
  }

  .wallpaper {
    width: 100%;
    height: 100%;
    border-radius: var(--td-radius-medium);
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      transition: transform 0.2s ease-in-out;
    }
  }

  .checked {
    display: none;
    color: var(--td-text-color-anti);
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background: var(--td-brand-color);
    width: 1rem;
    height: 1rem;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .dynamics {
    position: absolute;
    top: 0px;
    left: 0px;
    background: var(--td-success-color);
    padding: 0 var(--td-comp-paddingTB-xs);
    color: var(--td-text-color-anti);
    font-size: var(--td-font-size-link-small);
    border-radius: var(--td-radius-medium);
  }

  .operate {
    position: absolute;
    bottom: 8px;
    left: 0px;
    width: 100%;
    border-radius: var(--td-radius-medium) var(--td-radius-medium) 0 0;
    font-size: var(--td-font-size-link-medium);
    padding: var(--td-comp-paddingTB-xxxl);
    justify-content: center;
    flex-direction: row;
    align-items: center;
    align-items: center;
    display: flex;

    .operate-icon {
      font-size: 20px;
      color: var(--td-text-color-anti);
      &:hover {
        color: var(--td-brand-color-hover);
      }
    }

    .line {
      margin: 0 var(--td-comp-margin-xxl);
      width: 2px;
      height: 8px;
      border-radius: 99px;
      background: var(--td-text-color-anti);
    }
  }
}

// 上传壁纸
.wallpaper-upload {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 144px;
  height: 90px;
  border: 2px dashed var(--td-border-level-1-color);
  border-radius: var(--td-radius-medium);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    border: 2px dashed var(--td-brand-color-hover);
  }

  .upload {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    &:hover {
      .t-icon {
        color: var(--td-brand-color);
      }
      .content {
        color: var(--td-brand-color-hover);
      }
      .help {
        color: var(--td-brand-color-disabled);
      }
    }

    .t-icon {
      font-size: 20px;
      font-size: var(--td-font-size-link-large);
    }
    .content {
      font-size: var(--td-font-size-link-medium);
      color: var(--td-text-color-secondary);
    }
    .help {
      font-size: 10px;
      color: var(--td-text-color-placeholder);
    }
  }
}

.is-checked {
  box-shadow: var(--td-brand-color) 0px 0px 0px 3px;
  .checked {
    display: flex;
  }
}
</style>
