import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';

interface EmergencyAccessCardProps {
  bloodType: string;
  allergies: string[];
  medications: string[];
  chronicConditions: string[];
  qrCodeUrl: string;
}


const EmergencyAccessCard = ({
  bloodType,
  allergies,
  medications,
  chronicConditions,
  qrCodeUrl,
}: EmergencyAccessCardProps) => {
  return (
    <Animatable.View animation="fadeInUp" duration={600} style={styles.card}>
      <View style={styles.header}>
        <Icon name="medkit" size={28} color="#FF3D00" />
        <Text style={styles.title}>Emergency Data</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Blood Type:</Text>
        <Text style={styles.value}>{bloodType}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Allergies:</Text>
        <Text style={styles.value}>{allergies.join(', ') || 'None'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Medications:</Text>
        <Text style={styles.value}>{medications.join(', ') || 'None'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Chronic Conditions:</Text>
        <Text style={styles.value}>{chronicConditions.join(', ') || 'None'}</Text>
      </View>

      <View style={styles.qrContainer}>
        <Text style={styles.qrText}>Scan QR for quick access</Text>
        <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3D00',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  row: {
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  value: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  qrContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  qrText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 6,
  },
  qrImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3D00',
  },
});

export default EmergencyAccessCard;
