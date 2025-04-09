import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useAuth } from '../../store/authContext';

interface Reminder {
  id: string;
  type: 'Medication' | 'Appointment' | 'Cycle';
  title: string;
  time: string;
}

interface UpcomingRemindersProps {
  reminders: Reminder[];
}

export default function UpcomingReminders({ reminders }: UpcomingRemindersProps) {
  const renderIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'Medication':
        return <Icon name="medkit-outline" size={20} color="#00bcd4" />;
      case 'Appointment':
        return <Icon name="calendar-outline" size={20} color="#ff9800" />;
      case 'Cycle':
        return <Icon name="heart-outline" size={20} color="#e91e63" />;
      default:
        return <Icon name="alert-circle-outline" size={20} color="#aaa" />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Reminders</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              {renderIcon(item.type)}
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cardTime: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
});