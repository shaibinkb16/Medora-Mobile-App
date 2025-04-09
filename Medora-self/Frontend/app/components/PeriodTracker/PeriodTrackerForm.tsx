import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  Platform,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/authContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

const API_BASE_URL = "http://192.168.162.200:5000";

const PeriodTrackerForm = () => {
  const router = useRouter();
  const { token } = useAuth();

  const [startDate, setStartDate] = useState(new Date());
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [oneWeekBefore, setOneWeekBefore] = useState(true);
  const [threeDaysBefore, setThreeDaysBefore] = useState(true);
  const [oneDayBefore, setOneDayBefore] = useState(true);

  const handleSubmit = async () => {
    if (!cycleLength || !periodLength) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/period`,
        {
          firstPeriodDate: startDate.toISOString().split("T")[0],
          cycleLength: parseInt(cycleLength),
          periodLength: parseInt(periodLength),
          notificationPreferences: {
            oneWeekBefore,
            threeDaysBefore,
            oneDayBefore,
            onStartDate: true,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Period data saved successfully");
      router.back();
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Error", "Failed to save period data");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Track Your Period</Text>

        <Text style={styles.label}>Start Date:</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {startDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}

        <Text style={styles.label}>Cycle Length (days):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={cycleLength}
          onChangeText={setCycleLength}
          placeholder="28"
        />

        <Text style={styles.label}>Period Duration (days):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={periodLength}
          onChangeText={setPeriodLength}
          placeholder="5"
        />

        <Text style={styles.label}>Notification Preferences:</Text>
        <View style={styles.switchContainer}>
          <Text>1 Week Before</Text>
          <Switch value={oneWeekBefore} onValueChange={setOneWeekBefore} />
        </View>
        <View style={styles.switchContainer}>
          <Text>3 Days Before</Text>
          <Switch value={threeDaysBefore} onValueChange={setThreeDaysBefore} />
        </View>
        <View style={styles.switchContainer}>
          <Text>1 Day Before</Text>
          <Switch value={oneDayBefore} onValueChange={setOneDayBefore} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Save Period Data</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff4757",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff4757",
    padding: 18,
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

export default PeriodTrackerForm;