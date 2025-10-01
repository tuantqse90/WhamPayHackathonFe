import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
} from 'react-native';
import ProfileView from './profile-view';

interface Friend {
  id: string;
  name: string;
  username: string;
  status: string;
  avatar: string;
}

interface ProfileModalProps {
  visible: boolean;
  friend: Friend | null;
  onClose: () => void;
}

export default function ProfileModal({ visible, friend, onClose }: ProfileModalProps) {
  if (!friend) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ProfileView friend={friend} onBack={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});