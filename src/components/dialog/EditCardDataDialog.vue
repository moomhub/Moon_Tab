<template>
  <t-dialog
    placement="center"
    width="700"
    v-model:visible="visible"
    destroyOnClose
    attach="body"
    :header="dialogHeader"
    @confirm="handleDialogConfirm"
    @close="handleDialogClose"
    @before-close="handleDialogClose"
  >
    <div class="content narrow-scrollbar">
      <t-form
        ref="formRef"
        label-align="left"
        class="common-form"
        :data="formData"
        :rules="formRules"
      >
        <BookmarkForm
          v-if="type === CardType.BOOKMARK"
          ref="bookmarkFormRef"
          :form-data="(formData as BookmarkCardData)"
          :bookmark-icon="bookmarkIconData"
        />
        <CountdownForm
          v-if="type === CardType.COUNTDOWN"
          :form-data="(formData as CountdownCardData)"
        />
      </t-form>
    </div>
  </t-dialog>
</template>

<script setup lang="ts" name="EditCardDataDialog">
import { useVisible, useLoading } from '@/hooks';
import { useIndexedDB, useSwiperStore } from '@/store';
import {
  AllCardData,
  BookmarkCardData,
  CardType,
  CountdownCardData,
} from '@/types';
import { FormInstanceFunctions, FormRule } from 'tdesign-vue-next';
import { getCurrentSwiperId } from '@/utils/eventBus';
import { RULES_BOOKMARK_FORM, RULES_COUNTDOWN_FORM } from '@/constants/form';
import BookmarkForm from '@/components/form/BookmarkForm.vue';
import CountdownForm from '@/components/form/CountdownForm.vue';
import { IconData, IconStoreType } from '@/types/icon';
import {
  DEFAULT_BOOKMARK_ICON,
  DEFAULT_BOOKMARK_ICON_DATA,
} from '@/constants/icon';
import { buildBookmarkIcon } from '@/utils/system';

// Pinia store
const swiperStore = useSwiperStore();
// hooks 实例
const { visible, open, close } = useVisible();

//  ref
const formRef = ref<FormInstanceFunctions>();
const bookmarkFormRef = ref<InstanceType<typeof BookmarkForm>>(); // 修正类型定义，确保 BookmarkForm 是一个组件实例类型

// 表单数据
const formData = ref<AllCardData>(); // 表单数据

const type = ref<CardType>(CardType.BOOKMARK); // 卡片类型

// 初始化表单数据
function closeForm() {
  formRef.value?.clearValidate();
  formRef.value?.reset(); // 重置表单
  close(); // 关闭对话框
}

/**
 * Description 处理书签卡片图标
 * @param {BookmarkCardData} data
 * @returns {any}
 */
async function hanldeBookmarkIcon(data: BookmarkCardData) {
  const uploadIcon = bookmarkFormRef.value?.uploadIcon;
  const currentCheckIcon = bookmarkFormRef.value?.currentCheckIcon;
  const icon = data.icon;

  if (currentCheckIcon?.key === icon?.key) {
    // 表示选择的图标和原本的图标一样，不需要对图标进行处理
    return;
  }  
  if (uploadIcon && uploadIcon.key === currentCheckIcon?.key) {
    // 表示存在有上传的图标,并且选择的图标为上传的图标 需要删除数据库中的图标，并且保存最新图标到数据库
    await indexedDB.iconDB.setItem(uploadIcon.key as string, uploadIcon.blob);
    await indexedDB.iconDB.removeItem(icon!.key as string);
  }
  // 将最新的图标赋值给formData
  data.icon = currentCheckIcon;
}

// 处理对话框确认事件
const handleDialogConfirm = async () => {
  const valid = await formRef.value?.validate();
  if (valid !== true) {
    return;
  }
  const data: AllCardData = { ...(formData.value as AllCardData) };
  if (formData.value?.type === CardType.BOOKMARK) {
    await hanldeBookmarkIcon(data as BookmarkCardData);
  }
  swiperStore.saveOrUpataCardBySwiperId(getCurrentSwiperId(), data);
  nextTick(() => {
    closeForm();
  });
};

// 处理对话框关闭事件
const handleDialogClose = async () => {
  nextTick(() => {
    closeForm();
  });
};

// 弹窗标题
// 由于类型不匹配问题，需要确保 props.type 是正确的 CardType 类型值
const dialogHeader = computed(() => {
  const type = formData.value?.type || CardType.BOOKMARK; // 确保类型为 CardType 类型
  switch (type) {
    case CardType.BOOKMARK:
      return '编辑书签卡片';
    case CardType.COUNTDOWN:
      return '编辑倒计时卡片';
    default:
      return '编辑书签卡片';
  }
});

// URL 验证
const urlValidator = (value: any) => {
  if (
    value.length === 0 &&
    (formData.value as BookmarkCardData).placeholder === false
  ) {
    return {
      result: false,
      message: '书签为正常书签必须填写网址',
      type: 'error' as const,
    };
  }
  return { result: true, message: '', type: 'success' as const };
};

// 表单验证规则
const formRules = computed((): Record<string, FormRule[]> => {
  const type = formData.value?.type || CardType.BOOKMARK;
  switch (type) {
    case CardType.BOOKMARK:
      return {
        ...RULES_BOOKMARK_FORM,
        url: [
          {
            url: {
              protocols: ['http', 'https'],
              require_protocol: true,
            },
            message: '请输入正确的网址',
          },
          { validator: urlValidator, trigger: 'blur' },
        ],
      };
    case CardType.COUNTDOWN:
      return RULES_COUNTDOWN_FORM;
    default:
      return RULES_BOOKMARK_FORM;
  }
});

const iconDatas = ref<IconData[]>([]);
const indexedDB = useIndexedDB();

const bookmarkIconData = ref<IconData | undefined>(undefined);

const handleBookMarkIconData = async (card: BookmarkCardData) => {
  bookmarkIconData.value = undefined; // 重置图标数据
  if (card.icon) {
    bookmarkIconData.value = await buildBookmarkIcon(card.icon);
  }
};

// 打开编辑卡片对话框
async function openEditCardDialog(cardData: AllCardData) {
  formData.value = { ...cardData }; // 初始化表单数据
  type.value = cardData.type; // 初始化卡片类型
  if (cardData.type === CardType.BOOKMARK) {
    await handleBookMarkIconData(cardData as BookmarkCardData); // 处理图标数据
  }
  nextTick(() => {
    open(); // 打开对话框
    console.log('current edit formData.value: ', formData.value);
  });
}
// 抛出事件
defineExpose({
  openEditCardDialog,
  close,
});
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 400px;
  overflow-y: auto;
  padding: 10px;
  box-sizing: border-box;
}
</style>
