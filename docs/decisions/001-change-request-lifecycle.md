# Change Request Lifecycle

当前请求状态：

- DRAFT
- IN_REVIEW
- REWORK
- COMPLETED

DRAFT
  ↓ SUBMIT
IN_REVIEW
  ├── APPROVE → COMPLETED
  └── REJECT  → REWORK
                    ↓ RESUBMIT
                 IN_REVIEW

Mechanical APPROVE
→ ChangeRequest 仍然是 IN_REVIEW
→ 下一个 Step 进入处理状态
只有最后一个审核 Step Approve 后，请求才进入 COMPLETED。

Reject 后进入 REWORK，因为请求没有结束，而是需要 Designer 修改后重新提交。

Request Status 需要持久化，因为系统需要查询当前流程状态，并支持刷新页面、权限判断和历史追踪。

状态只能由服务端业务逻辑根据合法 Action 修改，前端不能直接决定最终状态。

当前版本不支持永久终止请求，取消/关闭请求作为后续功能。