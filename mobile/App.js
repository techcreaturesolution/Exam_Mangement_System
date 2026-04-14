import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TopicBrowserScreen from './src/screens/TopicBrowserScreen';
import SetListScreen from './src/screens/SetListScreen';
import MockTestsScreen from './src/screens/MockTestsScreen';
import ExamScreen from './src/screens/ExamScreen';
import ResultScreen from './src/screens/ResultScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import PlansScreen from './src/screens/PlansScreen';
import MySubscriptionsScreen from './src/screens/MySubscriptionsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const PracticeStack = createNativeStackNavigator();
const TestsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const NAVY = '#1E3A6E';

const TabIcon = ({ label, focused }) => (
  <View style={tabStyles.iconContainer}>
    {focused && <View style={tabStyles.indicator} />}
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
  </View>
);

const tabStyles = StyleSheet.create({
  iconContainer: { alignItems: 'center', paddingTop: 4 },
  indicator: { width: 20, height: 3, borderRadius: 2, backgroundColor: NAVY, marginBottom: 3 },
  label: { fontSize: 11, color: '#888' },
  labelActive: { color: NAVY, fontWeight: '700' },
});

// Practice Tab Stack
function PracticeStackScreen() {
  return (
    <PracticeStack.Navigator screenOptions={{ headerShown: false }}>
      <PracticeStack.Screen name="TopicBrowser" component={TopicBrowserScreen} />
      <PracticeStack.Screen name="SetList" component={SetListScreen} />
    </PracticeStack.Navigator>
  );
}

// Tests Tab Stack
function TestsStackScreen() {
  return (
    <TestsStack.Navigator screenOptions={{ headerShown: false }}>
      <TestsStack.Screen name="MockTestsList" component={MockTestsScreen} />
    </TestsStack.Navigator>
  );
}

// Profile Tab Stack
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="MySubscriptions" component={MySubscriptionsScreen} options={{ headerShown: true, title: 'My Subscriptions', headerTintColor: NAVY }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings', headerTintColor: NAVY }} />
      <ProfileStack.Screen name="Analytics" component={AnalyticsScreen} />
    </ProfileStack.Navigator>
  );
}

// Bottom Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#e0e0e0',
          height: 56,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="PracticeTab"
        component={PracticeStackScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Practice" focused={focused} /> }}
      />
      <Tab.Screen
        name="TestsTab"
        component={TestsStackScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Tests" focused={focused} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Me" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// App Stack (authenticated)
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Exam" component={ExamScreen} />
      <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: true, title: 'Result', headerTintColor: NAVY }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: true, title: 'Choose a Plan', headerTintColor: NAVY }} />
      <Stack.Screen name="Plans" component={PlansScreen} options={{ headerShown: true, title: 'Plans', headerTintColor: NAVY }} />
    </Stack.Navigator>
  );
}

function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6f8' }}>
        <View style={{ width: 64, height: 64, borderRadius: 14, backgroundColor: NAVY, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff' }}>TB</Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: NAVY }}>TestBharti</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
