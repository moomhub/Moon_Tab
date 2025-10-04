# Moon Tab - 简洁的新标签页扩展

![Logo](./public/logo.png)

一个简洁美观的浏览器新标签页扩展，提供书签管理、倒计时卡片和个性化搜索等功能。

## 功能特性

- 🏠 可自定义的新标签页
- 📌 多尺寸书签卡片管理
- ⏱️ 倒计时卡片
- 🔍 多搜索引擎切换
- 🎨 个性化背景设置（支持图片和视频壁纸）
- 📱 响应式布局
- ☁️ 数据备份到云存储（S3兼容服务）

## 技术栈

- Vue 3 + TypeScript
- TDesign Vue Next UI组件库
- Pinia状态管理
- LocalForage本地存储（IndexedDB）
- Vite构建工具
- Swiper轮播组件
- AWS SDK（用于云存储备份）

## 项目结构

```
src/
├── App.vue           # 主应用组件
├── main.ts           # 应用入口文件
├── components/       # 公共组件
│   ├── card/         # 卡片组件
│   ├── dialog/       # 对话框组件
│   ├── form/         # 表单组件
│   └── status/       # 状态组件
├── page/             # 页面组件
│   ├── add-card/     # 添加卡片页面
│   ├── search-bar/   # 搜索栏
│   ├── swiper/       # 卡片轮播
│   └── system-settings/ # 系统设置
├── store/            # 状态管理
│   ├── index.ts      # store入口
│   ├── indexedDB.ts  # 本地数据库
│   ├── swiper.ts     # 卡片状态
│   ├── system.ts     # 系统状态
│   ├── wallpaper.ts  # 壁纸状态
│   └── plugin.ts     # 插件
├── utils/            # 工具函数
│   ├── eventBus.ts   # 事件总线
│   ├── system.ts     # 系统工具
│   ├── wallpaper.ts  # 壁纸工具
│   ├── swiper.ts     # 轮播工具
│   ├── s3.ts         # S3存储工具
│   ├── backup.ts     # 备份工具
│   ├── time.ts       # 时间工具
│   └── icon.ts       # 图标工具
├── types/            # 类型定义
├── assets/           # 静态资源
├── constants/        # 常量定义
├── directives/       # Vue指令
├── hooks/            # Vue组合式函数
└── api/              # API接口
```

## 核心功能模块

### 卡片系统
- 支持多种类型的卡片（书签、倒计时等）
- 可自定义卡片尺寸和位置
- 支持卡片分组和轮播展示

### 背景壁纸
- 支持图片和视频壁纸
- 可设置本地壁纸或使用必应每日壁纸
- 支持壁纸数据的本地存储

### 搜索功能
- 支持多种搜索引擎切换
- 可自定义搜索引擎

### 数据存储
- 使用IndexedDB进行本地数据存储
- 支持数据备份到S3兼容服务
- 提供数据导入导出功能

## 项目配置

### 环境变量

项目使用`.env`文件进行环境配置：

```
VITE_PROJECT_NAME='MoonTab'
VITE_PROJECT_VERSION='1.0.4'
VITE_BACKUP_ZIP_PREFIX='MoonTab-Backup'
VITE_BACKUP_ZIP_CONFIG_FILE_NAME='moontab-backup.mbak'
VITE_BACKUP_ZIP_ICONS_DIR='icons/'
VITE_S3_BACKUP_FOLDER='/applications/moon-tab/backups'
```

### 构建配置

项目使用Vite进行构建，主要配置包括：
- TDesign组件库按需加载
- SVG图标处理
- 静态资源优化（特定类型文件不添加hash）
- 代码压缩和打包优化

## 扩展集成

### 权限说明

扩展在manifest.json中声明了以下权限：
- `activeTab`: 访问当前活动标签页
- `tabs`: 访问标签页信息
- `storage`: 访问扩展存储
- `unlimitedStorage`: 无限制存储
- `clipboardRead/clipboardWrite`: 读写剪贴板
- `http://*/*`和`https://*/*`: 访问所有网站

### API集成

- 使用AWS SDK与S3兼容服务进行数据备份
- 通过Chrome扩展API实现标签页管理和存储

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 打包发布

Windows:
```bash
pnpm build:windows
```

Linux:
```bash
pnpm build:linux
```

## 部署流程

项目使用GitHub Actions进行自动化部署：
1. 代码推送到main分支时自动触发构建
2. 使用pnpm安装依赖并构建项目
3. 通过脚本自动部署到Microsoft Partner Center
4. 发布到GitHub Releases

## 贡献指南

欢迎提交Issue和Pull Request来改进项目。

## 许可证

[MIT](./LICENSE)
        