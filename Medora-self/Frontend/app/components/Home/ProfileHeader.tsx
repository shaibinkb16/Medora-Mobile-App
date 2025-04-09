import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../../store/notificationContext';

interface ProfileHeaderProps {
  user: {
    name?: string;
    profileImageUrl?: string;
  };
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.profileHeaderContainer}>
        {/* Profile Photo */}
        <TouchableOpacity
          style={styles.profilePhotoContainer}
          onPress={() => router.push('/(tabs)/profile')}
        >
          {user?.profileImageUrl ? (
            <Image
              source={{
                uri: user.profileImageUrl,
                cache: 'reload'
              }}
              style={styles.profilePhoto}
            />
          ) : (
            <View style={styles.profilePhotoPlaceholder}>
              <Icon name="person" size={30} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Greeting */}
        <View style={styles.userGreetingContainer}>
          <Text style={styles.userGreetingText}>Hello, {user?.name || 'User'}</Text>
          <Text style={styles.userSubGreetingText}>Your health companion</Text>
        </View>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.notificationIconContainer}
          onPress={() => router.push('/screens/NotificationScreen')}
        >
          <Icon name="notifications-outline" size={24} color="#fff" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent', // Keep gradient background showing
  },
  profileHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderRadius: 15,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  profilePhotoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2575FC',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  profilePhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(37, 117, 252, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userGreetingContainer: {
    flex: 1,
    marginLeft: 15,
  },
  userGreetingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userSubGreetingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  notificationIconContainer: {
    position: 'relative',
    padding: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4136',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});