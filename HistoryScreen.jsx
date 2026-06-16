import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getHistory, clearHistory } from '../services/storageService';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    loadHistoryRecords();
  }, []);

  const loadHistoryRecords = async () => {
    const records = await getHistory();
    setHistoryItems(records);
  };

  const handleClearAll = async () => {
    await clearHistory();
    setHistoryItems([]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.historyCard, { borderBottomColor: theme?.surface || '#2C2C2E' }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <Text style={[styles.expressionText, { color: theme?.text || '#FFF' }]}>
        {item.expression}
      </Text>
      <Text style={[styles.resultText, { color: theme?.primary || '#FF9500' }]}>
        = {item.result}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme?.background || '#000' }]}>
      {historyItems.length > 0 ? (
        <>
          <FlatList
            data={historyItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
          
          <TouchableOpacity 
            style={[styles.clearButton, { backgroundColor: theme?.surface || '#1C1C1E' }]}
            onPress={handleClearAll}
          >
            <Text style={[styles.clearButtonText, { color: '#FF3B30' }]}>
              Clear All History
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme?.text ? `${theme.text}80` : '#8E8E93' }]}>
            No history logs found
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  historyCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  expressionText: {
    fontSize: 18,
    textAlign: 'right',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'right',
  },
  clearButton: {
    margin: 20,
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
});