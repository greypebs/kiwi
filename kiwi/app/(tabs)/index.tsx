import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, Modal, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import KiwiScene from '../components/KiwiScene';

const API_KEY = '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'; // Replace with your Hugging Face API key; better to use .env via react-native-dotenv
const MODEL_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';

export default function HomeScreen() {
  const [name, setName] = useState('Scott’s KiKi');
  const [color, setColor] = useState('brown');
  const [gender, setGender] = useState('male');
  const [email, setEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [happiness, setHappiness] = useState(50);
  const [hunger, setHunger] = useState(50);
  const [isIncubating, setIsIncubating] = useState(false);
  const [incubationStart, setIncubationStart] = useState<number | null>(null);
  const [isStartled, setIsStartled] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [userInput, setUserInput] = useState('');

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
    try {
      const response = await fetch(MODEL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `You are a fun, quirky kiwi bird named ${name}. You are flightless, nocturnal, have a strong sense of smell, and love puns about birds or New Zealand. Respond to: ${userInput}`,
        }),
      });
      const data = await response.json();
      const aiResponse = data[0]?.generated_text || 'Sorry, I couldn\'t respond.';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to get response from AI.');
    }
    setUserInput('');
  };

  return (
    <View style={styles.container}>
      <KiwiScene
        color={color}
        gender={gender}
        happiness={happiness}
        hunger={hunger}
        isIncubating={isIncubating}
        isStartled={isStartled}
      />
      <Text>{name} ({gender})</Text>
      <Text>Happiness: {happiness}</Text>
      <Text>Hunger: {hunger}</Text>
      <TouchableOpacity onPress={pet}><Text>Pet</Text></TouchableOpacity>
      <TouchableOpacity onPress={feed}><Text>Feed</Text></TouchableOpacity>
      <TouchableOpacity onPress={play}><Text>Play</Text></TouchableOpacity>
      <TouchableOpacity onPress={startle}><Text>Startle</Text></TouchableOpacity>
      {gender === 'male' && <TouchableOpacity onPress={startIncubation}><Text>Incubate Egg</Text></TouchableOpacity>}
      <TouchableOpacity onPress={() => setModalVisible(true)}><Text>Submit Email</Text></TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <TextInput value={email} onChangeText={setEmail} placeholder="Enter email" style={styles.input} />
          <TouchableOpacity onPress={submitEmail}><Text>Submit</Text></TouchableOpacity>
        </View>
      </Modal>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.chatContainer}>
        <ScrollView style={styles.chatScroll}>
          {chatMessages.map((msg, index) => (
            <Text key={index} style={[styles.chatText, { color: msg.role === 'user' ? 'blue' : 'green' }]}>
              {msg.role}: {msg.content}
            </Text>
          ))}
        </ScrollView>
        <TextInput value={userInput} onChangeText={setUserInput} placeholder="Chat with your kiwi" style={styles.input} />
        <TouchableOpacity onPress={sendMessage}><Text>Send</Text></TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    width: '100%',
    padding: 10,
  },
  chatScroll: {
    flex: 1,
    width: '100%',
  },
  chatText: {
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: '80%',
  },
});