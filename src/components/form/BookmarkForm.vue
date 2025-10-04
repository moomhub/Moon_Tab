<template>
  <div>
    <ChooseBookmark
      ref="chooseBookmarkRef"
      @result="handleBookmarkChooseResult"
    />
    <t-form-item label="名称" name="name">
      <t-input v-model="formData.name" placeholder="请输入书签名称" />
    </t-form-item>
    <t-form-item
      label="书签类型"
      name="placeholder"
      help="占位书签是指不会跳转的书签,用于占位显示"
    >
      <t-radio-group v-model="formData.placeholder">
        <t-radio :value="false">正常书签</t-radio>
        <t-radio :value="true">占位书签</t-radio>
      </t-radio-group>
    </t-form-item>
    <t-form-item label="网址" name="url">
      <t-input v-model="formData.url" placeholder="请输入书签URL" />
    </t-form-item>
    <t-form-item label="图标类型" name="type">
      <t-radio-group v-model="formData.iconType">
        <t-radio :value="BookmakeIconType.IMAGE">图片图标</t-radio>
        <t-radio :value="BookmakeIconType.TEXT">文字图标</t-radio>
      </t-radio-group>
    </t-form-item>
    <t-form-item label="书签图标">
      <t-space align="end">
        <div
          v-for="(item, index) in icons"
          :key="index"
          class="upload-image"
          :class="{ 'is-check': isCheck(item) }"
          @click.stop="handleBookmarkIconClick(item)"
          :style="{
            backgroundColor: formData.bgColor,
          }"
        >
          <img
            v-if="item.type !== BookmakeIconType.TEXT"
            class="image"
            :src="item.url"
            alt="书签图标"
          />
          <div v-else class="placeholder flex-center max">
            {{ bookmarkTextFirstChar }}
          </div>
          <div class="operate" v-if="item.blob">
            <!-- 表明是上传的图标支持删除 -->
            <DeleteIcon @click="deleteIcon" />
          </div>
          <div class="check">
            <CheckIcon />
          </div>
        </div>

        <t-upload
          ref="uploadRef"
          theme="custom"
          accept="image/*"
          :size-limit="{
            size: 500,
            unit: 'KB',
          }"
          :request-method="customIconUpload"
          auto-upload
        >
          <div>
            <ul class="t-upload__card upload__card">
              <li class="t-upload__card-item t-is-background">
                <div
                  class="t-upload__image-add t-upload__card-container t-upload__card-box upload__card"
                >
                  <UploadIcon />
                </div>
              </li>
            </ul>
          </div>
        </t-upload>
        <t-link theme="primary" underline @click="chooseLocalIcon">
          <template #prefix-icon>
            <location-1-icon />
          </template>
          选择本地图标
        </t-link>
      </t-space>
    </t-form-item>
    <t-form-item label="背景颜色" help="透明图标这删除颜色即可">
      <t-color-picker
        v-model="formData.bgColor"
        format="CSS"
        :color-modes="['monochrome']"
        :show-primary-color-preview="false"
      />
    </t-form-item>

    <IconChooseDialog
      ref="iconChooseDialogRef"
      @result="handleIconChooseResult"
    ></IconChooseDialog>
  </div>
</template>

<script lang="ts" setup name="BookmarkForm">
import type {
  RequestMethodResponse,
  UploadFile,
  UploadInstanceFunctions,
} from 'tdesign-vue-next';
import {
  CheckIcon,
  UploadIcon,
  DeleteIcon,
  Location1Icon,
} from 'tdesign-icons-vue-next';
import { BookmarkCardData, BookmakeIconType } from '@/types';
import { DEFAULT_BOOKMARK_FORM_DATA } from '@/constants/form';
import { generateID, getSystemIconData } from '@/utils/system';
import { IconData, IconStoreType, UploadIconData } from '@/types/icon';
import IconChooseDialog from '@/components/dialog/IconChooseDialog.vue';
import ChooseBookmark from '@/components/form/ChooseBookmark.vue';
import { BookmarkInfo } from '@/utils/bookmark';

// 定义组件 props
const props = defineProps({
  formData: {
    type: Object as PropType<BookmarkCardData> | null,
    default: { ...DEFAULT_BOOKMARK_FORM_DATA },
    required: false,
  },
  bookmarkIcon: {
    type: Object as PropType<IconData>,
    required: false,
  },
});

// vue ref
const iconChooseDialogRef = ref<InstanceType<typeof IconChooseDialog>>(); // 修正类型定义，确保 BookmarkForm 是一个组件实例类型
const uploadRef = useTemplateRef<UploadInstanceFunctions>('uploadRef');

// 当前选择的图标
const currentCheckIcon = ref<IconData>({ ...props.formData.icon! });

// 当前上传的图标
const uploadIcon = ref<UploadIconData>();

const localChooseIcon = ref<IconData>();

// 书签名称的第一个字符
const bookmarkTextFirstChar = computed(() => {
  return props.formData.name.charAt(0).toUpperCase();
});
// 计算当前显示图标
const icons = computed(() => {
  const array: UploadIconData[] = [];
  if (props.bookmarkIcon) {
    array.push({
      type: props.formData.iconType,
      ...props.bookmarkIcon,
    });
  }
  if (uploadIcon.value) {
    array.push(uploadIcon.value);
  }
  if (localChooseIcon.value) {
    array.push(localChooseIcon.value);
  }
  return array;
});

// 处理书签选择事件
function handleBookmarkChooseResult(bookmark:BookmarkInfo) {
  props.formData.name = bookmark.name;
  props.formData.url = bookmark.url;
  props.formData.icon = bookmark.icon;
  props.formData.iconType = bookmark.iconType;
  props.formData.bgColor = bookmark.bgColor;
  currentCheckIcon.value = bookmark.icon;
  localChooseIcon.value = bookmark.icon;
}

// 当前图标是否选中
const isCheck = (icon: IconData) => {
  if (!currentCheckIcon.value) {
    return false;
  }
  if (currentCheckIcon.value.store === IconStoreType.LOCAL) {
    return currentCheckIcon.value.url === icon.url;
  }
  return currentCheckIcon.value.key === icon.key;
};

// 处理图标选择事件
const handleBookmarkIconClick = async (icon: IconData) => {
  // 进行图标赋值
  if (icon.store === IconStoreType.LOCAL) {
    currentCheckIcon.value = {
      store: IconStoreType.LOCAL,
      url: icon.url,
    };
    return;
  }
  currentCheckIcon.value = {
    store: IconStoreType.DB,
    key: icon.key,
  };
  console.log('BookmarKCard Formdata current icon:', currentCheckIcon.value);
  return;
};

// 删除上传的图标
const deleteIcon = () => {
  uploadIcon.value = undefined;
  MessagePlugin.success('图标删除成功');
};

// 自定义上传方法
const customIconUpload = async (
  files: UploadFile | UploadFile[]
): Promise<RequestMethodResponse> => {
  const key = generateID();
  if (Array.isArray(files) && files.length > 0) {
    files = files[0];
  }
  const blob = (files as UploadFile).raw as Blob;
  const url = URL.createObjectURL(blob);
  uploadIcon.value = {
    store: IconStoreType.DB,
    key,
    url,
    blob,
  };
  if (!currentCheckIcon.value.store) {
    // 本身没有选择图标,直接赋值
    currentCheckIcon.value = {
      store: IconStoreType.DB,
      key,
    };
  }
  return {
    status: 'success',
    response: {
      url,
    },
  } as RequestMethodResponse;
};

// 打开本地图片弹窗
async function chooseLocalIcon() {
  const localSystemIcon = await getSystemIconData();
  iconChooseDialogRef.value?.openDialog(localSystemIcon);
}

// 处理选择本地图标结果
const handleIconChooseResult = (icon: IconData) => {
  localChooseIcon.value = icon;
  handleBookmarkIconClick(icon);
};

onBeforeUpdate(() => {
  if (!currentCheckIcon.value.store) {
    currentCheckIcon.value = { ...props.formData.icon! };
  }
});

defineExpose({
  // 抛出上传的图标
  uploadIcon,
  currentCheckIcon,
});
</script>

<style lang="less" scoped>
/* 保持与BookmarkCard.vue一致的样式风格 */
@img-width: 80px;

.upload__card {
  width: @img-width !important;
  height: @img-width !important;
}

.icon-add {
  margin: 0 !important;
}

.upload-image {
  cursor: pointer;
  position: relative;
  width: @img-width;
  height: @img-width;
  border-radius: var(--td-radius-medium);
  background-color: var(--td-brand-color);
  cursor: pointer;
  color: var(--td-text-color-anti);
  &:hover {
    .operate {
      display: flex;
    }
  }

  .image {
    width: 100%;
    height: 100%;
    border-radius: var(--td-radius-medium);
  }

  .placeholder {
    font-size: var(--td-font-size-title-large);
  }
  .operate {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    border-radius: var(--td-radius-medium);
    font-size: var(--td-font-size-link-medium);
    padding: var(--td-comp-paddingTB-xxxl);
    background-color: rgba(20, 20, 20, 0.7);
    font-size: var(--td-font-size-title-large);
    display: none;
    justify-content: center;
    align-items: center;
  }

  .check {
    display: none;
    color: #fff;
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
}

.countdown-background {
  padding: 5px;
}

.is-check {
  box-shadow: var(--td-brand-color) 0px 0px 0px 3px;
  .check {
    display: flex;
  }
}
</style>
