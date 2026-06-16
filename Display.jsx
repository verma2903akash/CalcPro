import React, { useRef } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

export default function Display({
  expression,
  result,
}) {
  const scrollRef = useRef(null);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          horizontal
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({
              animated: true,
            })
          }
        >
          <Text style={styles.expression}>
            {expression || '0'}
          </Text>
        </ScrollView>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={styles.result}
        >
          {result}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.4,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  content: {
    alignItems: 'flex-end',
  },

  expression: {
    color: '#8E8E93',
    fontSize: 28,
    marginBottom: 10,
  },

  result: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '300',
  },
});