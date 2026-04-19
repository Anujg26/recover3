import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '../screens/HomeScreen';
import LogScreen from '../screens/LogScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ROMCheckScreen from '../screens/ROMCheckScreen';
import PractitionerScreen from '../screens/PractitionerScreen';
import PractitionerDashboard from '../screens/PractitionerDashboard';
import PractitionerPatientDetail from '../screens/PractitionerPatientDetail';

// Context
import { useRole } from '../context/RoleContext';

// Icons
import { Home, PlusCircle, BarChart2, Camera, Stethoscope, LayoutDashboard } from 'lucide-react-native';

// Theme
import { COLORS } from '../styles/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const PatientTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          height: 90,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Log" 
        component={LogScreen} 
        options={{
          tabBarIcon: ({ color }) => <PlusCircle size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen} 
        options={{
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="ROM" 
        component={ROMCheckScreen} 
        options={{
          tabBarIcon: ({ color }) => <Camera size={24} color={color} />,
          tabBarLabel: 'Check-in',
        }}
      />
      <Tab.Screen 
        name="Care" 
        component={PractitionerScreen} 
        options={{
          tabBarIcon: ({ color }) => <Stethoscope size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const PractitionerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={PractitionerDashboard} />
      <Stack.Screen name="PatientDetail" component={PractitionerPatientDetail} />
    </Stack.Navigator>
  );
};

export default function AppNavigator() {
  const { role } = useRole();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {role === 'patient' ? (
          <Stack.Screen name="PatientMain" component={PatientTabs} />
        ) : (
          <Stack.Screen name="PractitionerMain" component={PractitionerStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
