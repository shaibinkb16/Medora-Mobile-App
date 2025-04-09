import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { useAuth } from "../store/authContext";
import axios from "axios";

export default function ReminderSettingsScreen() {
  const { token } = useAuth();
  const [enableReminders, setEnableReminders] = React.useState(true);
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const API_BASE_URL = "http://192.168.162.200:5000/api";

  const handleToggleReminders = async (value: boolean) => {
    if (!token) return;
    
    setLoading(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/users/reminder-settings`,
        { enableReminders: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnableReminders(value);
    } catch (error) {
      console.error("Error updating reminder settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePush = async (value: boolean) => {
    if (!token) return;
    
    setLoading(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/users/notification-settings`,
        { pushEnabled: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPushEnabled(value);
    } catch (error) {
      console.error("Error updating notification settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminder Settings</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Enable Reminders</Text>
        <Switch 
          value={enableReminders} 
          onValueChange={handleToggleReminders}
          disabled={loading}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Push Notifications</Text>
        <Switch 
          value={pushEnabled} 
          onValueChange={handleTogglePush}
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  settingText: {
    color: "#ccc",
    fontSize: 16,
  },
});