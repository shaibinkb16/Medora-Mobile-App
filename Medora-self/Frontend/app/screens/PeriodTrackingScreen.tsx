import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import { LineChart } from "react-native-chart-kit";
import { useAuth } from "../store/authContext";
import { useNotifications } from "../store/notificationContext";
import * as Notifications from "expo-notifications";
import axios from "axios";

const API_BASE_URL = "http://192.168.162.200:5000";
const screenWidth = Dimensions.get("window").width;

interface PeriodData {
  firstPeriodDate: string;
  cycleLength: number;
  periodLength: number;
  nextPeriodDate: string;
  history: string[];
}

interface MarkedDates {
  [date: string]: { marked: boolean; dotColor: string };
}

const PeriodTrackingScreen = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  const { addNotification } = useNotifications();

  const [periodData, setPeriodData] = useState<PeriodData | null>(null);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [chartData, setChartData] = useState<number[]>([]);

  useEffect(() => {
    fetchPeriodData();
  }, []);

  const fetchPeriodData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/period/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      console.log("API Response:", data); // Log the API response

      if (data) {
        setPeriodData(data);

        const marked: MarkedDates = {};
        const cycleLengths: number[] = [];

        // Mark historical dates
        data.history.forEach((date: string) => {
          const formattedDate = new Date(date).toISOString().split("T")[0];
          marked[formattedDate] = { marked: true, dotColor: "red" };
        });

        // Mark predicted dates
        if (data.nextPeriodDate) {
          const nextDate = new Date(data.nextPeriodDate).toISOString().split("T")[0];
          marked[nextDate] = { marked: true, dotColor: "purple" };
        }

        setMarkedDates(marked);

        // Prepare chart data
        if (data.history.length > 1) {
          for (let i = 1; i < data.history.length; i++) {
            const prevDate = new Date(data.history[i - 1]);
            const currDate = new Date(data.history[i]);
            const diff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
            cycleLengths.push(diff);
          }
          setChartData(cycleLengths);
        }
      }
    } catch (error) {
      console.error("Failed to fetch period data:", error);
      Alert.alert("Error", "Failed to load period data");
    }
  };

  const sendPeriodReminder = async () => {
    if (periodData && periodData.nextPeriodDate) {
      const nextPeriodDate = new Date(periodData.nextPeriodDate).toLocaleDateString();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Period Reminder",
          body: `Your next period is on ${nextPeriodDate}. Stay prepared! 🩸`,
        },
        trigger: { seconds: 5},
      });

      addNotification({
        title: "Period Reminder",
        message: `Your next period is on ${nextPeriodDate}. Stay prepared! 🩸`,
        isRead: false,
      });

      Alert.alert("Reminder Set", `You will be notified before your period on ${nextPeriodDate}.`);
    } else {
      Alert.alert("Error", "Next period date is not available.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📅 Period Tracking</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/components/PeriodTracker/PeriodTrackerForm")}
          >
            <Text style={styles.addButtonText}>➕ Add Period</Text>
          </TouchableOpacity>
        </View>

        <Calendar
          markedDates={markedDates}
          theme={{
            todayTextColor: "#ff4757",
            arrowColor: "#ff4757",
            selectedDayBackgroundColor: "#ff4757",
          }}
        />

        <Text style={styles.sectionTitle}>📊 Cycle Insights</Text>
        {chartData.length > 0 ? (
          <LineChart
            data={{
              labels: chartData.map((_, i) => `Cycle ${i + 1}`),
              datasets: [{ data: chartData }],
            }}
            width={screenWidth - 40}
            height={220}
            yAxisSuffix=" days"
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#ff7f50",
              backgroundGradientTo: "#ff4757",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noDataText}>No cycle data available yet.</Text>
        )}

        <Text style={styles.sectionTitle}>📜 Period History</Text>
        {periodData && periodData.history && periodData.history.length > 0 ? (
          periodData.history.map((date, index) => (
            <View key={index} style={styles.historyItem}>
              <Text>🩸 {new Date(date).toLocaleDateString()}</Text>
              {index === 0 && (
                <Text>🔁 Cycle: {periodData.cycleLength} days | 📆 Duration: {periodData.periodLength} days</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No period history recorded.</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={sendPeriodReminder}>
          <Text style={styles.buttonText}>Set Reminder</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#ff4757" },
  addButton: {
    backgroundColor: "#ff4757",
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#333",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  historyItem: {
    backgroundColor: "#ffe8e6",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  noDataText: {
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#ff4757",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PeriodTrackingScreen;