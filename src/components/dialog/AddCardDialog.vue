<template>
  <t-dialog
    placement="center"
    width="600"
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
        />
        <CountdownForm
          v-if="type === CardType.COUNTDOWN"
          :form-data="(formData as CountdownCardData)"
        />
      </t-form>
    </div>
  </t-dialog>
</template>

<script setup lang="ts" name="AddCardDialog">
import { useVisible } from '@/hooks';
import { useIndexedDB, useSwiperStore } from '@/store';
import {
  AllCardData,
  BookmarkCardData,
  CardType,
  CountdownCardData,
} from '@/types';
import { FormInstanceFunctions, FormRule } from 'tdesign-vue-next';
import { getCurrentSwiperId } from '@/utils/eventBus';
import {
  DEFAULT_BOOKMARK_FORM_DATA,
  DEFAULT_COUNTDOWN_FORM_DATA,
  RULES_BOOKMARK_FORM,
  RULES_COUNTDOWN_FORM,
} from '@/constants/form';
import BookmarkForm from '@/components/form/BookmarkForm.vue';
import CountdownForm from '@/components/form/CountdownForm.vue';

interface AddCardDialogProps {
  type: CardType; // 修正类型定义，将 CardType.BOOKMARK 作为对象类型传入
}
const props = withDefaults(defineProps<AddCardDialogProps>(), {
  type: CardType.BOOKMARK, // 默认值为 CardType.BOOKMARK
});

// Pinia store
const swiperStore = useSwiperStore();
const indexedDB = useIndexedDB();
// hooks 实例
const { visible, open, close } = useVisible();

const bookmarkFormRef = ref<InstanceType<typeof BookmarkForm>>(); // 修正类型定义，确保 BookmarkForm 是一个组件实例类型

const openDialog = (type: CardType) => {
  if (type === CardType.BOOKMARK) {
    formData.value = { ...DEFAULT_BOOKMARK_FORM_DATA }; // 初始化表单数据
  } else if (type === CardType.COUNTDOWN) {
    formData.value = { ...DEFAULT_COUNTDOWN_FORM_DATA }; // 初始化表单数据
  } else {
    formData.value = { ...DEFAULT_BOOKMARK_FORM_DATA }; // 初始化表单数据}
  }
  formData.value.type = type; // 设置当前表单类型
  nextTick(() => {
    open(); // 打开对话框
  });
};

// 表单实例 ref
const formRef = ref<FormInstanceFunctions>();
// 表单数据
const formData = ref<AllCardData>(); // 表单数据

// 初始化表单数据
function closeForm() {
  formRef.value?.clearValidate();
  formData.value = undefined; // 重置表单数据
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
  console.log(
    `Hangle Bookmark Icon:\n
     FormIcon ${data?.icon}\n
     UploadIcon ${uploadIcon}\n 
     CurrentCheckIcon ${currentCheckIcon}`
  );
  if (currentCheckIcon === icon) {
    // 表示选中的图标没有任何改变
    return;
  }
  if (uploadIcon && uploadIcon.key === currentCheckIcon?.key) {
    // 表示有上传的图标,并且选择的图标为上传的图标 需要删除数据库中的图标，并且保存最新图标到数据库
    await indexedDB.iconDB.setItem(uploadIcon.key as string, uploadIcon.blob);
    // 将最新的图标赋值给formData
    data.icon = currentCheckIcon;
  } else {
    // 表示没有上传的图标,或者选择的图标不是上传的图标,直接赋值
    data.icon = currentCheckIcon;
  }
}

// 处理对话框确认事件
const handleDialogConfirm = async () => {
  // 验证表单项是否通过
  const valid = await formRef.value?.validate();
  if (valid !== true) {
    return;
  }
  // 拓扑数据，防止数据丢失
  const data: AllCardData = { ...(formData.value as AllCardData) };
  if (props.type === CardType.BOOKMARK) {
    await hanldeBookmarkIcon(data as BookmarkCardData);
  }
  console.log('save add card dialog form:', data);
  closeForm();
  nextTick(() => {
    setTimeout(() => {
      swiperStore.saveOrUpataCardBySwiperId(getCurrentSwiperId(), data);
    }, 100);
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
  switch (props.type) {
    case CardType.BOOKMARK:
      return '新增书签卡片';
    case CardType.COUNTDOWN:
      return '新增倒计时卡片';
    default:
      return '新增书签卡片';
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
  const cardTypeValue = props.type as unknown as CardType; // 强制类型转换
  switch (cardTypeValue) {
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

defineExpose({
  openDialog,
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
