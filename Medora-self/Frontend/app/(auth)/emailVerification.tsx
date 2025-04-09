import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import MaskedView from '@react-native-masked-view/masked-view';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function EmailVerificationSuccessScreen() {


  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={['#00d4ff', '#090979', '#020024']}
        style={[
          styles.gradient,
          Platform.OS === 'web' ? { minHeight: Dimensions.get('window').height } : {},
        ]}
      >
        <Animatable.View animation="fadeInUp" style={styles.contentWrapper}>
          <BlurView intensity={50} style={styles.blurBox} tint="light">
            <View style={styles.innerContent}>
              <MaskedView
                maskElement={
                  <View style={styles.maskedContainer}>
                    <Text style={styles.maskedTitle}>Email Verified</Text>
                  </View>
                }
              >
                <LinearGradient
                  colors={['#00d4ff', '#0083b0']}
                  style={styles.gradientText}
                >
                  <Text style={styles.maskedTitle}>Email Verified</Text>
                </LinearGradient>
              </MaskedView>

              <Text style={styles.subtitle}>
                Your email has been successfully verified
              </Text>

              <LottieView
                source={require('../../assets/email-verification-success.json')}
                autoPlay
                loop={false}
                style={styles.lottieAnimation}
              />

              <View style={styles.successMessageContainer}>
                <Icon name="checkmark-circle" size={60} color="#2575FC" />
                <Text style={styles.successMessage}>
                  Congratulations! Your account is now active.
                </Text>
                <Text style={styles.additionalInfo}>
                  You can now log in and start your wellness journey with Medora.
                </Text>
              </View>

            </View>
          </BlurView>
        </Animatable.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '1%',
    flex: 1,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 20,
    height : '70%',
    overflow: 'hidden',
  },
  blurBox: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: '100%',
  },
  innerContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
  },
  maskedContainer: {
    alignItems: 'center',
  },
  maskedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  gradientText: {
    alignItems: 'center',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  lottieAnimation: {
    width: width * 0.6,
    height: 180,
  },
  successMessageContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  successMessage: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  additionalInfo: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  continueButton: {
    width: '100%',
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
