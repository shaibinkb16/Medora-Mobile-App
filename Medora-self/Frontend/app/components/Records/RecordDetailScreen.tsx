import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const RecordDetailScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const scrollY = new Animated.Value(0);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
        style={styles.gradient}
      >
        {/* Animated Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <BlurView intensity={100} style={styles.blurHeader}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{params.title}</Text>
            <TouchableOpacity>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={styles.container}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Hero Section */}
          <Animatable.View 
            animation="fadeIn" 
            duration={1000} 
            style={styles.heroSection}
          >
            {params.imageUrl && !(params.imageUrl as string).endsWith('.pdf') && (
              <Image
                source={{ uri: params.imageUrl as string }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            )}
          </Animatable.View>

          {/* Content Card */}
          <Animatable.View 
            animation="slideUpBig" 
            duration={800} 
            style={styles.contentCard}
          >
            <Text style={styles.title}>{params.title}</Text>

            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.date}>
                  {new Date(params.date as string).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="bookmark-outline" size={20} color="#666" />
                <Text style={styles.category}>{params.category}</Text>
              </View>
            </View>

            {/* Tags */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
              {['Featured', 'New', 'Trending'].map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </ScrollView>

            {params.description && (
              <Animatable.Text 
                animation="fadeIn" 
                delay={500} 
                style={styles.description}
              >
                {params.description}
              </Animatable.Text>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="heart-outline" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="bookmark-outline" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </Animated.ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    paddingBottom: 40,
  },
  heroSection: {
    height: 400,
    width: width,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  contentCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 20,
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  date: {
    fontSize: 14,
    color: '#ccc',
  },
  category: {
    fontSize: 14,
    color: '#ccc',
    textTransform: 'capitalize',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#eee',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 25,
    width: 120,
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default RecordDetailScreen;