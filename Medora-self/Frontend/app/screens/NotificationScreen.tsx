import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, 
  StyleSheet, ActivityIndicator, Alert, RefreshControl, 
  Animated, SafeAreaView, StatusBar, Dimensions, Platform
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../store/authContext";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";
import { MotiView, AnimatePresence } from "moti";

const { width } = Dimensions.get("window");
const ITEM_HEIGHT = 100;

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationScreen() {
  const { token, isAuthenticated, signOut } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread'>('all');
  
  // Animation references
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const refreshAnim = useRef<LottieView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const layoutY = useRef(new Animated.Value(0)).current;

  // Filter notifications based on selected filter
  const filteredNotifications = selectedFilter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get("http://192.168.162.200:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApiError = (error: any) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      Alert.alert("Session Expired", "Please log in again.", [{ text: "OK", onPress: signOut }]);
    } else {
      Alert.alert("Error", error.response?.data?.message || "Something went wrong");
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(
        `http://192.168.162.200:5000/api/notifications/${notificationId}/read`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      handleApiError(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (notifications.length === 0) return;
      
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length === 0) {
        // Show "nothing to mark" feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
  
      const notificationIds = unreadNotifications.map(n => n._id);
  
      await axios.put(
        "http://192.168.162.200:5000/api/notifications/mark-all-read",
        { notificationIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      handleApiError(error);
    }
  };
  
  const deleteAllNotifications = async () => {
    if (notifications.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Alert.alert(
      "Clear Notifications",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(
                "http://192.168.162.200:5000/api/notifications/delete-all",
                { headers: { Authorization: `Bearer ${token}` } }
              );
  
              setNotifications([]); 
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              handleApiError(error);
            }
          }
        }
      ]
    );
  };
  
  const deleteNotification = async (notificationId: string) => {
    try {
      await axios.delete(
        `http://192.168.162.200:5000/api/notifications/${notificationId}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Animate removal
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      handleApiError(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (refreshAnim.current) {
      refreshAnim.current.play();
    }
    await fetchNotifications();
  };

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
    
    // Animate header in on mount
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [isAuthenticated, token]);

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, notificationId: string) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.2, 1],
    });

    return (
      <Animated.View style={[styles.rightAction, { transform: [{ translateX }], opacity }]}>
        <TouchableOpacity
          onPress={() => deleteNotification(notificationId)}
          style={styles.deleteButton}
        >
          <LinearGradient
            colors={['#FF6B6B', '#EE5253']}
            style={styles.deleteGradient}
          >
            <Icon name="trash-outline" size={22} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const getTimeDisplay = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 
        ? 'Just now' 
        : `${diffInHours}h ago`;
    } else {
      return notificationDate.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const NotificationItem = ({ item, index }: { item: Notification, index: number }) => {
    // Calculate animated entry delay based on index
    const entryDelay = index * 100;
    
    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: entryDelay, type: 'timing', duration: 400 }}
      >
        <Swipeable
          renderRightActions={(progress) => renderRightActions(progress, item._id)}
          overshootRight={false}
          friction={2}
        >
          <TouchableOpacity 
            style={[styles.notificationCard]}
            onPress={() => markAsRead(item._id)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={item.isRead ? ['#E3FAFC', '#E3FAFC'] : ['#0BC5EA', '#00B5D8']}
              style={[styles.readIndicator, !item.isRead && styles.unreadIndicator]}
            />
            
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={item.isRead ? ['#E3FAFC', '#C5F6FA'] : ['#66D9E8', '#15AABF']}
                style={styles.iconGradient}
              >
                <Icon 
                  name={item.isRead ? "notifications-off-outline" : "notifications-outline"} 
                  size={20} 
                  color={item.isRead ? "#0C8599" : "white"} 
                />
              </LinearGradient>
            </View>
            
            <View style={styles.textContainer}>
              <Text style={[styles.title, item.isRead && styles.readText]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.message, item.isRead && styles.readText]} numberOfLines={2}>
                {item.message}
              </Text>
              <Text style={styles.time}>{/* {getTimeDisplay(item.createdAt)} */}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => Alert.alert(item.title, item.message)}
            >
              <Icon name="ellipsis-vertical" size={16} color="#CED4DA" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Swipeable>
      </MotiView>
    );
  };

  // Create header animations
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        
        {/* Main content */}
        <View style={styles.container}>
          {/* Header */}
          <Animated.View 
            style={[
              styles.headerContainer, 
              { 
                transform: [
                  { translateY: headerTranslateY },
                  { scale: headerScale }
                ]
              }
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={[styles.headerTitle]}>Notifications</Text>
                <View style={styles.subtitleContainer}>
                  <Text style={styles.headerSubtitle}>
                    {notifications.filter(n => !n.isRead).length} unread
                  </Text>
                </View>
              </View>
              
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  onPress={markAllAsRead} 
                  style={styles.headerButton}
                >
                  <LinearGradient
                    colors={['#15AABF', '#0BC5EA']}
                    style={styles.gradientButton}
                  >
                    <Icon name="checkmark-done-outline" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={deleteAllNotifications} 
                  style={styles.headerButton}
                >
                  <LinearGradient
                    colors={['#CED4DA', '#ADB5BD']}
                    style={styles.gradientButton}
                  >
                    <Icon name="trash-outline" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Filter tabs */}
            <Animated.View style={[styles.filterContainer, { opacity: headerOpacity }]}>
              <TouchableOpacity 
                style={[styles.filterTab, selectedFilter === 'all' && styles.selectedFilter]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={[styles.filterText, selectedFilter === 'all' && styles.selectedFilterText]}>
                  All
                </Text>
                {selectedFilter === 'all' && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.filterTab, selectedFilter === 'unread' && styles.selectedFilter]}
                onPress={() => setSelectedFilter('unread')}
              >
                <Text style={[styles.filterText, selectedFilter === 'unread' && styles.selectedFilterText]}>
                  Unread
                </Text>
                {selectedFilter === 'unread' && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
          
          {/* List content */}
          {loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0BC5EA" />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : filteredNotifications.length === 0 ? (
            <AnimatePresence>
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 500 }}
                style={styles.emptyContainer}
              >
                <Icon name="notifications-off-circle-outline" size={80} color="#CED4DA" />
                <Text style={styles.emptyTitle}>No notifications</Text>
                <Text style={styles.emptyText}>
                  {selectedFilter === 'unread' 
                    ? "You've read all your notifications!"
                    : "You don't have any notifications yet"}
                </Text>
              </MotiView>
            </AnimatePresence>
          ) : (
            <Animated.FlatList
              data={filteredNotifications}
              keyExtractor={item => item._id}
              renderItem={({ item, index }) => <NotificationItem item={item} index={index} />}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#0BC5EA"
                  colors={['#0BC5EA', '#00B5D8']}
                />
              }
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
            />
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    height: 180, // Fixed height instead of animated
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#15AABF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32, // Fixed fontSize instead of animated
    color: '#212529',
    fontWeight: '700',
  },
  subtitleContainer: {
    marginTop: 4,
  },
  headerSubtitle: {
    color: '#868E96',
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  filterTab: {
    marginRight: 24,
    paddingVertical: 8,
    position: 'relative',
  },
  filterText: {
    fontSize: 15,
    color: '#868E96',
    fontWeight: '500',
  },
  selectedFilter: {},
  selectedFilterText: {
    color: '#0BC5EA',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0BC5EA',
    borderRadius: 1.5,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#15AABF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  readIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  unreadIndicator: {
    shadowColor: '#0BC5EA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#ADB5BD',
    fontWeight: '500',
  },
  readText: {
    color: '#868E96',
    fontWeight: '400',
  },
  moreButton: {
    padding: 8,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  deleteButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#868E96',
    textAlign: 'center',
    marginTop: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#868E96',
  },
  listContent: {
    paddingVertical: 12,
  },
});