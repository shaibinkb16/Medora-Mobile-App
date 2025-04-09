import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

interface ReminderActionsProps {
  onAddSuccess?: () => void;
  onViewScheduled?: () => void;
  onSettingsPress?: () => void;
}

export default function ReminderActions({ 
  onAddSuccess, 
  onViewScheduled, 
  onSettingsPress 
}: ReminderActionsProps) {
  const router = useRouter();

  const handleAddReminder = () => {
    router.push("/screens/AddReminderScreen");
    onAddSuccess?.();
  };

 
/* 
  const handleSettingsPress = () => {
    router.push("/screens/ReminderSettingsScreen");
    onSettingsPress?.();
  }; */

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.addButton]}
        onPress={handleAddReminder}
      >
        <Icon name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.actionText}>Add Reminder</Text>
      </TouchableOpacity>

     
   {/*    <TouchableOpacity
        style={[styles.actionButton, styles.settingsButton]}
        onPress={handleSettingsPress}
      >
        <Icon name="settings-outline" size={20} color="#fff" />
        <Text style={styles.actionText}>Settings</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#10ac84",
  },
  scheduledButton: {
    backgroundColor: "#00d2d3",
  },
  settingsButton: {
    backgroundColor: "#5f27cd",
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 10,
  },
});