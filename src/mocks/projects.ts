import type { ProjectSummary } from "../types/projects";

export const projectsData: ProjectSummary[] = [
    {
        id: "01-2026",
        projectNumber: "RD-2026-001",
        name: "Alpha",
        ownerName: "Summer",
        status: "DRAFT",
        changeRequestCount: 3,
        createdAt: '2026-08-20',
    },
    {
        id: "02-2026",
        projectNumber: "RD-2026-002",
        name: "Beta",
        ownerName: "Morty",
        status: "ACTIVE",
        changeRequestCount: 5,
        createdAt: '2026-08-21',
    },
    {
        id: "03-2026",
        projectNumber: "RD-2026-003",
        name: "Gamma",
        ownerName: "Rick",
        status: "COMPLETED",
        changeRequestCount: 2,
        createdAt: '2026-08-22',
    }
];