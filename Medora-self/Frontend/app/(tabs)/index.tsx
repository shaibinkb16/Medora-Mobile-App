import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../store/authContext";
import ProfileHeader from "../components/Home/ProfileHeader";
import HealthStatusSummary from "../components/Home/HealthStatusSummary";
import DailyGoalsPreview from "../components/Home/DailyGoalsPreview";
import UpcomingReminders from "../components/Home/UpcomingReminders";
import ShortcutTiles from "../components/Home/ShortcutTiles";
import WellnessTipOfDay from "../components/Dashboard/WellnessTipOfDay";
import MoodTracker from "../components/Home/MoodTracker";
import MicroChallenge from "../components/Home/MicroChallenge";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import axios from "axios";

const { width, height } = Dimensions.get("window");
const API_BASE_URL = "http://192.168.162.200:5000";

export default function HomeScreen() {
  const { user, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const [goals, setGoals] = useState([
    { id: "1", title: "Drink 2L Water", completed: false },
    { id: "2", title: "Walk 5000 Steps", completed: true },
    { id: "3", title: "Take Medication", completed: false },
  ]);

  const handleToggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  type Reminder = {
    id: string;
    type: "Medication" | "Appointment" | "Cycle";
    title: string;
    time: string;
  };

  const [reminders, setReminders] = useState<Reminder[]>([]);

  const fetchAllReminders = async () => {
    try {
      const [reminderRes, periodRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/reminders/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/period/history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const fetchedReminders = reminderRes.data as Reminder[];

      let cycleReminder: Reminder | null = null;
      const periodData = periodRes.data;
      if (periodData && periodData.nextPeriodDate) {
        const nextPeriodDate = new Date(periodData.nextPeriodDate);
        const today = new Date();
        const daysRemaining = Math.ceil(
          (nextPeriodDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
        );

        cycleReminder = {
          id: "cycle1",
          type: "Cycle",
          title: "Period Reminder",
          time: `${daysRemaining} days remaining`,
        };
      }

      const combinedReminders = [...fetchedReminders];
      if (cycleReminder) combinedReminders.push(cycleReminder);

      setReminders(combinedReminders);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      Alert.alert("Error", "Failed to load reminders");
    }
  };

  useEffect(() => {
    fetchAllReminders();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllReminders();
    setRefreshing(false);
  }, []);

  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);

  float1.value = withRepeat(withTiming(-20, { duration: 4000 }), -1, true);
  float2.value = withRepeat(withTiming(20, { duration: 5000 }), -1, true);

  const particleStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: float1.value }],
  }));

  const particleStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: float2.value }],
  }));

  return (
    <LinearGradient
      colors={["#a770ef", "#8e2de2", "#4a00e0"]}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View
        style={[styles.particle, styles.particle1, particleStyle1]}
      />
      <Animated.View
        style={[styles.particle, styles.particle2, particleStyle2]}
      />

      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {user && (
            <Animated.View entering={FadeInUp.duration(600)}>
              <ProfileHeader user={user} />
            </Animated.View>
          )}
          <Animated.View entering={FadeInUp.delay(100).duration(600)}>
            <HealthStatusSummary
              statusMessage="All vitals looking great today!"
              statusType="good"
            />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(200).duration(600)}>
            <DailyGoalsPreview goals={goals} onToggleGoal={handleToggleGoal} />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(300).duration(600)}>
            <UpcomingReminders reminders={reminders} />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(400).duration(600)}>
            <ShortcutTiles />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(500).duration(600)}>
            <WellnessTipOfDay />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(600).duration(600)}>
            <MoodTracker />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(700).duration(600)}>
            <MicroChallenge />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  particle: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.2,
    zIndex: -1,
  },
  particle1: {
    width: 180,
    height: 180,
    backgroundColor: "#ffffff",
    top: height * 0.15,
    left: width * 0.1,
  },
  particle2: {
    width: 140,
    height: 140,
    backgroundColor: "#ffccff",
    top: height * 0.45,
    right: width * 0.05,
  },
});
