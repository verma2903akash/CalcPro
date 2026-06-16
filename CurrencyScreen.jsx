import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';

const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  INR: 83.5,
  JPY: 157.2,
};

const CURRENCY_NAMES = {
  USD: 'US Dollar ($)',
  EUR: 'Euro (€)',
  GBP: 'British Pound (£)',
  INR: 'Indian Rupee (₹)',
  JPY: 'Japanese Yen (¥)',
};

const RATES_ENDPOINT =
  'https://open.er-api.com/v6/latest/USD';

export default function CurrencyScreen() {
  const { theme } = useTheme();

  const [currencies, setCurrencies] = useState(
    Object.keys(FALLBACK_RATES)
  );

  const [inputValue, setInputValue] = useState('1');

  const [fromCurrency, setFromCurrency] =
    useState('USD');

  const [toCurrency, setToCurrency] =
    useState('INR');

  const [result, setResult] =
    useState('0');

  const [rates, setRates] =
    useState(FALLBACK_RATES);

  const [loading, setLoading] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState('Offline rates');

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await fetch(RATES_ENDPOINT);

      const data =
        await response.json();

      if (data.result === 'success') {
        setRates(data.rates);

        setCurrencies(
          Object.keys(data.rates).sort()
        );

        setStatusMessage(
          'Live rates loaded'
        );
      }
    } catch (error) {
      console.log(error);

      setStatusMessage(
        'Using offline rates'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    const amount =
      parseFloat(inputValue);

    if (isNaN(amount)) {
      setResult('0');
      return;
    }

    const fromRate =
      rates[fromCurrency];

    const toRate =
      rates[toCurrency];

    if (!fromRate || !toRate) {
      setResult('Error');
      return;
    }

    const usdAmount =
      amount / fromRate;

    const converted =
      usdAmount * toRate;

    setResult(
      converted.toFixed(2)
    );
  }, [
    inputValue,
    fromCurrency,
    toCurrency,
    rates,
  ]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            theme?.background ||
            '#000',
        },
      ]}
    >
      <View
        style={
          styles.statusContainer
        }
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#FF9500"
          />
        ) : (
          <Text
            style={
              styles.statusText
            }
          >
            {statusMessage}
          </Text>
        )}
      </View>

      {/* FROM */}

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              theme?.surface ||
              '#1C1C1E',
          },
        ]}
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          From
        </Text>

        <TextInput
          value={inputValue}
          onChangeText={
            setInputValue
          }
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#666"
          style={[
            styles.input,
            {
              color:
                theme?.text ||
                '#fff',
            },
          ]}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
        >
          {currencies.map(
            (code) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.badge,
                  fromCurrency ===
                    code &&
                    styles.activeBadge,
                ]}
                onPress={() =>
                  setFromCurrency(
                    code
                  )
                }
              >
                <Text
                  style={
                    styles.badgeText
                  }
                >
                  {CURRENCY_NAMES[
                    code
                  ] || code}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

      {/* SWAP */}

      <TouchableOpacity
        style={styles.swapButton}
        onPress={swapCurrencies}
      >
        <Text
          style={
            styles.swapText
          }
        >
          ⇄
        </Text>
      </TouchableOpacity>

      {/* TO */}

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              theme?.surface ||
              '#1C1C1E',
          },
        ]}
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          To
        </Text>

        <Text
          style={[
            styles.result,
            {
              color:
                theme?.text ||
                '#fff',
            },
          ]}
        >
          {result}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
        >
          {currencies.map(
            (code) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.badge,
                  toCurrency ===
                    code &&
                    styles.activeBadge,
                ]}
                onPress={() =>
                  setToCurrency(
                    code
                  )
                }
              >
                <Text
                  style={
                    styles.badgeText
                  }
                >
                  {CURRENCY_NAMES[
                    code
                  ] || code}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },

    statusContainer: {
      alignItems: 'center',
      marginBottom: 15,
    },

    statusText: {
      color: '#999',
      fontSize: 12,
    },

    card: {
      padding: 16,
      borderRadius: 16,
      marginBottom: 20,
    },

    sectionTitle: {
      color: '#888',
      marginBottom: 10,
      fontSize: 14,
    },

    input: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 15,
    },

    result: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 15,
    },

    badge: {
      backgroundColor:
        '#2C2C2E',

      paddingHorizontal: 12,
      paddingVertical: 8,

      borderRadius: 8,

      marginRight: 8,
    },

    activeBadge: {
      borderWidth: 1,
      borderColor: '#FF9500',
    },

    badgeText: {
      color: '#fff',
      fontSize: 13,
    },

    swapButton: {
      alignSelf: 'center',

      marginBottom: 20,

      paddingHorizontal: 20,
      paddingVertical: 10,

      backgroundColor:
        '#FF9500',

      borderRadius: 25,
    },

    swapText: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '700',
    },
  });