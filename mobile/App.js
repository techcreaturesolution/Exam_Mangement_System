import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ExamCategoriesScreen from './src/screens/ExamCategoriesScreen';
import ExamListScreen from './src/screens/ExamListScreen';
import ExamScreen from './src/screens/ExamScreen';
import ResultScreen from './src/screens/ResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#4f46e5' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '600' },
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen
      name="ExamCategories"
      component={ExamCategoriesScreen}
      options={({ route }) => ({
        title: route.params?.examType === 'practice' ? 'Practice Exams' : 'Mock Exams',
      })}
    />
    <Stack.Screen
      name="ExamList"
      component={ExamListScreen}
      options={({ route }) => ({ title: route.params?.categoryName || 'Exams' })}
    />
    <Stack.Screen
      name="ExamScreen"
      component={ExamScreen}
      options={{ headerShown: false, gestureEnabled: false }}
    />
    <Stack.Screen
      name="Result"
      component={ResultScreen}
      options={{ headerShown: false, gestureEnabled: false }}
    />
    <Stack.Screen
      name="History"
      component={HistoryScreen}
      options={{ title: 'Exam History' }}
    />
  </Stack.Navigator>
);

const Navigation = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
