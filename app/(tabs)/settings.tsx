import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleProfileEdit = () => {
    Alert.alert('Profile', 'Profile editing functionality will be implemented');
  };

  const handleSecurity = () => {
    Alert.alert('Security', 'Security settings functionality will be implemented');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Support functionality will be implemented');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy', 'Privacy policy functionality will be implemented');
  };

  const handleTerms = () => {
    Alert.alert('Terms', 'Terms of service functionality will be implemented');
  };

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.settingsItem}>
      <View style={[styles.settingsIcon, { backgroundColor: '#007B50' + '20' }]}>
        <IconSymbol name={icon as any} size={20} color="#007B50" />
      </View>
      
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsTitle, { color: isDark ? '#FFF' : '#333' }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingsSubtitle, { color: isDark ? '#AAA' : '#666' }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightComponent || (showArrow && (
        <IconSymbol name="chevron.right" size={16} color={isDark ? '#AAA' : '#666'} />
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>
          Settings
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#AAA' : '#666' }]}>
            ACCOUNT
          </Text>
          
          <SettingsItem
            icon="person.circle.fill"
            title="Profile"
            subtitle="Edit your profile information"
            onPress={handleProfileEdit}
          />
          
          <SettingsItem
            icon="shield.fill"
            title="Security"
            subtitle="Password, 2FA, and security settings"
            onPress={handleSecurity}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#AAA' : '#666' }]}>
            PREFERENCES
          </Text>
          
          <SettingsItem
            icon="bell.fill"
            title="Notifications"
            subtitle="Push notifications and alerts"
            showArrow={false}
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: '#007B50' }}
                thumbColor={notificationsEnabled ? '#FFF' : '#f4f3f4'}
              />
            }
          />
          
          <SettingsItem
            icon="faceid"
            title="Biometric Authentication"
            subtitle="Use Face ID or Touch ID"
            showArrow={false}
            rightComponent={
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#767577', true: '#007B50' }}
                thumbColor={biometricEnabled ? '#FFF' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#AAA' : '#666' }]}>
            SUPPORT
          </Text>
          
          <SettingsItem
            icon="questionmark.circle.fill"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={handleSupport}
          />
          
          <SettingsItem
            icon="doc.text.fill"
            title="Privacy Policy"
            onPress={handlePrivacy}
          />
          
          <SettingsItem
            icon="doc.plaintext.fill"
            title="Terms of Service"
            onPress={handleTerms}
          />
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <View style={[styles.settingsIcon, { backgroundColor: '#FF4444' + '20' }]}>
              <IconSymbol name="arrow.right.square.fill" size={20} color="#FF4444" />
            </View>
            <Text style={[styles.logoutText, { color: '#FF4444' }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: isDark ? '#666' : '#999' }]}>
            WhamPay v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 20,
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
  },
});