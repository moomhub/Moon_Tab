<template>
  <div class="search-container">
    <div class="search">
      <t-dropdown
        class="engine-icon"
        trigger="click"
        placement="bottom"
        @click="handleClick"
      >
        <img :src="currentSearchEngine.icon" :alt="currentSearchEngine.name" />
        <t-dropdown-menu>
          <t-dropdown-item
            v-for="(item, index) in searchEnginesOptions"
            :key="index"
            :value="item.name"
          >
            <img :src="item.icon" class="engine" :alt="item.name" />
          </t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
      <t-input
        size="large"
        class="search-input"
        v-model="searchQuery"
        placeholder="输入搜索内容"
        @enter="handleSearch"
      />
      <div class="search-icon" @click="handleSearch">
        <SearchIcon />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchIcon } from 'tdesign-icons-vue-next';
import { useSystemStore } from '@/store';

const systemStore = useSystemStore();

// 处理下拉选择搜索引擎的点击事件
const handleClick = (data: any) => {
  systemStore.baseSetting.searchEngine = data.value;
};

const searchEnginesOptions = computed(() => {
  return systemStore.baseSetting.searchEngineConfig.filter(
    (item) => item.enabled
  );
});

// 当前搜索引擎
const currentSearchEngine = computed(() => {
  const result =
    systemStore.baseSetting.searchEngineConfig.find((item) => {
      if (item.name === systemStore.baseSetting.searchEngine) {
        return item;
      }
    }) || systemStore.baseSetting.searchEngineConfig[0];
  console.log('current search engine', result);
  return result;
});

watch(
  () => systemStore.baseSetting.searchEngineConfig,
  (newValue) => {
    newValue.forEach((item) => {
      if (item.name === systemStore.baseSetting.searchEngine && !item.enabled) {
        // 寻找可用的搜索引擎
        const availableEngine = newValue.find((engine) => engine.enabled);
        systemStore.baseSetting.searchEngine = availableEngine?.name || 'baidu';
      }
    });
  },
  {
    deep: true,
  }
);

const searchQuery = ref('');

// 处理搜索按钮点击事件
const handleSearch = () => {
  const searchText = searchQuery.value.trim();
  if (searchText === '') {
    MessagePlugin.warning('请输入搜索内容');
    return;
  }
  const url = currentSearchEngine.value.url.replace('{query}', searchText);
  searchQuery.value = '';
  if (systemStore.baseSetting.searchOpenWay) {
    // 新窗口打开
    window.open(url, '_blank');
    return;
  }
  window.location.href = url;
};
</script>

<style lang="less" scoped>
.search-container {
  width: 100%;
  display: flex;
  justify-content: center;
  position: absolute;
  // TODO 搜索框的位置
  top: 10vh;
  z-index: 5;
  transition: top, width, height, 0.3s;
}

.search {
  overflow: hidden;
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  border-width: 1px;
  border-style: solid;
  background: var(--td-bg-color-container);
  padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingTB-xl)
    var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-l);
  border-radius: 16px;
  border: none;
  font-size: var(--td-font-size-link-large);

  .search-input {
    width: 500px;
    :deep(.t-input) {
      border-color: transparent;
      background-color: none;
    }
    :deep(.t-input:focus) {
      box-shadow: none;
    }
    :deep(.t-input--focused) {
      box-shadow: none;
    }
  }
  .search-icon {
    font-size: var(--td-comp-size-m);
    color: var(bg-color-component-active);
    cursor: pointer;
    margin-left: var(--td-comp-margin-s);
  }
}

.engine-icon {
  margin-right: var(--td-comp-margin-s);
  padding: var(--td-pop-padding-m);
  cursor: pointer;
  width: 50px;
  height: 50px;
}
.engine {
  cursor: pointer;
  width: 50px;
  height: 50px;
}
</style>
