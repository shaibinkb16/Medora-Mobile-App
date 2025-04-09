import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/authContext"; // ✅ Import useAuth to get user data

interface Shortcut {
  label: string;
  iconName: string;
  route: string;
  bgColor: string;
}

export default function ShortcutTiles() {
  const router = useRouter();
  const { user } = useAuth(); // ✅ Get user details (including gender)

  const shortcuts: Shortcut[] = [
    { label: "Dashboard", iconName: "analytics-outline", route: "/dashboard", bgColor: "#4dabf7" },
   /*  { label: "Diet Plan", iconName: "nutrition-outline", route: "/diet", bgColor: "#f78fb3" }, */
  /*   { label: "Fitness", iconName: "walk-outline", route: "/fitness", bgColor: "#34c759" }, */
    { label: "Records", iconName: "folder-open-outline", route: "/records", bgColor: "#ffd43b" },
   /*  { label: "Family", iconName: "people-outline", route: "/family", bgColor: "#a29bfe" }, */
    { label: "Settings", iconName: "settings-outline", route: "/settings", bgColor: "#ff6b6b" },
    { label: "Add Reminder", iconName: "alarm-outline", route: "/(remainder)/UpcomingRemindersScreen", bgColor: "#ff9f43" },

/*     { label: "Add Medication", iconName: "Add Remainders", route: "/RemainderPage", bgColor: "#ff9f43" },
 */    {label:"Periods Tracker", iconName: "female-outline",route: "../screens/PeriodTrackingScreen",bgColor:"#e84393"},
  // ✅ Only show "Period Reminder" if the user is female
/*   if (user?.gender === "Female") {
    shortcuts.push({
      label: "Period Reminder",
      iconName: "female-outline",
      route: "../screens/PeriodTrackingScreen",
      bgColor: "#e84393",
    });
  }
 */
  ];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Access</Text>
      <View style={styles.grid}>
        {shortcuts.map((shortcut, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tile, { backgroundColor: shortcut.bgColor }]}
            onPress={() => router.push(shortcut.route as any)}
          >
            <Icon name={shortcut.iconName} size={24} color="#fff" />
            <Text style={styles.tileText}>{shortcut.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  tileText: {
    marginTop: 8,
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

