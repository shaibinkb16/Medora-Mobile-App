import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const RecordsHeader = () => {
  return (
    <View style={styles.container}>
      {/* Health Symbol */}
      <MaterialIcons name="medical-services" size={30} color="#fff" />

      {/* Title */}
      <Text style={styles.title}>Health Records</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: 'transparent', // Transparent background
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default RecordsHeader;
