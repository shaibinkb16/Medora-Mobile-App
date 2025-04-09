import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Alert,
  StatusBar,
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import MaskedView from '@react-native-masked-view/masked-view';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState({
    year: new Date().getFullYear() - 20,
    month: 0,
    day: 1
  });
  const [gender, setGender] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isPasswordVisible, setPasswordVisibility] = useState(false);

  // Generate arrays for picker
  const years = Array.from(
    { length: 100 }, 
    (_, i) => new Date().getFullYear() - i
  );
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleRegister = async () => {
    // Validation
    if (!name || !email || !password || !phoneNumber || !dateOfBirth || !gender) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://192.168.162.200:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber,
          dateOfBirth,
          gender,
          profileImageUrl,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Registration successful!');
        router.push('/(auth)/login');
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An error occurred during registration');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImageUrl(result.assets[0].uri);
    }
  };

  const handleDateSelection = () => {
    const selectedDate = `${tempDate.year}-${String(tempDate.month + 1).padStart(2, '0')}-${String(tempDate.day).padStart(2, '0')}`;
    setDateOfBirth(selectedDate);
    setShowDateModal(false);
  };

  const BackgroundWaves = () => (
    <Svg width={width} height={height / 2} viewBox={`0 0 ${width} ${height / 2}`}>
      <Defs>
        <SvgGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6A11CB" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#2575FC" stopOpacity="0.6" />
        </SvgGradient>
      </Defs>
      <Path
        d={`
          M0,0 
          L0,${height / 4} 
          Q${width / 2},${height / 3} ${width},${height / 4} 
          L${width},0 
          Z
        `}
        fill="url(#grad)"
      />
    </Svg>
  );

  const renderDatePickerModal = () => (
    <Modal
      transparent={true}
      visible={showDateModal}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Date of Birth</Text>
          
          <View style={styles.pickerContainer}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Year</Text>
              <ScrollView>
                {years.map((year) => (
                  <TouchableOpacity 
                    key={year} 
                    onPress={() => setTempDate(prev => ({...prev, year}))}
                    style={[
                      styles.pickerItem,
                      tempDate.year === year && styles.selectedPickerItem
                    ]}
                  >
                    <Text style={styles.pickerItemText}>{year}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Month</Text>
              <ScrollView>
                {months.map((month, index) => (
                  <TouchableOpacity 
                    key={month} 
                    onPress={() => setTempDate(prev => ({...prev, month: index}))}
                    style={[
                      styles.pickerItem,
                      tempDate.month === index && styles.selectedPickerItem
                    ]}
                  >
                    <Text style={styles.pickerItemText}>{month}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Day</Text>
              <ScrollView>
                {days.map((day) => (
                  <TouchableOpacity 
                    key={day} 
                    onPress={() => setTempDate(prev => ({...prev, day}))}
                    style={[
                      styles.pickerItem,
                      tempDate.day === day && styles.selectedPickerItem
                    ]}
                  >
                    <Text style={styles.pickerItemText}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              onPress={() => setShowDateModal(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDateSelection}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <LinearGradient
        colors={['#00d4ff', '#090979', '#020024']}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
{/*           <BackgroundWaves />
 */}          
          <Animatable.View 
            animation="fadeInUp" 
            style={styles.formContainer}
          >
            <BlurView intensity={50} style={styles.blurContainer}>
              <MaskedView
                maskElement={
                  <View style={styles.maskedContainer}>
                    <Text style={styles.maskedTitle}>Create Account</Text>
                  </View>
                }
              >
                <LinearGradient
                  colors={['#00d4ff', '#0083b0']}
                  style={styles.gradientText}
                >
                  <Text style={styles.maskedTitle}>Create Account</Text>
                </LinearGradient>
              </MaskedView>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  left={<TextInput.Icon icon="account" color="#2575FC" />}
                  mode="flat"
                  underlineColor="transparent"
                  theme={{
                    colors: {
                      text: '#ffffff',
                      placeholder: '#ffffff',
                      primary: '#ffffff'
                    }
                  }}
                />
                
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  left={<TextInput.Icon icon="email" color="#2575FC" />}
                  mode="flat"
                  underlineColor="transparent"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  theme={{
                    colors: {
                      text: '#ffffff',
                      placeholder: '#ffffff',
                      primary: '#ffffff'
                    }
                  }}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" color="#2575FC" />}
                  right={
                    <TextInput.Icon 
                      icon={isPasswordVisible ? "eye-off" : "eye"} 
                      onPress={() => setPasswordVisibility(!isPasswordVisible)}
                      color="#2575FC"
                    />
                  }
                  mode="flat"
                  underlineColor="transparent"
                  theme={{
                    colors: {
                      text: '#ffffff',
                      placeholder: '#ffffff',
                      primary: '#ffffff'
                    }
                  }}
                />

                <TextInput
                  label="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  style={styles.input}
                  left={<TextInput.Icon icon="phone" color="#2575FC" />}
                  mode="flat"
                  underlineColor="transparent"
                  keyboardType="phone-pad"
                  theme={{
                    colors: {
                      text: '#ffffff',
                      placeholder: '#ffffff',
                      primary: '#ffffff'
                    }
                  }}
                />

                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => setShowDateModal(true)}
                >
                  <View style={styles.datePickerContainer}>
                    <Icon name="calendar" size={20} color="#2575FC" style={styles.datePickerIcon} />
                    <Text style={styles.datePickerText}>
                      {dateOfBirth || 'Select Date of Birth'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TextInput
                  label="Gender"
                  value={gender}
                  onChangeText={setGender}
                  style={styles.input}
                  left={<TextInput.Icon icon="gender-male-female" color="#2575FC" />}
                  mode="flat"
                  underlineColor="transparent"
                  theme={{
                    colors: {
                      text: '#ffffff',
                      placeholder: '#ffffff',
                      primary: '#ffffff'
                    }
                  }}
                />

                <TouchableOpacity 
                  style={styles.imageUploadContainer}
                  onPress={pickImage}
                >
                  <Icon name="cloud-upload" size={24} color="#2575FC" />
                  <Text style={styles.imageUploadText}>
                    {profileImageUrl ? 'Image Selected' : 'Upload Profile Image'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.loginButton}
                  onPress={handleRegister}
                >
                  <LinearGradient
                    colors={['#6A11CB', '#2575FC']}
                    style={styles.loginButtonGradient}
                  >
                    <Text style={styles.loginButtonText}>Register</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Already have an account? </Text>
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                      <Text style={styles.registerLink}>Login</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </BlurView>
          </Animatable.View>
        </ScrollView>
      </LinearGradient>

      {renderDatePickerModal()}
      
      {/* System Navigation Background */}
    </View>
  );
}

// Include the styles from the previous comprehensive styles object
const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#00d4ff',
  },
  scrollContainer: {
    marginTop:45,
    flexGrow: 1,
    justifyContent: 'center',
  },
  systemNavBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'android' ? 50 : 34,
    backgroundColor: '#020024',
  },
  formContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  blurContainer: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
  },
  maskedContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  maskedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gradientText: {
    alignItems: 'center',
  },
  inputContainer: {
    marginTop: 20,
  },
  input: {
    marginVertical: 10,
    backgroundColor: 'transparent',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  datePickerIcon: {
    marginRight: 10,
  },
  datePickerText: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1,
  },
  imageUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#2575FC',
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: 'rgba(37, 117, 252, 0.1)',
  },
  imageUploadText: {
    color: '#ffffff',
    marginLeft: 10,
    fontSize: 16,
  },
  loginButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButtonGradient: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 25,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  registerText: {
    color: '#ffffff',
    fontSize: 14,
  },
  registerLink: {
    color: '#2575FC',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2575FC',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 200,
    width: '100%',
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2575FC',
  },
  pickerItem: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  selectedPickerItem: {
    backgroundColor: 'rgba(37, 117, 252, 0.2)',
    borderRadius: 10,
  },
  pickerItemText: {
    color: '#2575FC',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#2575FC',
    padding: 10,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Additional Utility Styles
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  inputErrorBorder: {
    borderColor: 'red',
    borderWidth: 1,
  },

  // Background Wave Styles
  backgroundWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  // Social Login Styles
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  socialButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 50,
    marginHorizontal: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Responsive Sizing
  responsiveContainer: {
    paddingHorizontal: width * 0.05,
  },
  responsiveTitle: {
    fontSize: width * 0.06,
  },
  responsiveInput: {
    height: height * 0.06,
  },
  // ... (use the full styles object from the previous response)
});