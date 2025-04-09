import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useAuth } from "../store/authContext";
import apiClient from "../apiClient";
import ReminderCard from "../components/Reminders/ReminderCard";
import ReminderActions from "../components/Reminders/ReminderActions";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

interface Reminder {
  _id: string;
  title: string;
  message: string;
  type: string;
  date: string;
  time: string;
  remindAt: string;
  isCompleted?: boolean;
}

export default function UpcomingRemindersScreen() {
  const { token, signOut } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<LottieView | null>(null);

  const fetchReminders = async () => {
    try {
      setError(null);
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const res = await apiClient.get("/reminders");
      if (res.data && Array.isArray(res.data)) {
        setReminders(res.data);
        animateContent();
      } else {
        setError("Invalid response format");
      }
    } catch (err:any) {
      console.error("Error fetching reminders:", err.response?.data);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        signOut();
      } else {
        setError(err.response?.data?.error || "Failed to fetch reminders");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const animateContent = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  };

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle("light-content");
      fetchReminders();
      animateContent();
      return () => {
        // Clean up animations if needed
      };
    }, [token])
  );

  useEffect(() => {
    if (animationRef.current) {
      setTimeout(() => {
        animationRef.current?.play();
      }, 100);
    }
  }, [loading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    await fetchReminders();
  };

  const handleReminderAction = async () => {
    await fetchReminders();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const getUpcomingReminders = () => {
    return reminders
      .filter(
        (reminder) =>
          !reminder.isCompleted && new Date(reminder.remindAt) > new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime()
      );
  };

  const upcomingReminders = getUpcomingReminders();
  const themeColors = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#00B0C8" />
      
      <LinearGradient
        colors={['#00B0C8', '#00D4E0']}
        style={styles.headerGradient}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: headerOpacity,
              transform: [{ scale: headerScale }]
            }
          ]}
        >
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </Animated.View>
        
        <View style={styles.headerRow}>
          <Text style={styles.title}>Upcoming Reminders</Text>
          <TouchableOpacity 
            style={styles.themeToggle}
            onPress={toggleTheme}
          >
            <MaterialCommunityIcons 
              name={isDarkMode ? "weather-night" : "weather-sunny"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: themeColors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
            progressBackgroundColor={themeColors.card}
          />
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
              <TouchableOpacity 
                onPress={handleRefresh} 
                style={[styles.retryButton, { backgroundColor: themeColors.primary }]}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : loading && reminders.length === 0 ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color={themeColors.primary} size="large" />
              <Text style={[styles.loadingText, { color: themeColors.text }]}>Loading your reminders...</Text>
            </View>
          ) : upcomingReminders.length === 0 ? (
            <View style={styles.emptyContainer}>
              {animationRef.current && (
                <LottieView
                  ref={animationRef}
                  source={require('../../assets/empty-search.json')}
                  style={styles.emptyAnimation}
                  autoPlay
                  loop
                />
              )}
              <Text style={[styles.emptyText, { color: themeColors.secondaryText }]}>
                No upcoming reminders found
              </Text>
              
            </View>
          ) : (
            <View style={styles.remindersList}>
              {upcomingReminders.map((reminder, index) => (
                <Animated.View
                  key={reminder._id}
                  style={{ transform: [{ scale: 1 }] }}
                >
                  <ReminderCard
                    reminder={reminder}
                    onComplete={handleReminderAction}
                    onDelete={handleReminderAction}
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <ReminderActions 
        onAddSuccess={handleReminderAction} 
      />
    </SafeAreaView>
  );
}

const LIGHT_THEME = {
  background: '#F8FDFE',
  card: '#FFFFFF',
  primary: '#00B0C8',
  secondary: '#00D4E0',
  accent: '#00E5E0',
  text: '#2A2D32',
  secondaryText: '#75777A',
  border: '#E4F4F8',
  error: '#FF5A5A',
};

const DARK_THEME = {
  background: '#121A22',
  card: '#1E2A36',
  primary: '#00B0C8',
  secondary: '#00D4E0',
  accent: '#00E5E0',
  text: '#FFFFFF',
  secondaryText: '#A8AAAC',
  border: '#2A3A46',
  error: '#FF5A5A',
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 15,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#00B0C8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    zIndex: 10,
  },
  headerContent: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 100,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyAnimation: {
    width: 200,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#00B0C8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  remindersList: {
    marginTop: 10,
  },
  errorContainer: {
    marginTop: 40,
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#00B0C8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});