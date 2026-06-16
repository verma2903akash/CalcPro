import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import CalculatorButton from '../components/CalculatorButton';
import Display from '../components/Display';
import { useTheme } from '../context/ThemeContext';
import { saveHistory } from '../services/storageService';
import { evaluateExpression } from '../utils/expressionParser';

const FUNCTION_BUTTONS = new Set(['sin', 'cos', 'tan', 'log', 'ln', '√']);
const OPERATORS = new Set(['+', '-', '×', '÷', '^']);

const hasOpenParenthesis = (expression) => {
  const opens = (expression.match(/\(/g) || []).length;
  const closes = (expression.match(/\)/g) || []).length;
  return opens > closes;
};

const toggleLastNumberSign = (expression) => {
  if (!expression) return '-';

  const match = expression.match(/(.*?)(\(-\d+(?:\.\d+)?\)|\d+(?:\.\d+)?)$/);
  if (!match) return expression;

  const [, prefix, value] = match;

  if (value.startsWith('(-')) {
    return `${prefix}${value.slice(2, -1)}`;
  }

  return `${prefix}(-${value})`;
};

const nextParenthesis = (expression) => {
  if (
    !expression ||
    OPERATORS.has(expression.slice(-1)) ||
    expression.endsWith('(')
  ) {
    return '(';
  }

  return hasOpenParenthesis(expression) ? ')' : '×(';
};

export default function CalculatorScreen({
  isScientific,
  expression,
  setExpression,
  result,
  setResult,
}) {
  const { theme } = useTheme();
  const [angleMode, setAngleMode] = useState('deg');

  const appendToExpression = (value) => {
    setExpression((previous) => {
      if (!previous || previous === '0') return value;
      return previous + value;
    });
  };

  const handleButtonPress = async (button) => {
    if (button === 'AC') {
      setExpression('');
      setResult('0');
      return;
    }

    if (button === '⌫') {
      setExpression((previous) => previous.slice(0, -1));
      return;
    }

    if (button === 'deg' || button === 'rad') {
      setAngleMode(button);
      return;
    }

    if (button === '+/-') {
      setExpression((previous) => toggleLastNumberSign(previous));
      return;
    }

    if (button === '()') {
      appendToExpression(nextParenthesis(expression));
      return;
    }

    if (button === '=') {
      if (!expression) return;

      const answer = evaluateExpression(expression, { angleMode });
      setResult(answer);

      if (answer !== 'Error') {
        await saveHistory(expression, answer);
      }

      return;
    }

    if (FUNCTION_BUTTONS.has(button)) {
      appendToExpression(`${button === 'log' ? 'log10' : button}(`);
      return;
    }

    appendToExpression(button);
  };

  const basicButtons = [
    ['AC', '⌫', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['+/-', '0', '.', '='],
  ];

  const scientificButtons = [
    ['sin', 'cos', 'tan', 'deg', 'rad'],
    ['log', 'ln', '√', '^', 'π'],
    ['AC', '()', '%', '÷', 'e'],
    ['7', '8', '9', '×', '('],
    ['4', '5', '6', '-', ')'],
    ['1', '2', '3', '+', '⌫'],
    ['+/-', '0', '.', '=', ''],
  ];

  const currentGrid = isScientific ? scientificButtons : basicButtons;

  return (
    <View style={[styles.container, { backgroundColor: theme?.background || '#000' }]}>
      <View style={styles.displayContainer}>
        <Display expression={expression} result={result} />
      </View>

      <View style={[styles.keyboard, { gap: isScientific ? 8 : 12 }]}>
        {currentGrid.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.row, { gap: isScientific ? 8 : 12 }]}>
            {row.map((button, buttonIndex) => {
              if (!button) return <View key={buttonIndex} style={styles.emptySpacer} />;

              return (
                <CalculatorButton
                  key={`${button}-${buttonIndex}`}
                  text={button}
                  onPress={() => handleButtonPress(button)}
                  isScientificVariant={isScientific}
                  isActive={button === angleMode}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  displayContainer: {
    flex: 0.45,
    justifyContent: 'flex-end',
  },
  keyboard: {
    flex: 0.55,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptySpacer: {
    flex: 1,
  },
});
