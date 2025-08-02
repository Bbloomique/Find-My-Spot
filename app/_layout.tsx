import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{
          headerTitle: "Home",
          headerShown: false,
        }} />
      <Stack.Screen 
        name="login" 
        options={{
          headerTitle: "Login",
          headerShown: false,
        }} />
      <Stack.Screen 
        name="signup" 
        options={{
          headerTitle: "Sign Up",
          headerShown: false,
        }} />
      <Stack.Screen 
        name="driverinfo" 
        options={{
          headerTitle: "Driver Information",
          headerShown: true,
          headerStyle: { backgroundColor: '#151533' },
          headerTitleStyle: { color: '#fff' },
          headerTintColor: '#fff',
        }} />
        <Stack.Screen 
        name="vehicleinfo" 
        options={{
          headerTitle: "Vehicle Information",
          headerShown: true,
          headerStyle: { backgroundColor: '#151533' },
          headerTitleStyle: { color: '#fff' },
          headerTintColor: '#fff',
        }} />
      <Stack.Screen 
        name="dashboard" 
        options={{
          headerTitle: "Dashboard",
          headerShown: false,
        }} />
        <Stack.Screen 
        name="location" 
        options={{
          headerTitle: "Parking Availability",
          headerShown: true,
          headerStyle: { backgroundColor: '#151533' },
          headerTitleStyle: { color: '#fff' },
          headerTintColor: '#fff',
        }} />
        <Stack.Screen 
        name="notification" 
        options={{
          headerTitle: "Notification",
          headerShown: true,
          headerStyle: { backgroundColor: '#151533' },
          headerTitleStyle: { color: '#fff' },
          headerTintColor: '#fff',
        }} />
        <Stack.Screen 
        name="userprofile" 
        options={{
          headerTitle: "Profile",
          headerShown: true,
          headerStyle: { backgroundColor: '#151533' },
          headerTitleStyle: { color: '#fff' },
          headerTintColor: '#fff',
        }} />
        <Stack.Screen 
        name="help" 
        options={{
          headerTitle: "Help & Support",
          headerShown: true,
          headerStyle: { backgroundColor: '#151533' },
          headerTitleStyle: { color: '#fff' },
          headerTintColor: '#fff',
        }} />
    </Stack>
  );
}
