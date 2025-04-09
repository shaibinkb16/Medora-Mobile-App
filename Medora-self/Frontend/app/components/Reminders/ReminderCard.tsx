import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  PanResponder,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import apiClient from "../../apiClient";
import { BlurView } from "expo-blur";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4; // Swipe threshold for delete action

interface Reminder {
  _id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  isCompleted?: boolean;
}

interface ReminderCardProps {
  reminder: Reminder;
  onComplete?: () => Promise<void>;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  index?: number;
}

export default function ReminderCard({
  reminder,
  onComplete,
  onEdit,
  onDelete,
  index = 0,
}: ReminderCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Animation values
  const translateY = useState(new Animated.Value(50))[0];
  const opacity = useState(new Animated.Value(0))[0];
  const scale = useState(new Animated.Value(0.95))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];
  const expandAnim = useState(new Animated.Value(0))[0];
  
  // Swipe animation values
  const pan = useRef(new Animated.ValueXY()).current;
  const swipeOpacity = useRef(new Animated.Value(1)).current;

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow left swipe (negative dx)
        if (gestureState.dx < 0) {
          pan.setValue({ x: gestureState.dx, y: 0 });
          swipeOpacity.setValue(1 - Math.abs(gestureState.dx / SWIPE_THRESHOLD));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swiped enough to trigger delete
          Animated.parallel([
            Animated.timing(pan, {
              toValue: { x: -SCREEN_WIDTH, y: 0 },
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(swipeOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => handleDelete());
        } else {
          // Return to original position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
          Animated.spring(swipeOpacity, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Entry animation
  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.7)),
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.7)),
        }),
      ]),
    ]).start();
  }, []);

  // Expand animation
  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease),
    }).start();
  }, [expanded]);

  // Handle card actions with animations
  const handleComplete = async () => {
    if (!reminder._id) return;
    
    // Rotate animation for completion
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
    
    try {
      setIsCompleting(true);
      await apiClient.put(`/reminders/${reminder._id}`, {
        ...reminder,
        isCompleted: true,
      });
      if (onComplete) await onComplete();
    } catch (error) {
      console.error("Error completing reminder:", JSON.stringify(error));
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!reminder._id) return;
    
    try {
      setIsDeleting(true);
      await apiClient.delete(`/reminders/${reminder._id}`);
      if (onDelete) await onDelete();
    } catch (error) {
      console.error("Error deleting reminder:", JSON.stringify(error));
      // Reset position if delete fails
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        friction: 5,
        useNativeDriver: true,
      }).start();
      Animated.spring(swipeOpacity, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 5,
              useNativeDriver: true,
            }).start();
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Animated.parallel([
              Animated.timing(pan, {
                toValue: { x: -SCREEN_WIDTH, y: 0 },
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(swipeOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(() => handleDelete());
          },
        },
      ]
    );
  };

  // Dynamic content height based on expanded state
  const contentHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120]
  });

  // Icon rotation on expand
  const iconRotation = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Card completion rotation animation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Calculate progress to due date
  const calculateProgress = () => {
    // Simple implementation - can be enhanced with actual date calculations
    return reminder.isCompleted ? 100 : 60;
  };

  const progressValue = calculateProgress();

  // Get appropriate icon for reminder type
  const getReminderIcon = () => {
    switch (reminder.type.toLowerCase()) {
      case 'meeting': return 'people-outline';
      case 'task': return 'checkbox-outline';
      case 'birthday': return 'gift-outline';
      case 'appointment': return 'calendar-outline';
      default: return 'alarm-outline';
    }
  };

  // Get color based on completion status and type
  const getTypeColor = () => {
    if (reminder.isCompleted) return '#4CAF50';
    
    switch (reminder.type.toLowerCase()) {
      case 'meeting': return '#00BCD4';
      case 'task': return '#00ACC1';
      case 'birthday': return '#26C6DA';
      case 'appointment': return '#00838F';
      default: return '#00BCD4';
    }
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Delete background that appears during swipe */}
      <View style={styles.deleteBackground}>
        <Icon name="trash-outline" size={24} color="#fff" />
        <Text style={styles.deleteText}>Delete</Text>
      </View>
      
      {/* Main card with swipe gesture */}
      <Animated.View
        style={[
          styles.container,
          {
            opacity: Animated.multiply(opacity, swipeOpacity),
            transform: [
              { translateY },
              { scale },
              { rotate: spin },
              { translateX: pan.x },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={reminder.isCompleted ? ['#e0f7fa', '#b2ebf2'] : ['#e0f7fa', '#80DEEA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <BlurView intensity={10} style={styles.blurOverlay} tint="light" />
          
          {/* Progress circle */}
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <View style={[styles.progressFill, { width: `${progressValue}%` }]} />
              <View style={styles.iconContainer}>
                <Icon
                  name={getReminderIcon()}
                  size={24}
                  color={getTypeColor()}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            {/* Header with title */}
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.cardTitle,
                  reminder.isCompleted && styles.completedText,
                ]}
                numberOfLines={expanded ? undefined : 1}
              >
                {reminder.title}
              </Text>
              
              <View style={styles.headerActions}>
                {onEdit && (
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={onEdit}
                  >
                    <Icon name="create-outline" size={20} color="#00838F" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.expandButton}
                  onPress={() => setExpanded(!expanded)}
                >
                  <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
                    <Icon name="chevron-down" size={20} color="#00838F" />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Status badge */}
            <View style={styles.statusRow}>
              <View 
                style={[
                  styles.statusBadge, 
                  { backgroundColor: reminder.isCompleted ? '#e0f2f1' : '#e0f7fa' }
                ]}
              >
                <Icon 
                  name={reminder.isCompleted ? "checkmark-circle" : "time-outline"} 
                  size={14} 
                  color={reminder.isCompleted ? "#4CAF50" : "#00ACC1"} 
                />
                <Text style={styles.statusText}>
                  {reminder.isCompleted ? "Completed" : "Pending"}
                </Text>
              </View>
              
              <Text style={styles.timeText}>
                {reminder.time}
              </Text>
            </View>
            
            {/* Expandable details section */}
            <Animated.View style={[styles.detailsContainer, { height: contentHeight }]}>
              <View style={styles.detailsContent}>
                <View style={styles.detailRow}>
                  <Icon name="pricetag-outline" size={16} color="#00838F" />
                  <Text style={styles.detailText}>
                    {reminder.type}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Icon name="calendar-outline" size={16} color="#00838F" />
                  <Text style={styles.detailText}>
                    {reminder.date}
                  </Text>
                </View>
                
                <View style={styles.noteRow}>
                  <Text style={styles.noteText}>
                    Added on {new Date().toLocaleDateString()}
                  </Text>
                </View>
                
                {/* Action buttons */}
                <View style={styles.actionsContainer}>
                  {!reminder.isCompleted && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={handleComplete}
                      disabled={isCompleting}
                    >
                      {isCompleting ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Icon name="checkmark" size={18} color="#fff" />
                          <Text style={styles.actionButtonText}>Complete</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={confirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Icon name="trash-outline" size={18} color="#fff" />
                        <Text style={styles.actionButtonText}>Delete</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    position: 'relative',
    marginVertical: 12,
    marginHorizontal: 16,
    overflow: 'visible',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#E91E63',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 30,
    flexDirection: 'row',
    gap: 8,
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    borderRadius: 20,
    shadowColor: "#00BCD4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  gradientBackground: {
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#00838F",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#4CAF50",
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 4,
    backgroundColor: "rgba(0, 188, 212, 0.1)",
  },
  expandButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 188, 212, 0.1)",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#e0f7fa",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00838F",
    marginLeft: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00838F",
  },
  progressContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: "flex-end",
    zIndex: 1,
  },
  progressCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.8)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#B2EBF2",
  },
  progressFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "100%",
    backgroundColor: "rgba(178, 235, 242, 0.3)",
  },
  iconContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    overflow: "hidden",
  },
  detailsContent: {
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#00838F",
  },
  noteRow: {
    marginTop: 4,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#0097A7",
    opacity: 0.7,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  completeButton: {
    backgroundColor: "#00BCD4",
  },
  deleteButton: {
    backgroundColor: "#E91E63",
  },
  actionButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
  },
});