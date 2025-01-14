import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from 'expo-router'

// Type-safe icon mapping
const TABS = {
  index: {
    title: 'Home',
    icon: 'home' as const,
  },
  profile: {
    title: 'Profile',
    icon: 'user' as const,
  },
} as const

// Type-safe icon component
function TabBarIcon({
  name,
  color,
}: {
  name: (typeof TABS)[keyof typeof TABS]['icon']
  color: string
}) {
  return (
    <FontAwesome
      size={28}
      style={{ marginBottom: -3 }}
      name={name}
      color={color}
    />
  )
}

export default function TabLayout() {
  return (
    <Tabs>
      {(
        Object.entries(TABS) as Array<
          [keyof typeof TABS, (typeof TABS)[keyof typeof TABS]]
        >
      ).map(([name, config]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: config.title,
            tabBarIcon: ({ color }) => (
              <TabBarIcon name={config.icon} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
