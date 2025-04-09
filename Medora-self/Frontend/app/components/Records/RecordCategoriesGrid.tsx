import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface RecordCounts {
  labReports: number;
  prescription: number;
  doctorNotes: number;
  imaging: number;
  medicalExpense: number;
}

interface RecordCategory {
  id: string;
  title: string;
  count: number;
  icon: JSX.Element;
  color: string;
}

interface Props {
  counts: RecordCounts;
  onCategoryPress?: (id: string) => void;
}

const RecordCategoriesGrid: React.FC<Props> = ({ counts, onCategoryPress }) => {
  const categories: RecordCategory[] = [
    {
      id: 'labReports',
      title: 'Lab Reports',
      count: counts.labReports,
      icon: <Ionicons name="heart-outline" size={20} color="#00c896" />,
      color: '#00c896',
    },
    {
      id: 'prescription',
      title: 'Prescription',
      count: counts.prescription,
      icon: <MaterialCommunityIcons name="prescription" size={20} color="#f5a623" />,
      color: '#f5a623',
    },
    {
      id: 'doctorNotes',
      title: 'Doctor Notes',
      count: counts.doctorNotes,
      icon: <Ionicons name="document-text-outline" size={20} color="#fcd303" />,
      color: '#fcd303',
    },
    {
      id: 'imaging',
      title: 'Imaging',
      count: counts.imaging,
      icon: <Ionicons name="images-outline" size={20} color="#4fc3f7" />,
      color: '#4fc3f7',
    },
    {
      id: 'medicalExpense',
      title: 'Medical Expense',
      count: counts.medicalExpense,
      icon: <MaterialCommunityIcons name="cash-multiple" size={20} color="#ec407a" />,
      color: '#ec407a',
    },
  ];

  const renderItem = ({ item }: { item: RecordCategory }) => (
    <TouchableOpacity
      style={styles.categoryBox}
      onPress={() => onCategoryPress?.(item.id)}
      activeOpacity={0.8}
    >
      <Text style={[styles.count, { color: item.color }]}>{item.count}</Text>
      <View style={styles.icon}>{item.icon}</View>
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={categories}
      numColumns={3}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '30%',
    alignItems: 'center',
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#aaa',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  count: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  icon: {
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});

export default RecordCategoriesGrid;