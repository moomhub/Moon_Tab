<template>
  <t-form label-align="top" colon class="form-padding-left">
    <t-form-item label="书签打开方式">
      <t-radio-group v-model="systemStore.baseSetting.bookmarkOpenWay">
        <t-radio :value="true">新窗口打开</t-radio>
        <t-radio :value="false">当前窗口打开</t-radio>
      </t-radio-group>
    </t-form-item>
    <t-form-item label="搜索打开方式">
      <t-radio-group v-model="systemStore.baseSetting.searchOpenWay">
        <t-radio :value="true">新窗口打开</t-radio>
        <t-radio :value="false">当前窗口打开</t-radio>
      </t-radio-group>
    </t-form-item>

    <t-form-item label="使用搜索引擎">
      <t-space break-line>
        <div
          v-for="item in systemStore.baseSetting.searchEngineConfig"
          :key="item.id"
          @click.prevent="changeSearchEngine(item)"
        >
          <t-checkbox v-model:checked="item.enabled" readonly>
            {{ item.name }}
          </t-checkbox>
        </div>
      </t-space>
    </t-form-item>
  </t-form>
</template>

<script setup lang="ts" name="BaseSetting">
import { useSystemStore } from '@/store';
import { SearchEngineConfig } from '@/types/store';

// Pinia 实例
const systemStore = useSystemStore();

// 搜索引擎的数量
const searchEngineNumber = computed(() => {
  return systemStore.baseSetting.searchEngineConfig.filter(
    (item) => item.enabled
  ).length;
});

function changeSearchEngine(item: SearchEngineConfig) {
  if (item.enabled && searchEngineNumber.value === 1) {
    MessagePlugin.warning('至少保留一个搜索引擎');
    return;
  }
  item.enabled = !item.enabled;
}
</script>

<style lang="less" scoped></style>
