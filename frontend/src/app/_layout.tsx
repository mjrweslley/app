import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sem retry agressivo — em rede local o erro é imediato
      retry: 1,
      retryDelay: 2000,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            headerTitle: 'Definições',
            headerStyle: { backgroundColor: '#171614' },
            headerTintColor: '#cdccca',
            headerShadowVisible: false,
            presentation: 'modal',
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
