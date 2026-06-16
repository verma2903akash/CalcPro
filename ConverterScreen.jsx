import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Conversion conversion ratios and formulas
const CONVERSIONS = {
  Length: {
    units: ['Meter (m)', 'Kilometer (km)', 'Mile (mi)', 'Foot (ft)', 'Inch (in)'],
    base: 'Meter (m)',
    rates: {
      'Meter (m)': 1,
      'Kilometer (km)': 0.001,
      'Mile (mi)': 0.000621371,
      'Foot (ft)': 3.28084,
      'Inch (in)': 39.3701,
    }
  },
  Weight: {
    units: ['Kilogram (kg)', 'Gram (g)', 'Pound (lb)', 'Ounce (oz)'],
    base: 'Kilogram (kg)',
    rates: {
      'Kilogram (kg)': 1,
      'Gram (g)': 1000,
      'Pound (lb)': 2.20462,
      'Ounce (oz)': 35.274,
    }
  },
  Temperature: {
    units: ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)'],
    // Temperature uses functions instead of multiplier rates because it scales non-linearly
    isSpecial: true, 
    convert: (value, from, to) => {
      let c = value;
      if (from === 'Fahrenheit (°F)') c = (value - 32) * 5 / 9;
      if (from === 'Kelvin (K)') c = value - 273.15;

      if (to === 'Celsius (°C)') return c;
      if (to === 'Fahrenheit (°F)') return (c * 9 / 5) + 32;
      if (to === 'Kelvin (K)') return c + 273.15;
      return value;
    }
  }
};

export default function ConverterScreen() {
  const { theme } = useTheme();
  const categories = Object.keys(CONVERSIONS);
  
  const [activeCategory, setActiveCategory] = useState('Length');
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState(CONVERSIONS['Length'].units[0]);
  const [toUnit, setToUnit] = useState(CONVERSIONS['Length'].units[1]);
  const [result, setResult] = useState('');

  // Automatically reset default units when category tabs swap
  useEffect(() => {
    const config = CONVERSIONS[activeCategory];
    setFromUnit(config.units[0]);
    setToUnit(config.units[1]);
  }, [activeCategory]);

  // Real-time conversion engine
  useEffect(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setResult('');
      return;
    }

    const config = CONVERSIONS[activeCategory];

    if (config.isSpecial) {
      const convertedValue = config.convert(num, fromUnit, toUnit);
      setResult(String(Number(convertedValue.toFixed(4))));
    } else {
      // Standardize back through base unit, then convert outward to target unit
      const baseValue = num / config.rates[fromUnit];
      const convertedValue = baseValue * config.rates[toUnit];
      setResult(String(Number(convertedValue.toFixed(6))));
    }
  }, [inputValue, fromUnit, toUnit, activeCategory]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme?.background || '#000' }]}>
      
      {/* Category Selection Tabs */}
      <View style={styles.tabBar}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.tabButton,
              activeCategory === cat && { backgroundColor: theme?.surface || '#1C1C1E' }
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[
              styles.tabText, 
              { color: activeCategory === cat ? (theme?.primary || '#FF9500') : '#8E8E93' }
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input Group ("From" Side) */}
      <View style={[styles.card, { backgroundColor: theme?.surface || '#1C1C1E' }]}>
        <Text style={styles.cardLabel}>From</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { color: theme?.text || '#FFF' }]}
            keyboardType="numeric"
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="0"
            placeholderTextColor="#555"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelectorContainer}>
            {CONVERSIONS[activeCategory].units.map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[styles.unitBadge, fromUnit === unit && styles.activeBadge]}
                onPress={() => setFromUnit(unit)}
              >
                <Text style={[styles.unitBadgeText, fromUnit === unit && { color: theme?.primary }]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Swap Visual Indicator Divider */}
      <View style={styles.dividerContainer}>
        <Text style={{ color: theme?.primary || '#FF9500', fontSize: 20 }}>⇄</Text>
      </View>

      {/* Output Group ("To" Side) */}
      <View style={[styles.card, { backgroundColor: theme?.surface || '#1C1C1E' }]}>
        <Text style={styles.cardLabel}>To</Text>
        <View style={styles.row}>
          <Text style={[styles.outputValue, { color: theme?.text || '#FFF' }]} numberOfLines={1}>
            {result || '0'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelectorContainer}>
            {CONVERSIONS[activeCategory].units.map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[styles.unitBadge, toUnit === unit && styles.activeBadge]}
                onPress={() => setToUnit(unit)}
              >
                <Text style={[styles.unitBadgeText, toUnit === unit && { color: theme?.primary }]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    marginVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'column',
  },
  input: {
    fontSize: 28,
    fontWeight: '700',
    paddingVertical: 4,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  outputValue: {
    fontSize: 28,
    fontWeight: '700',
    paddingVertical: 4,
    marginBottom: 12,
  },
  unitSelectorContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  unitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
  },
  unitBadgeText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  dividerContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
});