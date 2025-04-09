import React, { useState, useContext } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Alert,
  StatusBar
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import MaskedView from '@react-native-masked-view/masked-view';
import { Link } from 'expo-router';
import AuthContext, { AuthProvider }  from '../store/authContext';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Toast from 'react-native-toast-message';
import { useAuth } from '../store/authContext'; // Update this import\\
import { registerForPushNotificationsAsync } from '../services/notifications'; // Import push notification function


import * as AuthSession from 'expo-auth-session';

const { width, height } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisibility] = useState(false);
  const { signIn, user, token } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '960591176297-kjpvuu63b7un26rf13uqknronh95hi2l.apps.googleusercontent.com',
  });


  const handleLogin = async () => {
    try {
      await signIn(email, password); // ✅ Sign in
  
      // Get current user from auth context if needed
      const pushToken = await registerForPushNotificationsAsync(); // ✅ Get push token
  
      if (pushToken) {
        await fetch("http://192.168.162.200:5000/api/users/update-push-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ expoPushToken: pushToken }),
        });
      }
    } catch (error:any) {
      Alert.alert('Error', error.message || 'An unknown error occurred.');
    }
  };
  

  const handleGoogleSignIn = async () => {
    const result = await promptAsync();
    if (result.type === 'success') {
      Toast.show({
        type: 'success',
        text1: 'Google Sign-In Successful',
        text2: 'Welcome back!',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Google Sign-In Failed',
        text2: 'An error occurred during Google sign-in.',
      });
    }
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

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <LinearGradient
        colors={['#00d4ff', '#090979', '#020024']}
        style={styles.container}
      >
        <BackgroundWaves />
        
        <Animatable.View 
          animation="fadeInUp" 
          style={styles.formContainer}
        >
          <BlurView intensity={50} style={styles.blurContainer}>
            <MaskedView
              maskElement={
                <View style={styles.maskedContainer}>
                  <Text style={styles.maskedTitle}>Welcome Back</Text>
                </View>
              }
            >
              <LinearGradient
                colors={['#00d4ff', '#0083b0']}
                style={styles.gradientText}
              >
                <Text style={styles.maskedTitle}>Welcome Back</Text>
              </LinearGradient>
            </MaskedView>

            <View style={styles.inputContainer}>
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
  theme={{ colors: { text: 'white', placeholder: 'white', primary: 'white' } }}
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
  theme={{ colors: { text: 'white', placeholder: 'white', primary: 'white' } }}
/>

              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <LinearGradient
                  colors={['#6A11CB', '#2575FC']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.socialLoginContainer}>
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={handleGoogleSignIn}
                  disabled={!request}
                >
                  <Icon name="logo-google" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="logo-apple" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="logo-facebook" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <Link href="/(auth)/forgotPassword" asChild>
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </Link>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text style={styles.registerLink}>Register</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </BlurView>
        </Animatable.View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00d4ff',
  },
  formContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  blurContainer: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    marginBottom: 20,
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
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  socialButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 50,
    marginHorizontal: 10,
  },
  forgotPassword: {
    color: 'white',
    textAlign: 'center',
    marginTop: 15,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  registerText: {
    color: 'white',
  },
  registerLink: {
    color: '#2575FC',
    fontWeight: 'bold',
  },
});