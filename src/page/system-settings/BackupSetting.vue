<template>
  <div class="max">
    <t-form label-align="top" colon class="form-padding-left">
      <t-row :gutter="16">
        <t-col :span="6">
          <t-form-item
            label="备份数据"
            :help="
              systemStore.backupSetting.local.lastBackupDate
                ? '上次备份时间：' +
                  systemStore.backupSetting.local.lastBackupDate
                : ''
            "
          >
            <t-button theme="primary" v-throttle="handleBackup">
              <template #icon> <DownloadIcon /></template>
              备份文件
            </t-button>
          </t-form-item>
        </t-col>

        <t-col :span="6">
          <t-form-item
            label="恢复数据"
            :help="
              systemStore.backupSetting.local.lastRecoveryDate
                ? '上次恢复时间：' +
                  systemStore.backupSetting.local.lastRecoveryDate
                : ''
            "
          >
            <t-upload
              theme="custom"
              accept=".zip"
              :showUploadProgress="false"
              :requestMethod="handleRestore"
            >
              <t-button theme="primary">
                <template #icon><UploadIcon /></template>
                上传文件
              </t-button>
            </t-upload>
          </t-form-item>
        </t-col>
      </t-row>

      <t-row :gutter="16">
        <t-col :span="6">
          <t-form-item label="备份到S3">
            <t-radio-group v-model="systemStore.backupSetting.s3.enabled">
              <t-radio :value="true">开启</t-radio>
              <t-radio :value="false">关闭</t-radio>
            </t-radio-group>
          </t-form-item>
        </t-col>
        <template v-if="systemStore.backupSetting.s3.enabled">
          <t-col :span="6">
            <t-form-item label="S3链接状态">
              <t-space class="connection">
                <t-button
                  theme="primary"
                  v-throttle="handleTestS3Connection"
                  :loading="testConnectionLoading"
                >
                  测试
                </t-button>
                <Status
                  v-if="connectionResutl"
                  :type="connectionResutl.type"
                  :label="connectionResutl.lable"
                ></Status>
              </t-space>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="自动备份到S3">
              <t-radio-group v-model="systemStore.backupSetting.s3.autoBackup">
                <t-radio :value="true">开启</t-radio>
                <t-radio :value="false">关闭</t-radio>
              </t-radio-group>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="自动时间">
              <t-input-number
                v-model="systemStore.backupSetting.s3.backupInterval"
                align="right"
              >
                <template #suffix><span>天</span></template>
              </t-input-number>
            </t-form-item>
          </t-col>

          <t-col :span="6">
            <t-form-item
              label="备份"
              :help="
                systemStore.backupSetting.s3.lastBackupDate
                  ? '上次备份时间：' +
                    systemStore.backupSetting.s3.lastBackupDate
                  : ''
              "
            >
              <t-button
                theme="primary"
                v-throttle="handleS3Backup"
                :loading="backUpS3Loading"
              >
                <template #icon> <CloudUploadIcon /></template>
                备份数据到S3
              </t-button>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item
              label="恢复"
              :help="
                systemStore.backupSetting.s3.lastRecoveryDate
                  ? '上次恢复时间：' +
                    systemStore.backupSetting.s3.lastRecoveryDate
                  : ''
              "
            >
              <t-button
                theme="primary"
                v-throttle="handleRestoreS3"
                :loading="restoreS3Loading"
              >
                <template #icon><CloudDownloadIcon /></template>
                从S3恢复数据
              </t-button>
            </t-form-item>
          </t-col>
        </template>
      </t-row>
    </t-form>
    <ShowS3FileListDialog ref="showS3FileListDialogRef" :files="backupFiles" />
    <div class="max-width" v-if="systemStore.backupSetting.s3.enabled">
      <t-divider>S3配置</t-divider>
      <S3ConfigForm></S3ConfigForm>
    </div>
  </div>
</template>  

<script setup lang="ts" name="StoreSetting">
import { useSystemStore } from '@/store';
import {
  UploadIcon,
  DownloadIcon,
  CloudUploadIcon,
  CloudDownloadIcon,
} from 'tdesign-icons-vue-next';
import { RequestMethodResponse, UploadFile } from 'tdesign-vue-next';
import {
  CheckS3Connection,
  LocalRestore,
  LocalBackup,
  S3Backup,
  ShowS3FilesList,
} from '@/utils/backup';
import S3ConfigForm from '@/components/form/S3ConfigForm.vue';
import ShowS3FileListDialog from '@/components/dialog/ShowS3FileListDialog.vue';

// pinia store 实例化
const systemStore = useSystemStore();

const showS3FileListDialogRef =
  ref<InstanceType<typeof ShowS3FileListDialog>>();

// 处理本地备份
const handleBackup = async () => {
  try {
    await LocalBackup();
    systemStore.backupSetting.local.lastBackupDate =
      new Date().toLocaleString();
    MessagePlugin.success('备份成功');
  } catch (error) {
    MessagePlugin.error('备份失败');
  }
};

// 处理本地导入恢复
const handleRestore = async (file: UploadFile) => {
  return new Promise<RequestMethodResponse>(async (resolve) => {
    try {
      await LocalRestore(file.raw as File);
      systemStore.backupSetting.local.lastRecoveryDate =
        new Date().toLocaleString();
      MessagePlugin.success('恢复成功');
    } catch (error) {
      MessagePlugin.error('恢复失败');
    }
  });
};

// 处理S3备份
const handleS3Backup = async () => {
  backUpS3Loading.value = true;
  try {
    await S3Backup();
    systemStore.backupSetting.s3.lastBackupDate = new Date().toLocaleString();
    MessagePlugin.success('备份到S3成功');
  } catch (error) {
    MessagePlugin.error('备份到S3失败');
    return;
  } finally {
    backUpS3Loading.value = false;
  }
};

// 备份文件列表
const backupFiles = ref<any[]>([]);

// S3备份加载状态
const backUpS3Loading = ref(false);
// S3恢复加载状态
const restoreS3Loading = ref(false);

// 从S3显示备份文件数据
const handleRestoreS3 = async () => {
  restoreS3Loading.value = true;
  const result = await ShowS3FilesList();
  restoreS3Loading.value = false;
  if (!result.success) {
    MessagePlugin.error('获取备份文件列表失败');
    return;
  }
  if (result.files.length === 0) {
    MessagePlugin.warning('没有找到备份文件,先备份数据到S3再恢复吧');
    return;
  }
  backupFiles.value = result.files;
  showS3FileListDialogRef.value?.open();
};

// 测试S3连接按钮加载状态
const testConnectionLoading = ref(false); // 测试连接加载状态

// 链接测试结果
const connectionResutl = ref<any>(null); 

const handleTestS3Connection = async () => {
  testConnectionLoading.value = true; // 开始测试连接
  const result = await CheckS3Connection();
  if (result.success) {
    connectionResutl.value = { type: 'success', lable: result.message }; // 连接成功
  } else {
    connectionResutl.value = { type: 'error', lable: result.message }; // 连接失败
  }
  testConnectionLoading.value = false;
};

// // 监听配置文件变化
// watch(
//   () => systemStore.backupSetting.s3Config,
//   async (newValue, oldValue) => {
//     if (systemStore.backupSetting.s3.enabled) {
//       handleTestS3Connection();
//     }
//   }
// );

onBeforeMount(() => {
  if (systemStore.backupSetting.s3.enabled) {  
    handleTestS3Connection();
  }
});
</script>

<style lang="less" scoped>
:deep(.t-list-item) {
  padding-left: unset !important;
  padding-right: unset !important;
  cursor: pointer;
}

.connection {
  display: flex;
  align-items: center;
}
</style>
