import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_KEY = '@calcpro_notes';

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTES_KEY);

      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveNotes = async (updatedNotes) => {
    setNotes(updatedNotes);

    await AsyncStorage.setItem(
      NOTES_KEY,
      JSON.stringify(updatedNotes)
    );
  };

  const createNote = async () => {
    const newNote = {
      id: Date.now().toString(),
      content: '',
      createdAt: new Date().toLocaleString(),
    };

    const updated = [newNote, ...notes];

    await saveNotes(updated);

    setSelectedId(newNote.id);
    setCurrentNote('');
  };

  const selectNote = (note) => {
    setSelectedId(note.id);
    setCurrentNote(note.content);
  };

  const updateCurrentNote = async (text) => {
    setCurrentNote(text);

    const updated = notes.map((note) =>
      note.id === selectedId
        ? {
            ...note,
            content: text,
          }
        : note
    );

    await saveNotes(updated);
  };

  const deleteNote = async () => {
    if (!selectedId) return;

    const updated = notes.filter(
      (note) => note.id !== selectedId
    );

    await saveNotes(updated);

    setSelectedId(null);
    setCurrentNote('');
  };

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
    >
      <View style={styles.container}>
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.title}>
            Maths Notes
          </Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={createNote}
          >
            <Text style={styles.addText}>
              + New
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notes List */}

        <FlatList
          horizontal
          data={notes}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          style={styles.noteTabs}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                selectedId === item.id &&
                  styles.activeTab,
              ]}
              onPress={() =>
                selectNote(item)
              }
            >
              <Text
                style={styles.tabText}
                numberOfLines={1}
              >
                {item.content
                  ? item.content.substring(
                      0,
                      12
                    )
                  : 'Empty'}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Editor */}

        <TextInput
          style={styles.editor}
          placeholder="Write your maths notes here..."
          placeholderTextColor="#666"
          multiline
          value={currentNote}
          onChangeText={
            updateCurrentNote
          }
          textAlignVertical="top"
        />

        {/* Footer */}

        {selectedId && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={deleteNote}
          >
            <Text
              style={styles.deleteText}
            >
              Delete Note
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  addButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  addText: {
    color: '#fff',
    fontWeight: '700',
  },

  noteTabs: {
    maxHeight: 50,
    marginBottom: 15,
  },

  tab: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
  },

  activeTab: {
    borderWidth: 1,
    borderColor: '#FF9500',
  },

  tabText: {
    color: '#fff',
  },

  editor: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
  },

  deleteButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },

  deleteText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});