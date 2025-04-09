import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TextInput, Button, Chip, Avatar, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useAuth } from '../store/authContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
  withRepeat,
} from 'react-native-reanimated';
import { MotiView, MotiText } from 'moti';

const { width, height } = Dimensions.get('window');

export default function AdvancedProfileScreen() {
  const { token, signOut } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [showAgeAnimation, setShowAgeAnimation] = useState(false);

  // Enhanced animations
  const profileScale = useSharedValue(1);
  const profileRotate = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const cardElevation = useSharedValue(0);

  // Parallax effect for background
  const scrollY = useSharedValue(0);
  const parallaxBg = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          translateY: interpolate(
            scrollY.value, 
            [0, 200], 
            [0, -50],
            Extrapolation.CLAMP
          ) 
        }
      ],
    };
  });

  // Profile image animation
  const profileAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: profileScale.value },
        { rotateZ: `${profileRotate.value}deg` }
      ],
      shadowOpacity: interpolate(cardElevation.value, [0, 1], [0.2, 0.8]),
      shadowRadius: interpolate(cardElevation.value, [0, 1], [5, 15]),
    };
  });

  // Header animation style
  const headerAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });

  // Add loadingScale with other shared values
  const loadingScale = useSharedValue(1);
  
  // Add loadingStyle with other animated styles
  const loadingStyle = useAnimatedStyle(() => ({
    opacity: 1,
    transform: [
      {
        scale: withSequence(
          withTiming(1, { duration: 500 }),
          withRepeat(
            withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
          )
        ),
      },
    ],
  }));

  const fetchProfile = async () => {
    try {
      if (!token) {
        setError('No token available. Please log in.');
        setLoading(false);
        return;
      }
      const response = await axios.get('http://192.168.162.200:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
      setFormData(response.data);
      
      // Trigger animations once data is loaded
      headerOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
      cardElevation.value = withDelay(500, withTiming(1, { duration: 1000 }));
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Failed to load profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      // Loading animation
      profileRotate.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withTiming(0, { duration: 0 })
      );
      
      const response = await axios.put('http://192.168.162.200:5000/api/profile/update', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
      setEditMode(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Failed to update profile. Please try again later.');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFormData({ ...formData, profileImageUrl: result.assets[0].uri });
      
      // Add animation when new image is selected
      profileScale.value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 300 })
      );
    }
  };

  const calculateAge = (dateOfBirth: string | number | Date) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleLogout = () => {
    // Animate before logout
    profileScale.value = withSequence(
      withTiming(0.8, { duration: 200 }),
      withTiming(1.1, { duration: 200 }),
      withTiming(0, { duration: 300 })
    );
    
    // Delay logout to allow animation to complete
    setTimeout(() => {
      signOut();
    }, 700);
  };

  const handleAgePress = () => {
    setShowAgeAnimation(true);
    setTimeout(() => setShowAgeAnimation(false), 3000);
  };

  useEffect(() => {
    fetchProfile();
    
    // Initial animations
    profileScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withDelay(300, withSpring(1, { damping: 12 }))
    );
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.loadingContainer}>
        <Animated.View style={loadingStyle}>
          <MaterialCommunityIcons name="account-circle-outline" size={80} color="#fff" />
        </Animated.View>
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.loadingContainer}>
        <MotiView 
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <MaterialCommunityIcons name="alert-circle-outline" size={80} color="#fff" />
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={() => fetchProfile()} style={styles.retryButton}>
            Retry
          </Button>
        </MotiView>
      </LinearGradient>
    );
  }

  if (!userData) {
    return (
      <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.loadingContainer}>
        <Text style={styles.errorText}>Unable to load profile.</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.rootContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View style={[styles.backgroundContainer, parallaxBg]}>
        <LinearGradient
          colors={['#00B4DB', '#0083B0', '#005C7A']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            style={styles.backgroundPatterns}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.patternCircle,
                  {
                    top: Math.random() * height,
                    left: Math.random() * width,
                    width: 50 + Math.random() * 100,
                    height: 50 + Math.random() * 100,
                  },
                ]}
              />
            ))}
          </MotiView>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.headerContainer, headerAnimStyle]}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Chip icon="check-circle" style={styles.statusChip}>
          {userData.isVerified ? 'Verified Account' : 'Unverified'}
        </Chip>
      </Animated.View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.contentContainer}>
          <Animated.View style={[styles.profileImageContainer, profileAnimatedStyle]}>
            <TouchableOpacity
              onPress={pickImage}
              onPressIn={() => {
                profileScale.value = withTiming(0.95, { duration: 200 });
              }}
              onPressOut={() => {
                profileScale.value = withTiming(1, { duration: 200 });
              }}
              style={styles.profileImageWrapper}
            >
              {formData.profileImageUrl ? (
                <Image source={{ uri: formData.profileImageUrl }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <MaterialCommunityIcons name="account" size={70} color="#00B4DB" />
                </View>
              )}
              <View style={styles.cameraIconContainer}>
                <MaterialCommunityIcons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 800,
              delay: 300,
            }}
            style={styles.nameContainer}
          >
            <Text style={styles.name}>{userData.name}</Text>
            {userData.dateOfBirth && (
              <TouchableOpacity onPress={handleAgePress} style={styles.ageContainer}>
                {showAgeAnimation ? (
                  <MotiView
                    from={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={styles.ageAnimationContainer}
                  >
                    <Text style={styles.ageAnimationText}>
                      {calculateAge(userData.dateOfBirth)}
                    </Text>
                    <MaterialCommunityIcons name="cake-variant" size={20} color="#00B4DB" />
                  </MotiView>
                ) : (
                  <Chip icon="cake" style={styles.ageChip} textStyle={styles.ageChipText}>
                    {calculateAge(userData.dateOfBirth)} years
                  </Chip>
                )}
              </TouchableOpacity>
            )}
          </MotiView>

          <BlurView intensity={30} tint="light" style={styles.blurContainer}>
            {editMode ? (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500 }}
              >
                <Text style={styles.sectionTitle}>Edit Profile</Text>
                
                <TextInput
                  label="Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#00B4DB"
                  activeOutlineColor="#00B4DB"
                  theme={{ colors: { text: '#333', placeholder: '#888' } }}
                />
                
                <TextInput
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#00B4DB"
                  activeOutlineColor="#00B4DB"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <TextInput
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#00B4DB"
                  activeOutlineColor="#00B4DB"
                  keyboardType="phone-pad"
                />
                
                <TextInput
                  label="Date of Birth"
                  value={
                    formData.dateOfBirth
                      ? new Date(formData.dateOfBirth).toISOString().split('T')[0]
                      : ''
                  }
                  onChangeText={(text) => setFormData({ ...formData, dateOfBirth: new Date(text) })}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#00B4DB"
                  activeOutlineColor="#00B4DB"
                  placeholder="YYYY-MM-DD"
                  right={<TextInput.Icon icon="calendar" />}
                />
                
                <TextInput
                  label="Gender"
                  value={formData.gender}
                  onChangeText={(text) => setFormData({ ...formData, gender: text })}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#00B4DB"
                  activeOutlineColor="#00B4DB"
                />

                <View style={styles.buttonContainer}>
                  <Button
                    mode="contained"
                    onPress={updateProfile}
                    style={styles.saveButton}
                    contentStyle={styles.buttonContent}
                    icon="content-save"
                  >
                    Save
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => setEditMode(false)}
                    style={styles.cancelButton}
                    contentStyle={styles.buttonContent}
                    icon="close"
                  >
                    Cancel
                  </Button>
                </View>
              </MotiView>
            ) : (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'timing',
                  duration: 800,
                  delay: 400,
                }}
              >
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <View style={styles.infoContainer}>
                  <View style={styles.infoCardContainer}>
                    <MotiView
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: 500, type: 'timing' }}
                      style={styles.infoCard}
                    >
                      <View style={styles.infoIconContainer}>
                        <MaterialCommunityIcons name="email-outline" size={24} color="#00B4DB" />
                      </View>
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoText}>{userData.email}</Text>
                      </View>
                    </MotiView>

                    <MotiView
                      from={{ opacity: 0, translateX: 20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: 600, type: 'timing' }}
                      style={styles.infoCard}
                    >
                      <View style={styles.infoIconContainer}>
                        <MaterialCommunityIcons name="phone-outline" size={24} color="#00B4DB" />
                      </View>
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoText}>{userData.phoneNumber || 'Not provided'}</Text>
                      </View>
                    </MotiView>
                  </View>

                  <View style={styles.infoCardContainer}>
                    <MotiView
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: 700, type: 'timing' }}
                      style={styles.infoCard}
                    >
                      <View style={styles.infoIconContainer}>
                        <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#00B4DB" />
                      </View>
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Birth Date</Text>
                        <Text style={styles.infoText}>
                          {userData.dateOfBirth
                            ? new Date(userData.dateOfBirth).toDateString()
                            : 'Not provided'}
                        </Text>
                      </View>
                    </MotiView>

                    <MotiView
                      from={{ opacity: 0, translateX: 20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: 800, type: 'timing' }}
                      style={styles.infoCard}
                    >
                      <View style={styles.infoIconContainer}>
                        <MaterialCommunityIcons name="gender-male-female" size={24} color="#00B4DB" />
                      </View>
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Gender</Text>
                        <Text style={styles.infoText}>{userData.gender || 'Not specified'}</Text>
                      </View>
                    </MotiView>
                  </View>
                </View>

                <Divider style={styles.divider} />

                <Text style={styles.sectionTitle}>Account Information</Text>

                <View style={styles.accountInfoContainer}>
                  <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 900, type: 'timing' }}
                    style={styles.accountInfoCard}
                  >
                    <View style={styles.accountInfoItem}>
                      <MaterialCommunityIcons name="calendar-clock" size={22} color="#00B4DB" />
                      <Text style={styles.accountInfoText}>
                        Created: {new Date(userData.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Text>
                    </View>
                    
                    <View style={styles.accountInfoItem}>
                      <MaterialCommunityIcons 
                        name={userData.isVerified ? "check-decagram" : "alert-decagram"} 
                        size={22} 
                        color={userData.isVerified ? "#00B4DB" : "#ff9800"} 
                      />
                      <Text style={styles.accountInfoText}>
                        Status: <Text style={userData.isVerified ? styles.verifiedText : styles.unverifiedText}>
                          {userData.isVerified ? 'Verified Account' : 'Verification Pending'}
                        </Text>
                      </Text>
                    </View>
                  </MotiView>
                </View>

                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 1000, type: 'timing' }}
                >
                  <Button 
                    mode="contained" 
                    onPress={() => setEditMode(true)} 
                    style={styles.editButton}
                    contentStyle={styles.editButtonContent}
                    icon="account-edit"
                  >
                    Edit Profile
                  </Button>
                </MotiView>
              </MotiView>
            )}
          </BlurView>
          
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 1100, type: 'timing' }}
            style={styles.logoutContainer}
          >
            <Button
              mode="contained"
              onPress={handleLogout}
              style={styles.logoutButton}
              labelStyle={styles.logoutButtonText}
              icon={({ size, color }) => (
                <MaterialCommunityIcons name="logout" size={size} color={color} />
              )}
            >
              Logout
            </Button>
          </MotiView>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: height * 0.6,
  },
  backgroundGradient: {
    width: '100%',
    height: '100%',
  },
  backgroundPatterns: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContainer: {
    paddingTop: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 80,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 40,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#fff',
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#00B4DB',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  ageContainer: {
    marginTop: 5,
  },
  ageChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  ageChipText: {
    color: '#00B4DB',
    fontWeight: 'bold',
  },
  ageAnimationContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  ageAnimationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B4DB',
    marginRight: 6,
  },
  blurContainer: {
    width: width - 32,
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B4DB',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
  },
  infoCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 180, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 180, 219, 0.2)',
    marginVertical: 24,
    width: '100%',
  },
  accountInfoContainer: {
    marginBottom: 24,
  },
  accountInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  accountInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  accountInfoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  verifiedText: {
    color: '#00B4DB',
    fontWeight: 'bold',
  },
  unverifiedText: {
    color: '#ff9800',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#00B4DB',
  },
  cancelButton: {
    flex: 1,
    borderColor: '#00B4DB',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  editButton: {
    backgroundColor: '#00B4DB',
    borderRadius: 30,
  },
  editButtonContent: {
    paddingVertical: 8,
  },
  logoutContainer: {
    marginTop: 16,
    width: width - 32,
  },
  logoutButton: {
    backgroundColor: '#ff5a5f',
    borderRadius: 30,
    marginBottom:70,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#fff',
    borderWidth: 1,
  }
});