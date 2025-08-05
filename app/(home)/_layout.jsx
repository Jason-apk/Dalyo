import { Stack, useRouter } from "expo-router";

export default function Layout() {
  const router = useRouter();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* <StatusBar
        backgroundColor={lightColors.primary}
        barStyle="light-content"
      /> */}
    </Stack>
  );
}
