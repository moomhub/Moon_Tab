<template>
  <div class="max">
    <t-form label-align="top" colon class="form-padding-left">
      <t-row :gutter="16">
        <t-col :span="12">
          <t-form-item
            label="重置所有"
            help="重置所有设置为默认值,包括系统设置,壁纸,备份设置等,"
          >
            <t-popconfirm
              theme="danger"
              content="确认重置吗"
              @confirm="handleConfirm"
            >
              <t-button theme="danger">重置</t-button>
            </t-popconfirm>
          </t-form-item>
        </t-col>

        <!-- <t-col :span="6"> </t-col> -->
      </t-row>
    </t-form>
  </div>
</template>

<script setup lang="ts" name="ResetSetting">
import { defaultBookmarkData } from '@/constants/card';
import {
  useSystemStore,
  useSwiperStore,
  useIndexedDB,
  useWallpaperStore,
} from '@/store';
const systemStore = useSystemStore();
const swiperStore = useSwiperStore();
const wallpaperStore = useWallpaperStore();
const indexedDB = useIndexedDB();

// 确定重置
const handleConfirm = async () => {
  try {
    // 重置系统设置
    systemStore.$reset();

    // 重置壁纸设置
    wallpaperStore.$reset();
    // 清空图标数据库
    await indexedDB.iconDB.clear();
    // 清空图标数据库
    await indexedDB.wallpaperDB.clear();

    // 重置轮播图设置
    swiperStore.swiperData = [];
    // 重置成功后，重新加载页面
    window.location.reload();
    // 可以添加重置成功的提示
    MessagePlugin.success('重置成功');
  } catch (error) {
    console.error('重置失败:', error);
    MessagePlugin.error('重置失败');
  }
};
</script>

<style lang="less" scoped></style>
