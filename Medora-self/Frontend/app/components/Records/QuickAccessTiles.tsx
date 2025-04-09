import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onPatientHistoryPress: () => void;
  onEmergencyRecordsPress: () => void;
}

const QuickAccessTiles: React.FC<Props> = ({ onPatientHistoryPress, onEmergencyRecordsPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.tile, { backgroundColor: '#ede7f6' }]} onPress={onPatientHistoryPress}>
        <Ionicons name="time-outline" size={22} color="#7e57c2" />
        <Text style={styles.tileText}>Patient Health{"\n"}History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.tile, { backgroundColor: '#e3f2fd' }]} onPress={onEmergencyRecordsPress}>
        <Ionicons name="alert-circle-outline" size={22} color="#039be5" />
        <Text style={styles.tileText}>Emergency Health{"\n"}Records</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  tile: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#999',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
  },
  tileText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    color: '#333',
  },
});

export default QuickAccessTiles;