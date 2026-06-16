import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  FlatList 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

// 1. Correctly Import ALL fully coded screen components
import CalculatorScreen from './CalculatorScreen';
import HistoryScreen from './HistoryScreen';
import ConverterScreen from './ConverterScreen';
import CurrencyScreen from './CurrencyScreen';
import NotesScreen from './NotesScreen';

const MODES = [
  { id: 'basic', label: 'Basic Calculator' },
  { id: 'scientific', label: 'Scientific Mode' },
  { id: 'converter', label: 'Unit Converter' },
  { id: 'currency', label: 'Currency' },
  { id: 'notes', label: 'Maths Notes' },
  { id: 'history', label: 'History' },
];

export default function MainLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentMode, setCurrentMode] = useState('basic');
  const [menuVisible, setMenuVisible] = useState(false);

  // Centralized State Engines for the core calculator
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');

  // 2. Updated Routing Switch: Connecting the real imported components
  const renderBody = () => {
    switch (currentMode) {
      case 'basic':
        return (
          <CalculatorScreen 
            isScientific={false} 
            expression={expression}
            setExpression={setExpression}
            result={result}
            setResult={setResult}
          />
        );
      case 'scientific':
        return (
          <CalculatorScreen 
            isScientific={true} 
            expression={expression}
            setExpression={setExpression}
            result={result}
            setResult={setResult}
          />
        );
      case 'converter':
        return <ConverterScreen />; // Renders the real unit converter
      case 'currency':
        return <CurrencyScreen />;   // Renders the live currency converter
      case 'notes':
        return <NotesScreen />;     // Renders the workspace scratchpad
      case 'history':
        return <HistoryScreen />;   // Renders the calculation logs
      default:
        return (
          <CalculatorScreen 
            isScientific={false} 
            expression={expression}
            setExpression={setExpression}
            result={result}
            setResult={setResult}
          />
        );
    }
  };

  const activeModeLabel = MODES.find(m => m.id === currentMode)?.label || 'Basic';

  return (
    <View style={[styles.container, { backgroundColor: theme?.background || '#000', paddingTop: insets.top }]}>
      
      {/* Header UI Menu Switcher */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.logo, { color: theme?.text || '#FFF' }]}>CalcPro</Text>
          <TouchableOpacity 
            style={[styles.dropdownButton, { backgroundColor: theme?.surface || '#1C1C1E' }]} 
            onPress={() => setMenuVisible(true)}
          >
            <Text style={[styles.dropdownText, { color: theme?.primary || '#FF9500' }]}>
              {activeModeLabel} ▼
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.menuIcon} onPress={() => setMenuVisible(true)}>
          <Text style={{ color: theme?.text || '#FFF', fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Main Dynamic Viewport */}
      <View style={styles.body}>
        {renderBody()}
      </View>

      {/* Selection Modal Sheet */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme?.surface || '#1C1C1E' }]}>
            <Text style={[styles.modalTitle, { color: theme?.text || '#FFF' }]}>Switch Mode</Text>
            
            <FlatList
              data={MODES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    currentMode === item.id && { backgroundColor: theme?.background || '#000' }
                  ]}
                  onPress={() => {
                    setCurrentMode(item.id);
                    setMenuVisible(false);
                  }}
                >
                  <Text style={[
                    styles.menuItemText, 
                    { color: currentMode === item.id ? (theme?.primary || '#FF9500') : (theme?.text || '#FFF') }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 5,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuIcon: {
    padding: 8,
  },
  body: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '82%',
    maxHeight: '55%',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 3,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
});