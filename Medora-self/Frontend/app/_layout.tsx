import { Stack } from "expo-router";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import { AuthProvider } from "./store/authContext";
import { NotificationProvider } from "./store/notificationContext";
import { registerForPushNotificationsAsync, setupNotificationListener } from "./services/notifications";

const Layout = () => {
  useEffect(() => {
    registerForPushNotificationsAsync();
    setupNotificationListener();
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default Layout; // ✅ Ensure default export
