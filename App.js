// File: App.js (Main entry point)
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, Modal, TextInput, KeyboardAvoidingView, Keyboard, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import KiwiScene from './KiwiScene';

const API_KEY = 'YOUR_HUGGINGFACE_API_KEY'; // Replace with your free Hugging Face API key (signup at hf.co)
const MODEL_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2'; // Example model

export default function App() {
  const [name, setName] = useState('Scott’s KiKi');
  const [color, setColor] = useState('brown');
  const [gender, setGender] = useState('male');
  const [email, setEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [fact] = useState(''); // Removed static facts
  const [happiness, setHappiness] = useState(50);
  const [hunger, setHunger] = useState(50);
  const [isIncubating, setIsIncubating] = useState(false);
  const [incubationStart, setIncubationStart] = useState(null);
  const [isStartled, setIsStartled] = useState(false);
  const [chatMessages, setChatMessages] = useState([]); // Chat history
  const [userInput, setUserInput] = useState(''); // Chat input

  useEffect(() => {
    if (name === 'Scott’s KiKi') {
      Alert.prompt('Name your kiwi', 'Default: Scott’s KiKi', (input) => setName(input || 'Scott’s KiKi'));
    }
    const decreaseInterval = setInterval(decreaseLevels, 5000);
    const incubationInterval = setInterval(checkIncubation, 1000);
    return () => {
      clearInterval(decreaseInterval);
      clearInterval(incubationInterval);
    };
  }, []);

  const decreaseLevels = () => {
    setHunger((prev) => Math.max(prev - 1, 0));
    setHappiness((prev) => Math.max(prev - 1, 0));
    if (hunger < 20) Alert.alert("I'm hungry!");
  };

  const checkIncubation = () => {
    if (isIncubating && incubationStart) {
      const timePassed = (Date.now() - incubationStart) / 1000;
      if (timePassed >= 90) {
        setIsIncubating(false);
        setIncubationStart(null);
        setHappiness((prev) => Math.min(prev + 20, 100));
        Alert.alert("Chick hatched! Happiness boosted.");
      }
    }
  };

  const pet = () => {
    setHappiness((prev) => Math.min(prev + 10, 100));
    // No popup
  };

  const feed = () => {
    setHunger((prev) => Math.min(prev + 20, 100));
  };

  const play = () => {
    setHappiness((prev) => Math.min(prev + 20, 100));
  };

  const startle = () => {
    setIsStartled(true);
    setHappiness((prev) => Math.max(prev - 10, 0));
    setTimeout(() => setIsStartled(false), 2000);
  };

  const startIncubation = () => {
    if (gender === 'male' && !isIncubating) {
      setIsIncubating(true);
      setIncubationStart(Date.now());
    }
  };

  const submitEmail = () => {
    Alert.alert('Email Submitted', email);
    setModalVisible(false);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    setChatMessages((prev) => [...prev, { role: 'user', content: userInput }]);
    const response = await fetch(MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `You are a fun, quirky kiwi bird named ${name}. You are flightless, nocturnal, have a strong sense of smell, and love puns about birds or New Zealand. Respond to: ${userInput}`,
        parameters: { max_tokens: 100 },
      }),
    });
    const data = await response.json();
    const kiwiResponse = data[0]?.generated_text || "Chirp! I'm a bit sleepy right now.";
    setChatMessages((prev) => [...prev, { role: 'kiwi', content: kiwiResponse }]);
    setUserInput('');
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <KiwiScene color={color} isStartled={isStartled} />
      <Text style={styles.skyFact}>{fact}</Text>
      <TouchableOpacity style={styles.handIcon} onPress={pet}>
        <Text style={styles.handText}>Pet</Text>
      </TouchableOpacity>
      <View style={styles.colorIcons}>
        <TouchableOpacity style={[styles.colorBtn, { backgroundColor: 'brown' }]} onPress={() => setColor('brown')} />
        <TouchableOpacity style={[styles.colorBtn, { backgroundColor: 'gray' }]} onPress={() => setColor('gray')} />
        <TouchableOpacity style={[styles.colorBtn, { backgroundColor: 'black' }]} onPress={() => setColor('spotted')} />
        <TouchableOpacity style={[styles.colorBtn, { backgroundColor: 'white' }]} onPress={() => setColor('white')} />
      </View>
      <TouchableOpacity style={styles.settingsBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.settingsText}>Settings</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Settings</Text>
          <Text>Gender:</Text>
          <View style={styles.genderSelect}>
            <TouchableOpacity onPress={() => setGender('male')}>
              <Text style={gender === 'male' ? styles.selected : styles.option}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGender('female')}>
              <Text style={gender === 'female' ? styles.selected : styles.option}>Female</Text>
            </TouchableOpacity>
          </View>
          <Text>Email:</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter email" />
          <TouchableOpacity style={styles.submitBtn} onPress={submitEmail}>
            <Text>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.chatContainer}>
        <ScrollView style={styles.chatMessages}>
          {chatMessages.map((msg, index) => (
            <Text key={index} style={msg.role === 'user' ? styles.userMessage : styles.kiwiMessage}>
              {msg.content}
            </Text>
          ))}
        </ScrollView>
        <View style={styles.chatInputContainer}>
          <TextInput style={styles.chatInput} value={userInput} onChangeText={setUserInput} placeholder="Talk to me..." />
          <TouchableOpacity onPress={sendMessage}>
            <Text style={styles.sendButton}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Text style={styles.promptMessage}>Tap 'Pet' to interact! (Drag to pan/zoom)</Text>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skyFact: { position: 'absolute', top: 50, left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: 18, zIndex: 1, textShadowColor: 'black', textShadowRadius: 5 },
  handIcon: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -50 }, { translateY: -50 }], backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 20, zIndex: 2 },
  handText: { color: 'white', fontSize: 16 },
  colorIcons: { position: 'absolute', top: 10, left: '50%', transform: [{ translateX: -50 }], flexDirection: 'row', gap: 10, zIndex: 2 },
  colorBtn: { width: 30, height: 30, borderRadius: 15 },
  settingsBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'transparent', zIndex: 2 },
  settingsText: { color: 'white', fontSize: 16 },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { marginBottom: 15, textAlign: 'center', fontSize: 20 },
  genderSelect: { flexDirection: 'row', gap: 20 },
  option: { fontSize: 16 },
  selected: { fontSize: 16, fontWeight: 'bold' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, width: 200, marginBottom: 10, padding: 10 },
  submitBtn: { backgroundColor: '#2196F3', padding: 10, borderRadius: 5, marginBottom: 10 },
  closeBtn: { backgroundColor: '#f44336', padding: 10, borderRadius: 5 },
  promptMessage: { position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: 18, zIndex: 1 },
  chatContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 1 },
  chatMessages: { flex: 1, padding: 10 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#dcf8c6', padding: 10, marginBottom: 5, borderRadius: 10 },
  kiwiMessage: { alignSelf: 'flex-start', backgroundColor: '#ffffff', padding: 10, marginBottom: 5, borderRadius: 10 },
  chatInputContainer: { flexDirection: 'row', padding: 10 },
  chatInput: { flex: 1, borderColor: 'gray', borderWidth: 1, padding: 10, borderRadius: 20 },
  sendButton: { color: '#2196F3', paddingLeft: 10, fontSize: 16 },
});