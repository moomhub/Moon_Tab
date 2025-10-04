<!--
  page: 选择已有书签
-->
<template>
  <div>
    <t-form-item label="书签数据">
      <div class="bookmark-choose" @click="openDialog">
        <span class="content">选择已经存在的书签数据</span>
      </div>
    </t-form-item>

    <t-dialog
      placement="center"
      width="600"
      v-model:visible="visible"
      header="选择书签"
      :footer="false"
      @close="handleDialogClose"
    >
      <div class="list-content">
        <t-input placeholder="搜索书签" v-model:value="searchText" clearable>
          <template #suffixIcon>
            <search-icon :style="{ cursor: 'pointer' }" />
          </template>
        </t-input>
        <div class="bookmark-list narrow-scrollbar">
          <t-row v-if="filteredBookmarks.length > 0" :gutter="0">
            <t-col
              class="col"
              :span="2"
              v-for="(item, index) in filteredBookmarks"
              :key="index"
            >
              <div class="list-item" @click="handleBookmarkItemClick(item)">
                <t-popup
                  :content="item.url"
                  destroyOnClose
                  hideEmptyPopup
                  showArrow
                  trigger="hover"
                >
                  <div
                    class="bookmark-icon"
                    :style="{
                      background: item.bgColor,
                    }"
                  >
                    <img :src="item.iconUrl" alt="icon" />
                  </div>
                </t-popup>
                <span class="bookmark-name">{{ item.name }}</span>
              </div>
            </t-col>
          </t-row>
          <div class="max flex-center" v-else>
            <t-empty />
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script lang="ts" setup name="BookmarkForm">
import type {
  RequestMethodResponse,
  UploadFile,
  UploadInstanceFunctions,
} from 'tdesign-vue-next';
import { BookmarkCardData, BookmakeIconType } from '@/types';
import { DEFAULT_BOOKMARK_FORM_DATA } from '@/constants/form';
import { generateID, getSystemIconData } from '@/utils/system';
import { IconData, IconStoreType, UploadIconData } from '@/types/icon';
import IconChooseDialog from '@/components/dialog/IconChooseDialog.vue';
import { useVisible } from '@/hooks';
import { SearchIcon } from 'tdesign-icons-vue-next';
import { BookmarkInfo, getFilteredBookmarkData } from '@/utils/bookmark';

// hooks 实例
const { visible, open, close } = useVisible();
// 书签搜索文本
const searchText = ref('');
// 书签数据
const bookmakeInfoArray = ref<BookmarkInfo[]>([]);

// 计算属性：根据搜索文本过滤书签
const filteredBookmarks = computed(() => {
  if (!searchText.value) {
    return bookmakeInfoArray.value;
  }
  return bookmakeInfoArray.value.filter((bookmark) =>
    bookmark.name.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// 打开弹窗
const openDialog = () => {
  nextTick(() => {
    open(); // 打开弹窗
  });
};

// 处理对话框关闭事件
const handleDialogClose = async () => {
  close();
};

// 处理书签点击事件
function handleBookmarkItemClick(bookmark: BookmarkInfo) {
  console.log('current bookmark choose:', bookmark);
  emit('result', bookmark);
  nextTick(() => {
    close();
  });
}

// 抛出事件
const emit = defineEmits<{
  (e: 'result', data: BookmarkInfo): void;
}>();

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

onBeforeMount(async () => {
  bookmakeInfoArray.value = await getFilteredBookmarkData();
});
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

.bookmark-choose {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed var(--td-border-level-1-color);
  border-radius: var(--td-radius-medium);
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: var(--td-font-size-link-medium);
  color: var(--td-text-color-secondary);
  &:hover {
    transform: translateY(-1px);
    border: 2px dashed var(--td-brand-color-hover);
    color: var(--td-brand-color-hover);
  }
}

.bookmark-list {
  margin-top: var(--td-comp-margin-xl);
  width: 100%;
  height: 300px;
  overflow: auto;
}

.content {
  width: 100%;
  overflow-y: auto;
  padding: 10px;
  box-sizing: border-box;
}

.col {
  width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-delete {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.list-item {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  cursor: pointer;

  .bookmark-icon {
    position: relative;
    width: 65px;
    height: 65px;
    border-radius: var(--td-radius-medium);
    background-color: var(--td-font-gray-4);
    border-radius: var(--td-radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    img {
      width: 70%;
      height: 70%;
      display: block;
      object-fit: cover;
      transition: transform 0.2s ease-in-out;
    }
  }
  .bookmark-name {
    margin-top: var(--td-comp-margin-xxs);
    width: 70%;
    font-size: 12px;
    text-align: center;
    overflow: clip;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: none;
  }
}
</style>
