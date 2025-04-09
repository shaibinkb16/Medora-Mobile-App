import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../store/authContext';
import axios from 'axios';

const { width } = Dimensions.get('window');

interface RecordItem {
  id: string;
  name: string;
  date: string;
  category: string;
  description?: string;
  imageUrl?: string;
}

const API_BASE_URL = 'http://192.168.162.200:5000';

const CategoryRecordsScreen = () => {
  const router = useRouter();
  const { categoryId, categoryTitle } = useLocalSearchParams<{
    categoryId: string;
    categoryTitle: string;
  }>();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredRecords, setFilteredRecords] = useState<RecordItem[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/records`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { category: categoryId }
        });

        const recordsData = response.data.map((r: any) => ({
          id: r._id,
          name: r.labName || r.description || 'Health Record',
          date: r.createdAt,
          category: r.category,
          description: r.description,
          imageUrl: r.imageUrl,
        }));

        setRecords(recordsData);
        setFilteredRecords(sortRecords(recordsData, sortBy, sortOrder));
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch records');
      } finally {
        setLoading(false);
      }
    };

    if (token && categoryId) {
      fetchRecords();
    }
  }, [token, categoryId]);

  useEffect(() => {
    const filtered = records.filter((record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(sortRecords(filtered, sortBy, sortOrder));
  }, [searchTerm, sortBy, sortOrder]);

  const sortRecords = (data: RecordItem[], sortKey: 'name' | 'date', order: 'asc' | 'desc') => {
    const sorted = [...data].sort((a, b) => {
      const valA = sortKey === 'name' ? a.name.toLowerCase() : new Date(a.date).getTime();
      const valB = sortKey === 'name' ? b.name.toLowerCase() : new Date(b.date).getTime();
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const toggleSort = (key: 'name' | 'date') => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const renderItem = ({ item, index }: { item: RecordItem; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100 }}
      style={styles.cardContainer}
    >
      <TouchableOpacity onPress={() => router.push(`/screens/Records/RecordDetail?id=${item.id}`)}>
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={item.imageUrl?.endsWith('.pdf') ? 'file-pdf-box' : 'file-document-outline'}
                size={28}
                color="#fff"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDate}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
              {item.description && (
                <Text numberOfLines={2} style={styles.cardDesc}>
                  {item.description}
                </Text>
              )}
            </View>
          </View>
          {item.imageUrl && !item.imageUrl.endsWith('.pdf') && (
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#04364A', '#00A9FF']} style={styles.loadingContainer}>
        <StatusBar backgroundColor="#04364A" barStyle="light-content" />
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#04364A" barStyle="light-content" />
      <LinearGradient colors={['#04364A', '#00A9FF']} style={styles.gradient}>
        <View style={styles.headerContainer}>
          <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{categoryTitle}                 </Text>
          </BlurView>
        </View>

        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <FontAwesome5 name="search" size={18} color="rgba(255,255,255,0.7)" />
            <TextInput
              placeholder="Search records..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <View style={styles.sortContainer}>
            <TouchableOpacity onPress={() => toggleSort('name')} style={styles.sortButton}>
              <Text style={styles.sortText}>Name {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleSort('date')} style={styles.sortButton}>
              <Text style={styles.sortText}>Date {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredRecords}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="file-search-outline" size={64} color="rgba(255,255,255,0.7)" />
                <Text style={styles.emptyText}>No records found</Text>
              </View>
            }
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#04364A' },
  gradient: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { paddingTop: StatusBar.currentHeight, paddingHorizontal: 20, paddingBottom: 20 },
  headerBlur: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.2)'
  },
  headerButton: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, paddingHorizontal: 20 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    padding: 15, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 10,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#fff' },
  sortContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 15, paddingHorizontal: 10,
  },
  sortButton: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 10 },
  sortText: { color: '#fff', fontSize: 14 },
  list: { paddingBottom: 20 },
  cardContainer: { marginBottom: 15 },
  card: { borderRadius: 20, padding: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 50, height: 50, borderRadius: 15,
    backgroundColor: 'rgba(0, 169, 255, 0.4)', justifyContent: 'center', alignItems: 'center'
  },
  textContainer: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  cardDate: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  cardDesc: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  cardImage: { width: '100%', height: 140, borderRadius: 10, marginTop: 10 },
  emptyContainer: { alignItems: 'center', paddingTop: 50 },
  emptyText: { fontSize: 18, color: 'rgba(255,255,255,0.7)', marginTop: 10 }
});

export default CategoryRecordsScreen;
