<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a0050aee-d105-4034-9cf9-65ffbd5888a5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## UI 复用：深色毛玻璃详情弹窗（维保项目 / 成员详情）

项目里「维保项目管理」点击卡片后的 **项目详情** 弹窗，与「成员管理」点击人员卡片后的 **成员详情** 弹窗，共用同一套视觉规范。后续做新弹窗时可按此描述对齐，便于 AI 或人工快速复用。

### 遮罩层

- 全屏固定：`fixed inset-0 z-[较高，如 50 / 100]`
- 背景：`bg-black/40`
- 背景模糊：`backdrop-blur-md`
- 内容区水平垂直居中：`flex items-center justify-center`，外边距 `p-4 sm:p-6`
- 点击遮罩关闭：`@click.self` 绑定关闭逻辑
- 进入动画可用：`animate-in fade-in duration-300`

### 弹窗外壳（主容器）

- 布局：`flex flex-col overflow-hidden`，限制最大宽高，避免小屏溢出
- 推荐尺寸（与维保详情「详情」态一致，可在代码里用常量）：
  - **最大宽度**：768px
  - **最大高度**：`min(680px, 90vh)`
  - **圆角**：40px
  - **最小高度**（可选）：约 280px，避免过扁
- 毛玻璃：`bg-white/10 backdrop-blur-2xl`
- 边框：`border border-white/20`
- 阴影：`shadow-2xl`
- 内层点击不冒泡到遮罩：容器上加 `@click.stop`

### 标题栏

- 底部分割：`border-b border-white/10`
- 内边距：约 `px-6 py-5 sm:px-8 sm:py-6`，`flex-shrink-0`
- 左侧装饰条：`w-1.5 h-6 rounded-full bg-[#FFE600]`，可加轻微发光：`shadow-[0_0_15px_rgba(255,230,0,0.5)]`
- 标题文字：`text-xl sm:text-2xl font-bold text-white tracking-tight`
- 关闭按钮：右上角，`p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white`，图标可用 `lucide-vue-next` 的 `X`

### 内容区（可滚动）

- `flex-1 min-h-0 overflow-y-auto`，内边距 `p-6 sm:p-8`
- 自定义滚动条（可选）：细滚动条、半透明白色 thumb，见 `MemberManagementView.vue` 内 scoped 样式

### 内层信息卡片（表单/详情块）

- 容器：`rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8 shadow-inner backdrop-blur-xl`
- **两列网格**（大屏）：`grid grid-cols-1 gap-8 sm:grid-cols-2 gap-x-12`
- 单项字段：
  - **标签**：`text-xs font-bold uppercase tracking-widest text-white/40`，下边距 `mb-2`
  - **值**：`text-xl font-bold text-white tracking-tight`；电话类可用 `font-mono tabular-nums`；邮箱可 `break-all`
- **跨两列**（如地址、备注）：`sm:col-span-2`，长文可用 `leading-relaxed`、略浅 `text-white/95`

### 弹窗尺寸变形动效（统一引用名）

- **样式文件**：`src/styles/modal-morph.css`（已在 `src/index.css` 中 `@import`，全局生效）
- **类名**：`jp-modal-morph` 加在弹窗外壳上；通过 CSS 变量 `--jp-modal-w`、`--jp-modal-h`、`--jp-modal-radius`、`--jp-modal-scale`、`--jp-modal-bg` 切换不同视图尺寸（变量含义见该文件顶部注释）
- **以后对我说**：「用 **modal-morph 动效**」或「引用 **modal-morph.css** / **jp-modal-morph**」即指本文件与该类名

### 参考实现位置

| 场景 | 文件 |
|------|------|
| 维保项目详情弹窗整体 + `modal-morph` 尺寸动画 | `src/components/MaintenanceProjectsView.vue` |
| 项目详情内层信息卡（两列字段 + 底部操作） | `src/components/maintenance/MaintenanceOverview.vue` |
| 成员详情弹窗（外壳使用全局 `jp-modal-morph` + `memberModalMorphStyle` 注入变量） | `src/components/MemberManagementView.vue` |

### 使用 `Teleport`

弹窗建议 `Teleport to="body"`，避免被侧栏或主滚动 `overflow` 裁切。

### 无障碍与快捷键

- 根节点：`role="dialog"`、`aria-modal="true"`、标题 `id` 与 `aria-labelledby` 关联
- `Escape` 关闭（在 `document` 上监听 `keydown`，组件卸载时移除）
