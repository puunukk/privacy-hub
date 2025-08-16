import { RootState } from "@/store";

export const selectMetricsError = (state: RootState) => state.metrics.error;

