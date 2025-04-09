// tabs/scanner.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { FontAwesome5 } from '@expo/vector-icons';

const categories = [
  { label: 'Lab Reports', value: 'Lab Report', icon: 'heart', color: '#D9FDE8', iconColor: '#00C292' },
  { label: 'Doctor Notes', value: 'Doctor Note', icon: 'notes-medical', color: '#FEF9D7', iconColor: '#FFD700' },
  { label: 'Imaging', value: 'Imaging', icon: 'x-ray', color: '#DFF6FF', iconColor: '#00BFFF' },
  { label: 'Prescriptions', value: 'Prescription', icon: 'prescription-bottle-alt', color: '#FFF8E7', iconColor: '#FF8C00' },
  { label: 'Medical Expenses', value: 'Medical Expense', icon: 'wallet', color: '#FAEAFD', iconColor: '#9932CC' },
];

const ScannerScreen = () => {
  const router = useRouter();

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: '/screens/RecordUploadForm',
      params: { preSelectedCategory: category },
    });
  };

  const renderCard = ({ item, index }: any) => (
    <MotiView
      from={{ opacity: 0, translateY: 40 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100, type: 'timing', duration: 500 }}
      style={{
        flex: 1,
        margin: 8,
        backgroundColor: item.color,
        borderRadius: 18,
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      }}
    >
      <TouchableOpacity onPress={() => handleCategoryPress(item.value)} style={{ alignItems: 'center' }}>
        <FontAwesome5 name={item.icon} size={28} color={item.iconColor} />
        <Text style={{ marginTop: 10, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
          {item.label}
        </Text>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <LinearGradient
      colors={['#00d4ff', '#090979', '#020024']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight || 40 }}>
        <Text style={{
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 20,
        }}>
          Select Record Category
        </Text>

        <FlatList
          data={categories}
          renderItem={renderCard}
          numColumns={2}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ScannerScreen;
