import { Tabs, Redirect } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';

export default function TabsLayout() {
  const { user } = useAuthStore();
  const isCreator = user?.role === 'creator';

  if (isCreator) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: () => <TabBarIcon name="home" />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: () => <TabBarIcon name="search" />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: () => <TabBarIcon name="book" />,
          }}
        />
        <Tabs.Screen
          name="creator"
          options={{
            title: 'Dashboard',
            tabBarIcon: () => <TabBarIcon name="dashboard" />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: () => <TabBarIcon name="user" />,
          }}
        />
        <Tabs.Screen
          name="upload"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen name="player" options={{ href: null }} />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <TabBarIcon name="home" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: () => <TabBarIcon name="search" />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: () => <TabBarIcon name="book" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <TabBarIcon name="user" />,
        }}
      />
      <Tabs.Screen name="upload" options={{ href: null }} />
      <Tabs.Screen name="creator" options={{ href: null }} />
      <Tabs.Screen name="player" options={{ href: null }} />
    </Tabs>
  );
}

function TabBarIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    home: '🏠',
    search: '🔍',
    book: '📚',
    user: '👤',
    dashboard: '📊',
  };
  return <Text style={{ fontSize: 24 }}>{icons[name]}</Text>;
}