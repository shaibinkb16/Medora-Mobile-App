import * as Notifications from "expo-notifications";
import * as Device from "expo-device"; // ✅ Fix for checking physical device
import Constants from "expo-constants";
import { Platform } from "react-native";

// ✅ Set global notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ✅ Function to register for push notifications
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("🚨 Push notifications are only available on physical devices.");
    return null;
  }

  // Request notification permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("🚨 Push notification permissions denied.");
    return null;
  }

  try {
    // ✅ Get Expo Push Token (Ensure FCM is used for Android)
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId, // Ensures FCM works on Android
    });

    console.log("✅ Expo Push Token:", tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error("❌ Error getting push token:", error);
    return null;
  }
}

// ✅ Setup notification listeners
export function setupNotificationListener() {
  const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log("📩 Notification Received:", notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("📲 User interacted with notification:", response);
  });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}
