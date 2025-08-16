import { RootState } from "@/store";

export const selectSystemInfoLastUpdated = (state: RootState) => state.systemInfo.lastUpdated;
