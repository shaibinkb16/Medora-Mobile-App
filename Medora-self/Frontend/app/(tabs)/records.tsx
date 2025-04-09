import React, { useEffect, useState } from 'react';
import {
View,
StyleSheet,
StatusBar,
SafeAreaView,
Alert,
ActivityIndicator,
FlatList,
Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useAuth } from '../store/authContext';
import RecordsHeader from '../components/Records/RecordsHeader';
import RecordCategoriesGrid from '../components/Records/RecordCategoriesGrid';
import AddRecordButton from '../components/Records/AddRecordButton';
import QuickAccessTiles from '../components/Records/QuickAccessTiles';
import RecentRecordsList, { RecordItem } from '../components/Records/RecentRecordsList';

const API_BASE_URL = 'http://192.168.162.200:5000'; // ✅ Use your IP and port here

const RecordsScreen = () => {
const router = useRouter();
const { isAuthenticated, isLoading, token, signOut } = useAuth();
const [categoryCounts, setCategoryCounts] = useState({
labReports: 0,
prescription: 0,
doctorNotes: 0,
imaging: 0,
medicalExpense: 0,
});
const [recentRecords, setRecentRecords] = useState<RecordItem[]>([]);
const [recordsLoading, setRecordsLoading] = useState(true);

const getCategoryMapping = (gridId: string) => {
switch(gridId) {
case 'labReports': return 'lab report';
case 'doctorNotes': return 'doctor note';
case 'medicalExpense': return 'medical expense';
default: return gridId.toLowerCase();
}
};

useEffect(() => {
if (!isLoading && !isAuthenticated) {
router.replace('/(auth)/login');
}
}, [isAuthenticated, isLoading]);

const fetchRecords = async () => {
if (!token) return;
try {
  setRecordsLoading(true);
  const response = await axios.get(`${API_BASE_URL}/api/records`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const records = response.data;

  const counts = {
    labReports: records.filter((r: any) => r.category?.toLowerCase() === 'lab report').length,
    prescription: records.filter((r: any) => r.category?.toLowerCase() === 'prescription').length,
    doctorNotes: records.filter((r: any) => r.category?.toLowerCase() === 'doctor note').length,
    imaging: records.filter((r: any) => r.category?.toLowerCase() === 'imaging').length,
    medicalExpense: records.filter((r: any) => r.category?.toLowerCase() === 'medical expense').length,
  };

  setCategoryCounts(counts);

  const formattedRecords: RecordItem[] = records
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((r: any) => ({
      id: r._id,
      title: r.labName || r.description || 'Health Record',
      type: r.category,
      date: new Date(r.createdAt).toLocaleDateString(),
      imageUrl: r.imageUrl,
      doctor: r.doctor, // Include doctor in the record item
    }));

  setRecentRecords(formattedRecords);
} catch (error: any) {
  console.error('Error fetching records:', error);

  if (error.response?.status === 401) {
    Alert.alert('Session Expired', 'Please login again');
    signOut();
  } else {
    Alert.alert('Error', 'Failed to load records. Please try again.');
  }
} finally {
  setRecordsLoading(false);
}
};

useEffect(() => {
if (isAuthenticated && token) {
fetchRecords();
}
}, [isAuthenticated, token]);

const ListHeader = () => (
<View style={styles.headerContainer}>
<RecordsHeader />
<RecordCategoriesGrid
counts={categoryCounts}
onCategoryPress={(id) => {
const backendCategory = getCategoryMapping(id);
router.push({
pathname: '/components/Records/CategoryRecordsScreen',
params: {
categoryId: backendCategory,
categoryTitle: id // Use the id or map it to a title if needed
},
});
}}
/>
<AddRecordButton onPress={() => router.push('/screens/Records/AddRecordForm')} />
<QuickAccessTiles
onPatientHistoryPress={() => router.push('/screens/Records/PatientHistory')}
onEmergencyRecordsPress={() => router.push('/screens/Records/EmergencyRecords')}
/>
<Text style={styles.recentRecordsTitle}>Recent Records</Text>
</View>
);

const renderItem = ({ item }: { item: RecordItem }) => (
<RecentRecordsList
records={[item]}
onRecordPress={(record) => router.push(`/screens/Records/RecordDetail?id=${record.id}`)}
/>
);

if (isLoading) {
return (
<LinearGradient colors={['#00d4ff', '#090979', '#020024']} style={styles.gradientBackground}>
<ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />
</LinearGradient>
);
}

return (
<LinearGradient colors={['#00d4ff', '#090979', '#020024']} style={styles.gradientBackground}>
<SafeAreaView style={styles.safeArea}>
<StatusBar barStyle="light-content" />
<FlatList
data={recentRecords}
ListHeaderComponent={ListHeader}
renderItem={renderItem}
keyExtractor={item => item.id}
contentContainerStyle={styles.scrollContainer}
refreshing={recordsLoading}
onRefresh={fetchRecords}
/>
</SafeAreaView>
</LinearGradient>
);
};

const styles = StyleSheet.create({
gradientBackground: {
flex: 1,
},
safeArea: {
flex: 1,
},
scrollContainer: {

paddingBottom: 40,
},
headerContainer: {
padding: 16,
},
recentRecordsTitle: {
fontSize: 18,
fontWeight: 'bold',
color: '#fff',
marginTop: 20,
marginBottom: 10,
},
});

export default RecordsScreen