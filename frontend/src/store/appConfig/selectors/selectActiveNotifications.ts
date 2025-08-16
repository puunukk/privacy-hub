import { RootState } from "@/store";

export const selectActiveNotifications = (state: RootState) => {
    const now = Date.now();
    const expiredThreshold = 5 * 60 * 1000; // 5 minutes

    return state.appConfig.notifications.filter(
        notification => now - notification.timestamp < expiredThreshold
    );
};