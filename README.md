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

## 前端架构速查（Vue Router / Pinia / API）

写新页面时建议按本节约定：**页面组件只做路由与数据编排**，业务 UI 放在 `src/components/` 下的 **View** 里；跨页共享数据走 **Pinia**，异步数据入口统一走 **`src/api/`**。

### 技术栈与入口

| 依赖 | 作用 |
|------|------|
| `vue-router`（约 5.x） | 声明式路由、`meta`、编程式导航 |
| `pinia`（约 3.x） | 全局状态、按需 `loadXxx` 拉数 |

- **应用挂载**：`src/main.ts` 中顺序为 `createApp` → `app.use(pinia)` → `app.use(router)` → **`await usePermissionStore().loadDynamicRoutes(router)`** → **`await router.isReady()`** → `mount`。这样动态路由（若后端下发）在首屏前注册完毕。
- **壳层**：`src/App.vue` 只负责侧栏 + `<RouterView />`；`onMounted` 里调用 **`useAppStore().loadGlobalModules()`**，预拉全局业务模块（商品、通知、维保工单、订单、工程项目等）。路由切换时会把主内容区滚动条置顶。

### 路由结构（静态路由）

静态路由集中在 **`src/router/index.ts`**。约定：

- **`path`**：URL；根路径 `/` **重定向** 到 `/home`。
- **`name`**：编程式导航优先用 **`router.push({ name: '...' })`**，避免硬编码路径。
- **`meta.activeTab`**：与侧栏高亮一致，取值需与 `App.vue` 里 `tabRouteMap` 的 key 对齐（如 `home`、`shop`、`management`、`org-architecture`、`contracts`、`consultation-feedback`）。

当前主要路径一览（节选）：

| 路径 | name | activeTab |
|------|------|-----------|
| `/home` | `home` | `home` |
| `/messages` | `messages` | `home` |
| `/shop` 及子路径 | `shop`、`product-detail`、`cart`、`wishlist` | `shop` |
| `/management` 及子路径 | `management`、`maintenance-repair`、`maintenance-projects`、`order-management`、`engineering-projects` | `management` |
| `/org`、`/org/members`、`/org/teams` | `org-architecture`、`member-management`、`team-management` | `org-architecture` |
| `/contracts` | `contracts` | `contracts` |
| `/consultation-feedback` 及子路径 | `consultation-feedback`、`all-consultations`、`feedback-records` | `consultation-feedback` |

侧栏点击 Tab 时，`App.vue` 的 `onSidebarNavigate` 只跳到各 Tab 的「默认首页」（例如管理 → `/management`），子路由由各页面内 `router.push` 进入。

### 动态路由（可选，后端菜单）

- **`src/api/permissionApi.ts`**：`fetchBackendRoutes()` 返回 `BackendRouteConfig[]`（`name`、`path`、`componentKey`、`meta`）。当前实现返回 **空数组**，仅占位。
- **`src/router/dynamicRegistry.ts`**：`componentKey` → 真实 Vue 组件的映射表；**新增动态页时**需在此注册 `componentKey`，并在后端（或本地模拟）返回对应配置。
- **`src/stores/permissionStore.ts`**：`loadDynamicRoutes(router)` 会遍历后端路由，用 `router.addRoute` 注册，并避免重复 `name`。

### Pinia Store 职责

| Store | 文件 | 职责摘要 |
|-------|------|----------|
| `useAppStore` | `src/stores/appStore.ts` | 购物车/心愿单/商城分页与滚动、**全局模块数据**（`loadGlobalModules` 并行拉取商品、待办通知、维保维修单、订单、工程/维保项目等）、工程/维保/咨询相关的跨页「待打开」状态 |
| `useOrgStore` | `src/stores/orgStore.ts` | 成员与团队：`loadOrganizationData()` → 写入 `members`、`teams` |
| `usePermissionStore` | `src/stores/permissionStore.ts` | 启动时合并后端动态路由 |

页面级需要组织数据时，在对应 **Page** 的 `onMounted` 里调用 `orgStore.loadOrganizationData()`（与 `ManagementPage`、组织页一致）。需要全局列表时依赖 `appStore.loadGlobalModules()`（根组件已调一次，Page 里可再调以兼容直达刷新）。

### API 层约定（`src/api/`）

| 模块 | 文件 | 说明 |
|------|------|------|
| 通用 | `mockUtils.ts` | 例如 `mockLatency()`，模拟网络延迟 |
| 组织 | `orgApi.ts` | `fetchMembers`、`fetchOrganizationTeams` |
| 商品 | `commerceApi.ts` | `fetchProducts` |
| 项目 | `projectApi.ts` | `fetchEngineeringProjects`、`fetchMaintenanceProjects` |
| 运营 | `operationApi.ts` | `fetchMaintenanceRepairOrders`、`fetchOrders` |
| 通知 | `notificationApi.ts` | `fetchTodoNotifications` |
| 权限/菜单 | `permissionApi.ts` | `fetchBackendRoutes`（动态路由配置） |

约定：对外导出 **async 函数**，返回 Promise；内部可从 `src/data` 读本地种子数据并拷贝，再接真实 HTTP 时只改各 `*.ts` 实现，**Store 与页面尽量不改**。共享类型可放在 `src/types/`（如 `app-domain.ts`）。

### 页面（Page）与视图（View）

- **`src/pages/*.vue`**：**薄封装**。负责 `useAppStore` / `useOrgStore`、`useRouter`，在 `onMounted` 中按需 `loadXxx`，把 store 中的数据 **用 props 传给** `src/components/**` 下的业务 View；事件里做 `router.push` 或再写回 store。
- **`src/components/**`**：具体 UI 与交互；尽量 **不直接依赖路由**，通过 emit 让 Page 导航，便于复用与测试。

参考：`src/pages/ManagementPage.vue`、`OrganizationArchitecturePage.vue`、`ConsultationFeedbackPage.vue`。

### 新增静态页面 checklist

1. 在 `src/components/` 实现或复用业务 **View**（接收 props、对外 emit）。
2. 新建 **`src/pages/YourPage.vue`**：注入 store、绑定 props/事件、`onMounted` 拉数。
3. 在 **`src/router/index.ts`** 增加一条 `route`：`path`、`name`、`component`、`meta.activeTab`。
4. 若需侧栏一级入口：改 **`src/App.vue`** 的 `tabRouteMap`（及侧栏组件配置，如有）。
5. 若数据来自新后端：在 **`src/api/`** 新增函数 → 在对应 Store 或 Page 中调用；类型补 **`src/types`**。
6. 若需 **动态路由**：后端返回 `componentKey` → **`dynamicRegistry.ts`** 注册组件 → **`permissionApi.ts`** 改为真实请求。

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
