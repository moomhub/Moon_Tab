<template>
  <t-dialog
    placement="center"
    header="系统设置"
    :destroyOnClose="true"
    :footer="false"
    width="800"
    v-model:visible="visible"
  >
    <div class="system-settings">
      <div class="left">
        <t-menu
          class="left-menu"
          theme="light"
          style="margin-right: 40px"
          @change="changeMenuHandler"
          :value="menuActive"
        >
          <t-menu-item
            v-for="item in SystemMenu"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </t-menu-item>
        </t-menu>
      </div>
      <div class="right narrow-scrollbar">
        <component :is="rightPage" />
      </div>
    </div>
  </t-dialog>
</template>

<script setup lang="ts" name="SystemSettings">
import { buildSwipweThumbnailPages } from '@/utils/eventBus';
import { MenuValue } from 'tdesign-vue-next';

// 通用配置设置
const BaseSetting = defineAsyncComponent(() => import('./BaseSetting.vue'));
// 壁纸设置
const WallpaperSetting = defineAsyncComponent(
  () => import('./WallpaperSetting.vue')
);
// 备份和恢复
const BackupSetting = defineAsyncComponent(() => import('./BackupSetting.vue'));
// 本地图标设置
const LocalIconSetting = defineAsyncComponent(
  () => import('./LocalIconSetting.vue')
);
// 重置设置
const ResetSetting = defineAsyncComponent(() => import('./ResetSetting.vue'));
// 页面设置
const PageSetting = defineAsyncComponent(() => import('./PageSetting.vue'));

// 页面组件映射
const pageLookup: any = {
  BaseSetting,
  WallpaperSetting,
  BackupSetting,
  LocalIconSetting,
  ResetSetting,
  PageSetting,
};

// 系统菜单
const SystemMenu = [
  {
    label: '基础设置',
    value: 'BaseSetting',
  },
  {
    label: '壁纸设置',
    value: 'WallpaperSetting',
  },
  {
    label: '备份和恢复',
    value: 'BackupSetting',
  },
  {
    label: '本地图标管理',
    value: 'LocalIconSetting',
  },
  {
    label: '页面配置',
    value: 'PageSetting',
  },
  {
    label: '重置配置',
    value: 'ResetSetting',
  },
];
// 默认页面为账户信息页面
const rightPage = ref(null);

//弹窗是否显示
const visible = ref(false);

const menuActive = ref('BaseSetting');

// 打开Suspense页面
function openRightPage(item: string) {
  rightPage.value = markRaw(pageLookup[item]);
}

onMounted(() => {
  openRightPage(menuActive.value);
});

// 菜单选项改变时
function changeMenuHandler(active: MenuValue) {
  console.log('system setting menu change:', active);
  menuActive.value = active as string;
  openRightPage(active as string);
}

// 打开系统设置弹窗
function openSystemSetting() {
  visible.value = true;
}

onMounted(async () => {
  await buildSwipweThumbnailPages();
});
// 暴露方法给父组件调用
defineExpose({ openSystemSetting });
</script>

<style lang="less" scoped>
.system-settings {
  width: 100%;
  height: 27rem;
  max-height: 80vh;
  display: flex;

  > div {
    flex: 1 1 0%;
    overflow-x: hidden;
  }
  .left {
    flex-basis: 30%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    :deep(.left-menu) {
      width: 100% !important;
      margin: unset !important;
    }
  }
  .right {
    border-left: 1px dashed var(--td-border-level-1-color);
    flex-basis: 70%;
    padding: 5px;
    overflow-y: auto;
  }
}

:deep(.t-form__label) {
  label {
    font-weight: bold;
  }
}
</style>
