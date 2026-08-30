
export type ProjectStatus = "DRAFT" | "ACTIVE" | "COMPLETED"

export interface ProjectSummary {
    // 系统内部标识
    id: string;
    // 用户能理解的项目编号
    projectNumber: string;
    // 项目名称
    name: string;
    // 项目负责人
    ownerName: string;
    // 状态
    status: ProjectStatus;
    // 变更请求数量
    changeRequestCount: number;
    // 创建时间
    createdAt: string;
}
