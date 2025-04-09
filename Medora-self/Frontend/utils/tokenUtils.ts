// utils/tokenUtils.ts
import * as SecureStore from 'expo-secure-store';

export const storeToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('authToken', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

export const getTokenFromStorage = async () => {
  try {
    return await SecureStore.getItemAsync('authToken');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

export const deleteToken = async () => {
  try {
    await SecureStore.deleteItemAsync('authToken');
  } catch (error) {
    console.error('Error deleting token:', error);
  }
};