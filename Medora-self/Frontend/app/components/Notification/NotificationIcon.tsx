import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNotifications } from "../../store/notificationContext";

export default function NotificationIcon({ navigation }: { navigation: any }) {
  const { unreadCount } = useNotifications();

  return (
    <TouchableOpacity onPress={() => navigation.navigate("NotificationsScreen")}>
      <View style={{ position: "relative" }}>
        <Icon name="notifications" size={30} color="#fff" />
        {unreadCount > 0 && (
          <View style={{ position: "absolute", top: -5, right: -5, backgroundColor: "red", borderRadius: 10, padding: 5 }}>
            <Text style={{ color: "#fff", fontSize: 12 }}>{unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
