import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  
  const { colorScheme, themePreference, setThemePreference } = useTheme();
  const colors = Colors[colorScheme];
  const { phoneNumber, userId, logoutCompletely } = useAuth();

  // Copy user ID to clipboard
  const copyUserIdToClipboard = async () => {
    if (userId) {
      try {
        await Clipboard.setStringAsync(userId);
        Alert.alert('Copied!', 'User ID has been copied to clipboard', [{ text: 'OK' }]);
      } catch (error) {
        Alert.alert('Error', 'Failed to copy User ID to clipboard');
      }
    }
  };

  // Profile information press handler
  const handleProfilePress = () => {
    const buttons = [];
    
    if (userId) {
      buttons.push({
        text: 'Copy User ID',
        onPress: copyUserIdToClipboard,
      });
    }
    
    buttons.push({
      text: 'OK',
      style: 'cancel' as const,
    });

    Alert.alert(
      'Profile Information',
      `Phone Number: ${phoneNumber}${userId ? `\nUser ID: ${userId}` : ''}\n\nTo change your phone number, please logout and register again.`,
      buttons
    );
  };

  const settingsGroups = [
    {
      title: 'Profile',
      items: [
        {
          icon: 'person-outline',
          title: 'Profile Information',
          subtitle: phoneNumber ? `Phone: ${phoneNumber}${userId ? `\nUser ID: ${userId.substring(0, 8)}... (tap to copy)` : ''}` : 'Manage your personal details',
          onPress: handleProfilePress,
          hasSwitch: false,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: 'finger-print',
          title: 'Biometric Login',
          subtitle: 'Use fingerprint or face recognition',
          value: biometric,
          onValueChange: setBiometric,
          hasSwitch: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline',
          title: 'Notifications',
          subtitle: 'Push notifications and alerts',
          value: notifications,
          onValueChange: setNotifications,
          hasSwitch: true,
        },
        {
          icon: 'language-outline',
          title: 'Language',
          subtitle: 'English (US)',
          onPress: () => Alert.alert('Language', 'Language selection coming soon!'),
          hasSwitch: false,
        },
      ],
    },
    {
      title: 'Theme',
      items: [
        {
          icon: 'contrast-outline',
          title: 'Follow System',
          subtitle: 'Use device theme setting',
          value: themePreference === 'system',
          onValueChange: () => setThemePreference('system'),
          hasSwitch: false,
          isRadio: true,
        },
        {
          icon: 'sunny-outline',
          title: 'Light Mode',
          subtitle: 'Always use light theme',
          value: themePreference === 'light',
          onValueChange: () => setThemePreference('light'),
          hasSwitch: false,
          isRadio: true,
        },
        {
          icon: 'moon-outline',
          title: 'Dark Mode',
          subtitle: 'Always use dark theme',
          value: themePreference === 'dark',
          onValueChange: () => setThemePreference('dark'),
          hasSwitch: false,
          isRadio: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'chatbubble-outline',
          title: 'Contact Us',
          subtitle: 'Send us your feedback',
          onPress: () => Alert.alert('Contact', 'Contact form coming soon!'),
          hasSwitch: false,
        },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to verify your phone number again when you return.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await logoutCompletely();
              Alert.alert('Logged Out', 'You have been logged out successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Manage your app preferences</ThemedText>
      </ThemedView>

      {/* Settings Groups */}
      <ThemedView style={styles.content}>
        {settingsGroups.map((group, groupIndex) => (
          <ThemedView key={groupIndex} style={styles.settingsGroup}>
            <ThemedText style={styles.groupTitle}>{group.title}</ThemedText>
            
            <ThemedView style={[styles.groupContainer, { borderColor: colors.icon + '20' }]}>
              {group.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex !== group.items.length - 1 && styles.settingItemBorder,
                    { borderBottomColor: colors.icon + '15' }
                  ]}
                  onPress={'onPress' in item ? item.onPress : ('isRadio' in item ? item.onValueChange : undefined)}
                  disabled={item.hasSwitch}
                >
                  <ThemedView style={styles.settingItemLeft}>
                    <ThemedView style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                      <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                    </ThemedView>
                    <ThemedView style={styles.settingText}>
                      <ThemedText style={styles.settingTitle}>{item.title}</ThemedText>
                      <ThemedText style={styles.settingSubtitle}>{item.subtitle}</ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  {item.hasSwitch ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onValueChange}
                      trackColor={{ false: colors.icon + '30', true: colors.primary + '50' }}
                      thumbColor={item.value ? colors.primary : '#f4f3f4'}
                    />
                  ) : 'isRadio' in item ? (
                    <ThemedView style={[styles.radioButton, { borderColor: colors.primary }]}>
                      {item.value && (
                        <ThemedView style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                      )}
                    </ThemedView>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={colors.icon} />
                  )}
                </Pressable>
              ))}
            </ThemedView>
          </ThemedView>
        ))}

        {/* App Version */}
        <ThemedView style={styles.versionContainer}>
          <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
          <ThemedText style={styles.versionSubtext}>SavingMob © 2025</ThemedText>
        </ThemedView>

        {/* Logout Button */}
        <Pressable
          style={[styles.logoutButton, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <ThemedText style={[styles.logoutText, { color: colors.error }]}>Logout</ThemedText>
        </Pressable>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  settingsGroup: {
    marginBottom: 32,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  groupContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    opacity: 0.6,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});