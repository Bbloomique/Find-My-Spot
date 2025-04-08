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
        }} />
        <Stack.Screen 
        name="vehicleinfo" 
        options={{
          headerTitle: "Vehicle Information",
          headerShown: true,
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
        }} />
        <Stack.Screen 
        name="parkconfirm" 
        options={{
          headerTitle: "Parking Confirmation",
          headerShown: false,
        }} />
        <Stack.Screen 
        name="parkreceipt" 
        options={{
          headerTitle: "Parking Receipt",
          headerShown: false,
        }} />
        <Stack.Screen 
        name="notification" 
        options={{
          headerTitle: "Notification",
          headerShown: true,
        }} />
        <Stack.Screen 
        name="userprofile" 
        options={{
          headerTitle: "Profile",
          headerShown: true,
        }} />
        <Stack.Screen 
        name="help" 
        options={{
          headerTitle: "Help & Support",
          headerShown: true,
        }} />
    </Stack>
  );
}
