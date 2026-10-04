# RD Workflow

一个用于展示 React + TypeScript 业务系统开发能力的研发流程管理前端。项目以“研发变更请求”为核心：一个 Project 可以包含多个 Change Request；每个请求通过独立的 Workflow Steps 推进，并保留参数快照和操作历史。

当前版本是**纯前端演示版**，使用 Mock 用户和浏览器本地存储，不包含真实后端或安全认证。

## 在线演示

[打开 RD Workflow 在线演示](https://rd-workflow-react.onrender.com)

进入 Login 页面后可直接选择不同角色的 Mock 用户，无需注册账号。推荐按照下方的“推荐演示流程”体验 Reject、Rework、Resubmit 和顺序审批的完整业务闭环。

## 已实现功能

- Project 列表、搜索、状态筛选、排序、详情与创建
- Change Request 创建：选择设备模板并指定各步骤负责人
- Designer 编辑、校验、保存设备参数；展示初始快照与已保存参数的差异
- 顺序审批：Submit、Approve、Reject、Rework、Resubmit，直到 Change Request 完成
- Workflow Timeline、当前用户 My Tasks、Dashboard 统计与 Audit History
- Mock 用户切换、路由保护、无权限操作限制、空状态与 404
- 业务数据保存至 `localStorage`；支持 Reset demo data 恢复初始数据

Workflow 操作不只是修改一个状态字段：每次操作会更新当前 Step、下一 Step、Change Request 摘要及 Audit Record。关键转换逻辑位于 `src/domain/workflow/`，并通过 Vitest 验证。

## 本地运行

```bash
npm install
npm run dev
```

打开终端显示的本地地址，在 Login 页选择演示用户即可进入系统。其他检查命令：

```bash
npm test        # 业务转换、Mock 一致性和本地存储测试
npm run lint    # ESLint
npm run build   # TypeScript 检查与生产构建
```

## 推荐演示流程

1. 以 **Alice（Project Manager）** 登录，创建 Project，再创建 Change Request；选择设备模板和 Designer、Mechanical、Electrical、QA 负责人。
2. 切换到指定的 **Designer**，在 My Tasks 打开请求，修改参数并 Save，再 Submit。
3. 切换到指定的 **Mechanical Engineer**，Reject 并填写原因。
4. 切回 **Designer**，查看 Reject 原因，修改并保存参数，然后 Resubmit。
5. 依次切换到当前负责人 Approve，直到 QA 完成最后一步；观察 Timeline、My Tasks、Dashboard 与 Audit History 的变化。

也可以直接使用初始 Mock 场景：`cr-001` 从 Mechanical Review 开始，`cr-002` 从 Designer Rework 开始。演示过后可点击顶部 **Reset demo data**，恢复初始业务数据并退出登录。

## 主要数据流

- `AppLayout` 持有当前演示会话中的 Projects、Change Requests、Workflow Steps、参数快照与 Audit Records，通过 React Router 的 `Outlet context` 提供给页面。
- 页面持有搜索条件、弹窗和表单草稿等临时状态；My Tasks 与 Dashboard 根据共享业务数据计算展示结果，不另存一份任务列表。
- ParameterForm 的输入草稿与已保存参数分离。只有通过校验并点击 Save 后，摘要、差异和提交数据才更新。
- Submit、Approve、Reject、Resubmit 的纯函数返回新业务数据；页面处理用户反馈与 React state 更新。
- 业务数据保存在浏览器 `localStorage` 中，刷新或切换 Mock 用户后仍可继续演示。未保存的草稿不会持久化。

## 技术栈

React、TypeScript、Vite、React Router、Tailwind CSS、Ant Design、Vitest、ESLint；前端演示通过 Render Static Site 部署。

## 当前边界

- 登录是 Mock 身份选择；前端按钮隐藏和检查仅用于演示交互，不构成真实安全控制。
- 数据只保存在当前浏览器中，未连接 API 或数据库；清除站点数据会丢失本地操作记录。
- 目前未实现真实后端认证、服务端权限校验或并发审批处理；线上版本仍是基于 Mock 数据的纯前端演示。
- Project 的完整生命周期规则尚未实现；当前主要闭环是 **Change Request 的顺序审批流程**。

后续全栈阶段计划引入 NestJS、PostgreSQL、Prisma 和真实 API，由服务端负责认证、授权、事务与审计记录。
