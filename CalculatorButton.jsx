import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../context/ThemeContext';

export default function CalculatorButton({
  text,
  onPress,
  isScientificVariant,
  isActive = false,
}) {
  const { theme } = useTheme();

  const getButtonStyles = () => {
    if (isActive) {
      return { bg: theme?.primary || '#FF9500', text: '#000' };
    }

    if (['=', '+', '-', '×', '÷', '^'].includes(text)) {
      return { bg: theme?.primary || '#FF9500', text: '#FFF' };
    }

    if (['C', 'AC', '()', '%', '⌫', 'back', 'DEL', '+/-'].includes(text)) {
      return {
        bg: theme?.surface === '#FFFFFF' ? '#E5E5EA' : '#3A3A3C',
        text: theme?.text || '#FFF',
      };
    }

    if (['sin', 'cos', 'tan', 'log', 'ln', '√', 'π', 'e', 'deg', 'rad', '(', ')'].includes(text)) {
      return {
        bg: theme?.surface === '#FFFFFF' ? '#F2F2F7' : '#2C2C2E',
        text: theme?.primary || '#FF9500',
      };
    }

    return { bg: theme?.surface || '#1C1C1E', text: theme?.text || '#FFF' };
  };

  const colors = getButtonStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.bg,
          paddingVertical: isScientificVariant ? 14 : 20,
          borderRadius: isScientificVariant ? 10 : 99,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isScientificVariant ? 15 : 24,
            fontWeight: isScientificVariant ? '600' : '400',
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
