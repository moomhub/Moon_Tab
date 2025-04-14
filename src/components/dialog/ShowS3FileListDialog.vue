<template>
  <t-dialog
    v-model:visible="visible"
    header="选择要恢复的备份"
    :footer="false"
    width="500"
  >
    <div class="file-content narrow-scrollbar">
      <div
        class="max"
        :class="{
          'flex-center': fileList.length === 0,
        }"
      >
        <t-list v-if="fileList.length > 0">
          <t-list-item
            v-for="(file, index) in fileList"
            :key="index"
            :value="file.Key"
          >
            <span @click="s3Restore(file.Key)">
              {{ file.Key.split('/').pop() }}
            </span>
            <template #action>
              <t-button
                shape="circle"
                theme="danger"
                size="small"
                @click="deleteFile(file.Key, index)"
              >
                <CloseIcon />
              </t-button>
            </template>
          </t-list-item>
        </t-list>
        <t-empty v-else description="暂无备份文件" />
      </div>
    </div>
  </t-dialog>
</template>

<script setup lang="ts" name="ShowS3FileListDialog">
import { CloseIcon } from 'tdesign-icons-vue-next';
import { S3Restore, createS3Service } from '@/utils/backup';
import { S3File } from '@/types/s3';
import { useSystemStore } from '@/store';

// 传递的props数据
const props = defineProps<{
  files: S3File[];
}>();

// pinia store 实例化
const systemStore = useSystemStore();

// 文件列表
const fileList = reactive<S3File[]>([...props.files]); // 用于存储文件列表的ref

// hools
import { useVisible } from '@/hooks';

const { visible, setVisible } = useVisible();

const s3Restore = async (key: string) => {
  try {
    await S3Restore(key);
    systemStore.backupSetting.s3.lastRecoveryDate = new Date().toLocaleString();
    MessagePlugin.success('从S3恢复备份成功');
  } catch (error) {
    MessagePlugin.error('从S3恢复备份失败');
    console.error(error);
  }
};

const deleteFile = async (key: string, index: number) => {
  try {
    await createS3Service().deleteFile(key);
    MessagePlugin.success('删除成功');
    // 从数组中移除已删除的文件
    fileList.splice(index, 1);
  } catch (e) {
    MessagePlugin.error('删除失败');
  }
};

watch(
  () => props.files,
  (newValue) => {
    Object.assign(fileList, newValue);
  }
);

function open() {
  setVisible(true);
}

defineExpose({ open });
</script>

<style lang="less" scoped>
.file-content {
  height: 10rem;
  padding-left: var(--td-comp-paddingLR-xs);
  padding-right: var(--td-comp-paddingLR-xs);
  overflow-y: auto;
}

:deep(.t-list-item__action) {
  margin-left: var(--td-comp-margin-l);
}
</style>
