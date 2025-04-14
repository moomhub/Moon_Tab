<template>
  <div class="max">
    <LocalIconData ref="iconDataRef" show-delete></LocalIconData>
  </div>
</template>

<script setup lang="ts" name="LocalIconSetting">
import LocalIconData from '@/components/icon/LocalIconData.vue';
import { getSystemIconData } from '@/utils/icon';

// vue ref
const iconDataRef = ref<InstanceType<typeof LocalIconData>>();

onMounted(async () => {
  console.log('LocalIconData-----1');
  const localSystemIcon = await getSystemIconData();
  iconDataRef.value?.setIconData(localSystemIcon);
});

onUpdated(async () => {
  console.log('LocalIconData-----2');
  const localSystemIcon = await getSystemIconData();
  iconDataRef.value?.setIconData(localSystemIcon);
});
</script>

<style lang="less" scoped></style>
