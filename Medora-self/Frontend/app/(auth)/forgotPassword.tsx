import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import MaskedView from '@react-native-masked-view/masked-view';
import { Link, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async () => {
    // Validate email
    if (!validateEmail(email)) {
      setIsEmailValid(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      const response = await fetch('http://192.168.162.200:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Success', 
          'Password reset email sent.', 
          [{ 
            text: 'OK', 
            onPress: () => router.push('/(auth)/login') 
          }]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'An error occurred while sending the password reset email.');
    }
  };

  // Background Waves
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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      <LinearGradient
        colors={['#00d4ff', '#090979', '#020024']}
        style={styles.container}
      >
{/*         <BackgroundWaves />
 */}        
        <Animatable.View 
          animation="fadeInUp" 
          style={styles.formContainer}
        >
          <BlurView intensity={50} style={styles.blurContainer}>
            <MaskedView
              maskElement={
                <View style={styles.maskedContainer}>
                  <Text style={styles.maskedTitle}>Forgot Password</Text>
                </View>
              }
            >
              <LinearGradient
                colors={['#00d4ff', '#0083b0']}
                style={styles.gradientText}
              >
                <Text style={styles.maskedTitle}>Forgot Password</Text>
              </LinearGradient>
            </MaskedView>

            <Text style={styles.subtitle}>
              Enter your email to reset your password
            </Text>

            {/* Lottie Animation */}
            <LottieView
              source={require('../../assets/forgot-password-animation.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />

            <View style={styles.inputContainer}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setIsEmailValid(true);
                }}
                style={[
                  styles.input,
                  !isEmailValid && styles.inputError
                ]}
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
              {!isEmailValid && (
                <Text style={styles.errorText}>
                  Please enter a valid email address
                </Text>
              )}

              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handleForgotPassword();
                }}
              >
                <LinearGradient
                  colors={['#6A11CB', '#2575FC']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>Send Reset Email</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Remember your password? </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.registerLink}>Login</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </BlurView>
        </Animatable.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020024',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
  },
  maskedContainer: {
    alignItems: 'center',
  },
  maskedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  gradientText: {
    alignItems: 'center',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  lottieAnimation: {
    width: width * 0.7,
    height: 250,
    alignSelf: 'center',
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
  },
  input: {
    marginVertical: 10,
    backgroundColor: 'transparent',
  },
  inputError: {
    borderBottomColor: 'red',
    borderBottomWidth: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
  },
  loginButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
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
    marginTop: 15,
  },
  registerText: {
    color: '#ffffff',
  },
  registerLink: {
    color: '#2575FC',
    fontWeight: 'bold',
  },
});