import { Stack } from 'expo-router';

export default function ReminderLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="UpcomingRemindersScreen"
        options={{ headerShown: false, title: 'Upcoming Reminders' }}
      />
     {/*  <Stack.Screen
        name="AddReminderScreen"
        options={{ headerShown: true, title: 'Add Reminder' }}
      />
      <Stack.Screen
        name="ReminderSettingsScreen"
        options={{ headerShown: true, title: 'Reminder Settings' }}
      /> */}
    </Stack>
  );
}
