import { RootState } from "@/store";

export const selectCpuTemperature = (state: RootState): number | null => {
    return state.metrics.data?.cpu_temp ?? null;
};
