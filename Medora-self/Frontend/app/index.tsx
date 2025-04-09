import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import MaskedView from '@react-native-masked-view/masked-view';
import LottieView from 'lottie-react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import Carousel from 'react-native-reanimated-carousel';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const lottieRef = useRef<LottieView>(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    lottieRef.current?.play();
  }, []);

  interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
  }

  const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 500 }}
      style={styles.featureCard}
    >
      <View style={styles.featureCardContent}>
        <Icon name={icon} size={40} color="#2575FC" style={styles.featureIcon} />
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </MotiView>
  );

  return (
    <View style={styles.container}>
      {/* StatusBar configuration */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#00d4ff', '#090979', '#020024']}
        style={styles.container}
      >
        <Animatable.View
          animation="fadeInUp"
          style={styles.contentContainer}
        >
          <BlurView intensity={50} style={styles.blurContainer}>
            {/* Gradient Title with Masked View */}
            <MaskedView
              maskElement={
                <View style={styles.maskedContainer}>
                  <Text style={styles.maskedTitle}>Medora</Text>
                </View>
              }
            >
              <LinearGradient
                colors={['#00d4ff', '#0083b0']}
                style={styles.gradientText}
              >
                <Text style={styles.maskedTitle}>Medora</Text>
              </LinearGradient>
            </MaskedView>

            <Text style={styles.subtitle}>Your Holistic Health Companion</Text>

            {/* Lottie Animation */}
            <LottieView
              ref={lottieRef}
              source={require('../assets/doctor.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                >
                  <LinearGradient
                    colors={['#6A11CB', '#2575FC']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Login</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Link>

              <Link href="/(auth)/register" asChild>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                >
                  <LinearGradient
                    colors={['#00d4ff', '#0083b0']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Sign Up</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
            </View>
          </BlurView>
        </Animatable.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020024',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  blurContainer: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    alignItems: 'center',
  },
  maskedContainer: {
    alignItems: 'center',
  },
  maskedTitle: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  gradientText: {
    alignItems: 'center',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  lottieAnimation: {
    width: width * 0.8,
    height: 250,
  },
  carouselContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  featureCard: {
    width: width * 0.8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  featureCardContent: {
    alignItems: 'center',
  },
  featureIcon: {
    marginBottom: 10,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featureDescription: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    width: '48%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 25,
    
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
