import { RootState } from "@/store";

export const selectMetricsStatus = (state: RootState) => state.metrics.status;

