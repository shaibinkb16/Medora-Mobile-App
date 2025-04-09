// components/Home/WelcomeHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface WelcomeHeaderProps {
  name: string;
  profileImageUrl?: string;
}

export default function WelcomeHeader({ name, profileImageUrl }: WelcomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.greetingText}>Hi {name} 👋</Text>
        <Text style={styles.subText}>You're doing great today!</Text>
      </View>
      {profileImageUrl ? (
        <Image source={{ uri: profileImageUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.placeholderAvatar}>
          <Text style={styles.initial}>{name?.[0]}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  leftSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subText: {
    fontSize: 14,
    color: '#ccc',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  placeholderAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
