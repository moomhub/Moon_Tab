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

    <t-form-item label="滑动页面">
      <t-space break-line>
        <t-input-number
          v-model="swiperPage"
          theme="row"
          :max="10"
          :min="2"
          :disabled="false"
          suffix="页"
          style="width: 200px"
          @change="handlePageChange"
        ></t-input-number>
      </t-space>
    </t-form-item>
  </t-form>
</template>

<script setup lang="ts" name="BaseSetting">
import { useSwiperStore, useSystemStore } from '@/store';
import { SearchEngineConfig } from '@/types/store';
import { InputNumberProps, TNode } from 'tdesign-vue-next';

// Pinia 实例
const systemStore = useSystemStore();
const swiperStore = useSwiperStore();

// 滑动也买你
const swiperPage = ref(swiperStore.swiperData.length);

const handlePageChange: InputNumberProps['onChange'] = (v, ctx) => {
  console.info('change', v, ctx);
};

const noChange = ref(false);

// 监听 swiperData 变化，更新 swiperPage
watch(
  () => swiperPage.value,
  (newValue, oldValue) => {
    if (noChange.value) {
      noChange.value = false;
      return;
    }
    if (newValue > (oldValue || 2)) {
      swiperStore.addSwiper();
      return;
    }
    const lastSwiperAllCardName = swiperStore.getLastSwiperAllCardName();
    if (lastSwiperAllCardName.length > 0) {
      const deleteSwiperDialog = DialogPlugin.alert({
        header: '确定删除',
        body: () =>
          h('div', { class: 'test' }, [
            '最后一个页面还有: ',
            h(
              TSpace,
              lastSwiperAllCardName.map((item) => h(TTag, `${item}`))
            ),
            '卡片.确定还需要减少页面吗？',
          ]),
        confirmBtn: {
          content: '确定',
          variant: 'base',
          theme: 'danger',
        },
        closeBtn: '关闭',
        onConfirm: ({ e }) => {
          swiperStore.deleteSwiper();
          deleteSwiperDialog.destroy();
        },
        onClose: ({ e, trigger }) => {
          noChange.value = true;
          nextTick(() => {
            swiperPage.value = oldValue as number;
          });
          deleteSwiperDialog.destroy();
        },
      });
      return;
    } else {
      swiperStore.deleteSwiper();
    }
  }
);

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
