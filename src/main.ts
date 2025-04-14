import { createApp } from 'vue';
import App from './App.vue';
import stores from '@/store';

// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';
import './reset.css';
import './theme.css';

import directives from '@/directives/index';

const app = createApp(App);

// 注册 pinia 状态管理
app.use(stores);
app.use(directives);
app.mount('#app');
