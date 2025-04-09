import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../store/authContext";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import apiClient from "../apiClient";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const reminderTypes = [
  { label: "Medication", value: "medication" },
  { label: "Appointment", value: "appointment" },
  { label: "Lab Test", value: "lab" },
  { label: "Doctor Visit", value: "checkup" },
  { label: "Custom", value: "custom" },
];

export default function AddReminderScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "medication",
    remindAt: new Date(),
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const submitButtonScale = useRef(new Animated.Value(1)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;

  // References for input fields
  const messageInputRef = useRef<TextInput>(null);

  // Validate form
  useEffect(() => {
    setFormValid(form.title.trim().length > 0);
  }, [form.title]);

  // Entry animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    // Start loading spinner rotation animation
    Animated.loop(
      Animated.timing(loadingRotation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  // Button press animation
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(submitButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
      Animated.timing(submitButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleDateConfirm = (selectedDate: Date) => {
    setForm({ ...form, remindAt: selectedDate });
    hideDatePicker();
  };

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleAddReminder = async () => {
    if (!form.title.trim()) {
      Alert.alert("Error", "Please enter a reminder title");
      return;
    }

    animateButtonPress();
    setLoading(true);
    
    try {
      await apiClient.post("/reminders", {
        title: form.title,
        message: form.message || form.title,
        type: form.type,
        remindAt: form.remindAt.toISOString(),
      });

      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Alert.alert("Success", "Reminder added successfully");
        router.back();
      });
    } catch (err: any) {
      console.error("Reminder creation error:", err);
      
      // Error animation
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      Alert.alert(
        "Error",
        err.response?.data?.error || "Failed to create reminder"
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate rotation for loading spinner
  const spin = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E0F7FA' }} edges={['top']}>
      <LinearGradient
        colors={['#E0F7FA', '#B2EBF2', '#80DEEA']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View 
              style={[
                styles.container,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              <BlurView intensity={15} style={styles.blurOverlay} tint="light" />
              
              <View style={styles.header}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Icon name="arrow-back" size={24} color="#00838F" />
                </TouchableOpacity>
                
                <Text style={styles.title}>New Reminder</Text>
                
                <View style={styles.headerSpacer} />
              </View>

              <View style={styles.formContainer}>
                {/* Title Input */}
                <View style={styles.inputContainer}>
                  <Icon name="text-outline" size={20} color="#00ACC1" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Reminder Title*"
                    placeholderTextColor="rgba(0, 131, 143, 0.6)"
                    value={form.title}
                    onChangeText={(text) => handleChange("title", text)}
                    style={styles.input}
                    returnKeyType="next"
                    onSubmitEditing={() => messageInputRef.current?.focus()}
                  />
                </View>

                {/* Message Input */}
                <View style={styles.inputContainer}>
                  <Icon name="document-text-outline" size={20} color="#00ACC1" style={styles.inputIcon} />
                  <TextInput
                    ref={messageInputRef}
                    placeholder="Reminder Message (optional)"
                    placeholderTextColor="rgba(0, 131, 143, 0.6)"
                    value={form.message}
                    onChangeText={(text) => handleChange("message", text)}
                    style={styles.input}
                    multiline
                  />
                </View>

                {/* Type Picker */}
                <View style={styles.pickerContainer}>
                  <Icon name="pricetag-outline" size={20} color="#00ACC1" style={styles.inputIcon} />
                  <Picker
                    selectedValue={form.type}
                    onValueChange={(value) => handleChange("type", value)}
                    style={styles.picker}
                    dropdownIconColor="#00ACC1"
                  >
                    {reminderTypes.map((type) => (
                      <Picker.Item
                        key={type.value}
                        label={type.label}
                        value={type.value}
                      />
                    ))}
                  </Picker>
                </View>

                {/* Date & Time Selector */}
                <TouchableOpacity 
                  onPress={showDatePicker} 
                  style={styles.dateButton}
                >
                  <Icon name="calendar-outline" size={20} color="#00ACC1" style={styles.inputIcon} />
                  <View style={styles.dateContent}>
                    <Text style={styles.dateLabel}>Date & Time</Text>
                    <Text style={styles.dateText}>
                      {form.remindAt.toDateString()} at{" "}
                      {form.remindAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                  <Icon name="time-outline" size={20} color="#00ACC1" />
                </TouchableOpacity>

                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="datetime"
                  date={form.remindAt}
                  onConfirm={handleDateConfirm}
                  onCancel={hideDatePicker}
                  minimumDate={new Date()}
                  themeVariant="light"
                />

                {/* Submit Button */}
                <Animated.View style={{
                  transform: [{ scale: submitButtonScale }],
                  opacity: formValid ? 1 : 0.7,
                }}>
                  <TouchableOpacity
                    onPress={handleAddReminder}
                    style={[
                      styles.submitButton,
                      !formValid && styles.submitButtonDisabled
                    ]}
                    disabled={loading || !formValid}
                  >
                    <LinearGradient
                      colors={formValid ? ['#00BCD4', '#0097A7'] : ['#B2EBF2', '#80DEEA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitGradient}
                    >
                      {loading ? (
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                          <Icon name="refresh" size={24} color="#fff" />
                        </Animated.View>
                      ) : (
                        <>
                          <Icon name="add-circle-outline" size={20} color="#fff" />
                          <Text style={styles.submitText}>Save Reminder</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#00BCD4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 188, 212, 0.2)",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 188, 212, 0.1)",
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 20,
    color: "#00838F",
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    top: 14,
    zIndex: 1,
  },
  input: {
    backgroundColor: "rgba(178, 235, 242, 0.3)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 42,
    paddingRight: 16,
    color: "#00838F",
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "rgba(178, 235, 242, 0.3)",
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
  },
  picker: {
    flex: 1,
    color: "#00838F",
    height: 50,
    marginLeft: 20,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(178, 235, 242, 0.3)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    paddingLeft: 42,
  },
  dateContent: {
    flex: 1,
    marginRight: 10,
  },
  dateLabel: {
    color: "#00ACC1",
    fontSize: 12,
    marginBottom: 2,
  },
  dateText: {
    color: "#00838F",
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 16,
    marginTop: 10,
    shadowColor: "#00BCD4",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});