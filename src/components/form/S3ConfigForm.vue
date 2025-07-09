<template>
  <t-form
    class="form-padding-left"
    label-align="top"
    colon
    ref="formRef"
    :rules="rules"
    :data="formData"
  >
    <div class="flex">
      <t-space class="copy">
        <t-tooltip content="粘贴">
          <PasteIcon @click="s3ConfigPaste" />
        </t-tooltip>
        <t-tooltip content="复制">
          <CopyIcon @click="s3ConfigCopy"/>
        </t-tooltip>
      </t-space>
    </div>
    <t-form-item label="Endpoint" name="endpoint">
      <t-input v-model="formData.endpoint" placeholder="请输入S3服务地址" />
    </t-form-item>

    <div class="t-form__item">
      <t-row :gutter="16">
        <t-col :span="6">
          <t-form-item label="Region" name="region">
            <t-input v-model="formData.region" placeholder="请输入区域" />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item label="Bucket" name="bucket">
            <t-input v-model="formData.bucket" placeholder="请输入Bucket名称" />
          </t-form-item>
        </t-col>
      </t-row>
    </div>

    <t-form-item label="Access Key" name="accessKeyId">
      <t-input v-model="formData.accessKeyId" placeholder="请输入Access Key" />
    </t-form-item>
    <t-form-item label="Secret Key" name="secretAccessKey">
      <t-input
        type="password"
        v-model="formData.secretAccessKey"
        placeholder="请输入Secret Key"
      />
    </t-form-item>
    <div class="max-width flex-content-center">
      <t-button theme="primary" v-throttle="saveS3Config" :loading="loading">
        保存S3配置
      </t-button>
    </div>
  </t-form>
</template>

<script setup lang="ts" name="S3ConfigForm">
import {
  FormInstanceFunctions,
  FormRule,
  MessagePlugin,
} from 'tdesign-vue-next';
import { PasteIcon, CopyIcon } from 'tdesign-icons-vue-next';
import { useSystemStore } from '@/store';
import { S3ConnectionConfig } from '@/types/store';
import { useLoading } from '@/hooks';
import S3Service from '@/utils/s3';
import { getS3CopyData, getS3PasteData } from '@/utils/system';
// pinia
const systemStore = useSystemStore();
// hook
const { loading, setLoading } = useLoading();
// vue ref
const formRef = ref<FormInstanceFunctions>(); // 引用表单实例


// 表格数据
const formData = reactive<S3ConnectionConfig>({
  ...systemStore.backupSetting.s3Config, // 初始值,
}); // 表单数据

const rules: Record<string, FormRule[]> = {
  endpoint: [
    {
      required: true,
      message: 'S3服务地址不能为空',

      trigger: 'blur',
    },
    {
      pattern: /^(http|https):\/\/.+$/,
      message: '请输入有效的URL地址',

      trigger: 'blur',
    },
  ],
  region: [
    { required: true, message: '区域不能为空', trigger: 'blur' },
    {
      pattern: /^[a-z0-9-]+$/,
      message: '区域格式不正确',
      trigger: 'blur',
    },
  ],
  bucket: [
    {
      required: true,
      message: 'Bucket不能为空',
      trigger: 'blur',
    },
    {
      pattern: /^[a-z0-9.-]+$/,
      message: 'Bucket名称只能包含小写字母、数字、点和连字符',
      trigger: 'blur',
    },
  ],
  accessKeyId: [
    {
      required: true,
      message: 'Access Key不能为空',
      trigger: 'blur',
    },
  ],
  secretAccessKey: [
    {
      required: true,
      message: 'Secret Key不能为空',
      trigger: 'blur',
    },
  ],
};

// 保存 S3 配置
async function saveS3Config() {
  const valid = await formRef.value?.validate();
  if (valid !== true) {
    MessagePlugin.error('请检查表单填写是否正确');
    return;
  }
  setLoading(true); // 开始加载
  try {
    const s3Service = new S3Service(formData);
    await s3Service.checkConnection();
    systemStore.backupSetting.s3Config = { ...formData };
    MessagePlugin.success('配置保存成功');
  } catch (error) {
    MessagePlugin.error('连接失败，请检查配置是否正确');
    return;
  } finally {
    setLoading(false); // 结束加载
  }
}

onBeforeMount(() => {
  if (systemStore.backupSetting.s3Config) {
    Object.assign(formData, systemStore.backupSetting.s3Config);
  }
});
// 在script setup部分添加以下方法
const s3ConfigCopy = async () => {
  try {
    const data = getS3CopyData(formData);
    await navigator.clipboard.writeText(data);
    MessagePlugin.success('S3配置已复制到剪贴板');
  } catch (error) {
    MessagePlugin.error('复制失败');
  }
};

const s3ConfigPaste = async () => {
  try {
    const text = await navigator.clipboard.readText();
    const config = getS3PasteData(text);
    Object.assign(formData, config);
    MessagePlugin.success('配置已粘贴');
  } catch (error) {
    MessagePlugin.error('粘贴失败，请检查剪贴板内容');
  }
};
</script>

<style lang="less" scoped>
.copy {
  margin-left: auto;
  .t-icon {
    font-size: 25px;
    cursor: pointer;
  }
}
</style>
