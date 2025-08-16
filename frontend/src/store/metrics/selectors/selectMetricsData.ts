import { RootState } from "@/store";

export const selectMetricsData = (state: RootState) => state.metrics.data;

