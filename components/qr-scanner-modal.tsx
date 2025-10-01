import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  autoOpenCamera?: boolean;
}

export default function QRScannerModal({ visible, onClose, autoOpenCamera = false }: QRScannerModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(autoOpenCamera);

  const handleBarCodeScanned = ({ type, data }: any) => {
    setScanned(true);
    Alert.alert(
      'QR Code Scanned!',
      `Type: ${type}\nData: ${data}`,
      [
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
        },
        {
          text: 'Close',
          onPress: () => {
            setShowCamera(false);
            onClose();
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible, permission]);

  useEffect(() => {
    if (visible && autoOpenCamera && permission?.granted) {
      setShowCamera(true);
    }
  }, [visible, autoOpenCamera, permission]);

  const handleScanQR = () => {
    if (!permission?.granted) {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to scan QR codes.',
        [
          {
            text: 'Grant Permission',
            onPress: requestPermission,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }
    setShowCamera(true);
  };

  const handleGenerateQR = () => {
    Alert.alert(
      'Generate QR',
      'Your payment QR code will be generated here.',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  const handleManualEntry = () => {
    Alert.alert(
      'Manual Entry',
      'Enter wallet address manually functionality will be implemented.',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  // Camera View
  if (showCamera && permission?.granted) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
          >
            {/* Overlay */}
            <View style={styles.overlay}>
              {/* Header */}
              <View style={styles.cameraHeader}>
                <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.cameraCloseButton}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <IconSymbol name="xmark" size={16} color="white" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Scanner Frame */}
              <View style={styles.scannerFrame}>
                <View style={styles.scannerOverlay}>
                  <View style={styles.scannerTopLeft} />
                  <View style={styles.scannerTopRight} />
                  <View style={styles.scannerBottomLeft} />
                  <View style={styles.scannerBottomRight} />
                </View>
              </View>

              {/* Instructions */}
              <View style={styles.cameraInstructionsContainer}>
                <Text style={styles.cameraInstructionsText}>
                  Position QR code within the frame to scan
                </Text>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
    );
  }

  // Main Modal View
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={20} color={isDark ? '#FFF' : '#333'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>
            QR Scanner
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {/* Scanner Placeholder */}
          <View style={[styles.scannerContainer, { borderColor: isDark ? '#333' : '#E5E5E5' }]}>
            <View style={styles.scannerFrame}>
              <IconSymbol name="qrcode.viewfinder" size={80} color="#007B50" />
              <Text style={[styles.scannerText, { color: isDark ? '#AAA' : '#666' }]}>
                Point your camera at a QR code
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity onPress={handleScanQR} style={styles.scanButton}>
              <LinearGradient
                colors={['#007B50', '#005A3C']}
                style={styles.buttonGradient}
              >
                <IconSymbol name="camera.fill" size={24} color="white" />
                <Text style={styles.scanButtonText}>Scan QR Code</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGenerateQR} style={styles.generateButton}>
              <View style={[styles.buttonContent, { backgroundColor: isDark ? '#333' : '#FFF', borderWidth: 1, borderColor: '#007B50' }]}>
                <IconSymbol name="qrcode" size={24} color="#007B50" />
                <Text style={[styles.generateButtonText, { color: '#007B50' }]}>Generate My QR</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleManualEntry} style={styles.manualButton}>
              <View style={[styles.buttonContent, { backgroundColor: isDark ? '#333' : '#FFF', borderWidth: 1, borderColor: '#2196F3' }]}>
                <IconSymbol name="doc.text.fill" size={24} color="#2196F3" />
                <Text style={[styles.manualButtonText, { color: '#2196F3' }]}>Manual Entry</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={[styles.instructionsTitle, { color: isDark ? '#FFF' : '#333' }]}>
              How to use:
            </Text>
            <Text style={[styles.instructionText, { color: isDark ? '#AAA' : '#666' }]}>
              • Scan QR codes to quickly send payments
            </Text>
            <Text style={[styles.instructionText, { color: isDark ? '#AAA' : '#666' }]}>
              • Generate your QR code for others to pay you
            </Text>
            <Text style={[styles.instructionText, { color: isDark ? '#AAA' : '#666' }]}>
              • Enter wallet addresses manually if needed
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scannerContainer: {
    height: 280,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  scannerFrame: {
    alignItems: 'center',
  },
  scannerText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  actionContainer: {
    gap: 16,
    marginBottom: 30,
  },
  scanButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#007B50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  manualButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    paddingTop: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  cameraCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerOverlay: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scannerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#007B50',
  },
  scannerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#007B50',
  },
  scannerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#007B50',
  },
  scannerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#007B50',
  },
  cameraInstructionsContainer: {
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cameraInstructionsText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});