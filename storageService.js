import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@calcpro_history';

// Save a calculation record
export const saveHistory = async (expression, result) => {
  try {
    const existingHistory = await getHistory();
    
    const newEntry = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add new entry to the top and keep only the latest 50 items
    const updatedHistory = [newEntry, ...existingHistory].slice(0, 50);
    
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving history record:', error);
  }
};

// Fetch all saved history items
export const getHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};

// Clear history completely
export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error purging history database:', error);
  }
};