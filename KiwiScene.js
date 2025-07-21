import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF, OrbitControls } from '@react-three/drei/native';
import * as THREE from 'three';

const modelUrl = 'https://raw.githubusercontent.com/greypebs/kiwi/800a040a42b27352613fbff90a5a54b99c1da47e/low_poly_kiwi_run.glb';

function Model({ color, isStartled }) {
  const { scene } = useGLTF(modelUrl);
  const ref = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(colorMap[color] || 0x8b4513);
      }
    });
  }, [color]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
      if (isStartled) {
        ref.current.position.x = Math.sin(state.clock.elapsedTime * 10) * 0.2;
      }
    }
  });

  return <primitive ref={ref} object={scene} scale={1} position={[0, -1, 0]} />;
}

export default function KiwiScene({ color, isStartled }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <Model color={color} isStartled={isStartled} />
      <OrbitControls enablePan enableZoom enableRotate minDistance={2} maxDistance={10} />
    </Canvas>
  );
}

const colorMap = {
  brown: 0x8b4513,
  gray: 0x808080,
  spotted: 0x000000,
  white: 0xffffff,
};

// File: App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, Modal, TextInput, KeyboardAvoidingView, Keyboard, ScrollView, UIManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import KiwiScene from './KiwiScene';
import 'react-native-reanimated';

const API_KEY = 'YOUR_HUGGINGFACE_API_KEY';
const MODEL_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';

export default function App() {
  const [name, setName] = useState('Scott’s KiKi');
  const [color, setColor] = useState('brown');
  const [gender, setGender] = useState('male');
  const [email, setEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [fact] = useState('');
  const [happiness, setHappiness] = useState(50);
  const [hunger, setHunger] = useState(50);
  const [isIncubating, setIsIncubating] = useState(false);
  const [incubationStart, setIncubationStart] = useState(null);
  const [isStartled, setIsStartled] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
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

  const pet = () => setHappiness((prev) => Math.min(prev + 10, 100));
  const feed = () => setHunger((prev) => Math.min(prev + 20, 100));
  const play = () => setHappiness((prev) => Math.min(prev + 20, 100));
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
        inputs: `You are a fun, quirky kiwi bird named ${name}. Respond to: ${userInput}`,
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
      {/* ...Color buttons, modals, chat, etc. as in previous file... */}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // ... full styles as in your previous `App.js` ...
});
