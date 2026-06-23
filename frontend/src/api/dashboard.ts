import { apiClient} from "./client.ts";
import { mapDeadlineFull, mapProjectShort, mapDeadlineShort } from "./mappers.ts";
import * as Mock from "./mockdata.ts";

import type { ApiProjectShort, ApiDeadlineShort, ApiDeadlineFull } from "./mappers.ts";


const IS_MOCK_DATA: boolean = true; // на время разработки

export const dashboardApi = {
    getDeadlines: async (skip: number = 0, limit: number = 10) => {
        if (IS_MOCK_DATA) {
            return Mock.mockApiDeadlinesShort.map(mapDeadlineShort);
        }
        const data = await apiClient<ApiDeadlineShort[]>(`dashboard/deadlines?skip=${skip}&limit=${limit}`);
        return data.map(mapDeadlineShort);
    },
    getDeadlineById: async (id: number) => {
        if (IS_MOCK_DATA) {
            const data = Mock.mockApiDeadlinesFull[id];
            if (!data) throw new Error("Deadline not found in mocks");
            return mapDeadlineFull(data);
        }
        const data = await apiClient<ApiDeadlineFull>(`dashboard/deadlines/${id}`);
        return mapDeadlineFull(data);
    },
    getProjects: async (skip: number = 0, limit: number = 10) => {
        if (IS_MOCK_DATA) {
            return Mock.mockApiProjectsShort.map(mapProjectShort);
        }
        const data = await apiClient<ApiProjectShort[]>(`dashboard/projects?skip=${skip}&limit=${limit}`);
        return data.map(mapProjectShort);
    }
}