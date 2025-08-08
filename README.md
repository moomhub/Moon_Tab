# Moon Tab - 简洁的新标签页扩展

![Logo](./public/logo.png)

一个简洁美观的浏览器新标签页扩展，提供书签管理、倒计时卡片和个性化搜索等功能。

## 功能特性

- 🏠 可自定义的新标签页
- 📌 多尺寸书签卡片管理
- ⏱️ 倒计时卡片
- 🔍 多搜索引擎切换
- 🎨 个性化背景设置
- 📱 响应式布局

## 技术栈

- Vue 3 + TypeScript
- TDesign Vue Next UI组件库
- Pinia状态管理
- LocalForage本地存储
- Vite构建工具

## 项目结构
src/
├── components/       # 公共组件
│   ├── card/        # 卡片组件
│   ├── dialog/      # 对话框组件
│   ├── form/        # 表单组件
│   └── status/      # 状态组件
├── page/            # 页面组件
│   ├── add-card/    # 添加卡片页面
│   ├── search-bar/  # 搜索栏
│   ├── swiper/      # 卡片轮播
│   └── system-settings/ # 系统设置
├── store/           # 状态管理
│   ├── indexedDB.ts # 本地数据库
│   ├── swiper.ts    # 卡片状态
│   └── wallpaper.ts # 壁纸状态
├── utils/           # 工具函数
│   ├── eventBus.ts  # 事件总线
│   ├── system.ts    # 系统工具
│   └── wallpaper.ts # 壁纸工具
└── types/           # 类型定义

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

```bash
pnpm build:zip
```

### ZH
1. 基本功能
- 新标签页替换 ：替换浏览器默认新标签页
- 卡片管理 ：支持添加/编辑/删除书签卡片
- 个性化设置 ：可更换背景壁纸和调整布局

2. 测试账户
- 无需登录账户
- 所有数据存储在本地IndexedDB

## 自动化部署

本项目包含一个GitHub Action工作流，用于自动构建和打包扩展，并提供上传到Microsoft Partner Center的框架。

### 配置说明

1. 在GitHub仓库的Settings > Secrets and variables > Actions中添加以下secrets：
   - `MPC_TENANT_ID` - Microsoft Partner Center租户ID
   - `MPC_CLIENT_ID` - Azure AD应用客户端ID
   - `MPC_CLIENT_SECRET` - Azure AD应用客户端密钥
   - `MPC_PRODUCT_ID` - 产品ID

2. 工作流会在每次推送到main分支时自动触发，也可以通过GitHub Actions界面手动触发。

3. 上传到Microsoft Partner Center的部分需要根据Microsoft官方API文档进行实现，当前工作流中提供了PowerShell脚本的框架代码。

### EN 
1. Basic functions
- New tab replacement: Replace the default new tab in the browser
- Card management: supports adding/editing/deleting bookmark cards
- Personalized settings: adjustable background wallpaper and layout

2. Test account
- No need to log in to the account
- All data is stored locally in IndexedDB

## Automated Deployment

This project includes a GitHub Action workflow for automatically building and packaging the extension, with a framework for uploading to the Microsoft Partner Center.

### Configuration Instructions

1. Add the following secrets in your GitHub repository under Settings > Secrets and variables > Actions:
   - `MPC_TENANT_ID` - Microsoft Partner Center tenant ID
   - `MPC_CLIENT_ID` - Azure AD application client ID
   - `MPC_CLIENT_SECRET` - Azure AD application client secret
   - `MPC_PRODUCT_ID` - Product ID

2. The workflow is automatically triggered on every push to the main branch, and can also be manually triggered through the GitHub Actions interface.

3. The upload to Microsoft Partner Center section needs to be implemented according to the official Microsoft API documentation. The current workflow provides a framework code for a PowerShell script.