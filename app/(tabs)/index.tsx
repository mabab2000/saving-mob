import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState, useRef } from 'react';
import { Alert, Dimensions, Modal, Pressable, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/contexts/ThemeContext';
import { uploadProfilePhoto, getProfilePhoto } from '@/services/api';
import { SERVER_BASE_URL } from '@/config/api';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { phoneNumber, userId, accessToken } = useAuth();
  const [showImageModal, setShowImageModal] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [homeData, setHomeData] = useState<any>(null);
  const [isLoadingHomeData, setIsLoadingHomeData] = useState(true);

  // WebSocket connection for live home data
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    let closedByUser = false;

    const connect = () => {
      // Convert SERVER_BASE_URL (http(s)) to ws(s)
      const base = SERVER_BASE_URL.replace(/^http/, 'ws');
      const wsUrl = `${base}/api/home/${userId}`;

      console.log('Connecting to Home WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Home WebSocket connected');
        setIsLoadingHomeData(false);
      };

      ws.onmessage = (event) => {
        try {
              const data = JSON.parse(event.data);
              console.log('Home WebSocket message received:', data);
              setHomeData(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message for home data:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('Home WebSocket error:', err);
      };

      ws.onclose = (ev) => {
        wsRef.current = null;
        console.log('Home WebSocket closed', ev.code, ev.reason);
        if (!closedByUser) {
          // Attempt reconnection with backoff
          const timeout = 2000; // 2s backoff — could be exponential
          reconnectTimerRef.current = setTimeout(() => connect(), timeout) as unknown as number;
          console.log(`Reconnecting Home WebSocket in ${timeout}ms...`);
        }
      };
    };

    // Start connection
    setIsLoadingHomeData(true);
    connect();

    return () => {
      closedByUser = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current as any);
      }
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          /* ignore */
        }
        wsRef.current = null;
      }
    };
  }, [userId]);

  // Fetch profile image from REST endpoint (use when websocket doesn't provide image)
  useEffect(() => {
    if (!userId) return;

    const fetchPhoto = async () => {
      try {
        const result = await getProfilePhoto(userId, accessToken || undefined);
        console.log('getProfilePhoto result:', result);

        // Try common fields where the API might store the photo URL/path
        let photoValue: any = null;
        if (!result) photoValue = null;
        else if (typeof result === 'string') photoValue = result;
        else if (result.photo) photoValue = result.photo;
  // Check known response shapes
  else if ((result as any).image_preview_link) photoValue = (result as any).image_preview_link;
  else if ((result as any).image) photoValue = (result as any).image;
  else if ((result as any).url) photoValue = (result as any).url;
  else if ((result as any).photo_url) photoValue = (result as any).photo_url;
  else if ((result as any).data && (result as any).data.photo) photoValue = (result as any).data.photo;
  else if (Array.isArray(result) && result.length > 0 && result[0].photo) photoValue = result[0].photo;

        if (photoValue && typeof photoValue === 'string') {
          let fullImageUrl = photoValue;
          // If it's a relative path, prefix with server base
          if (!fullImageUrl.startsWith('http')) {
            const cleanPath = fullImageUrl.replace(/\\/g, '/').replace(/^\//, '');
            fullImageUrl = `${SERVER_BASE_URL}/${cleanPath}`;
          }
          console.log('Resolved profile image URL:', fullImageUrl);
          setProfileImageUri(fullImageUrl);
        } else {
          console.log('No profile photo value found in getProfilePhoto response');
          setProfileImageUri(null);
        }
      } catch (error) {
        console.error('Error fetching profile photo from REST endpoint:', error);
      }
    };

    fetchPhoto();
  }, [userId]);

  // Format phone number for display
  const formatPhoneForDisplay = (phone: string | null) => {
    if (!phone) return '';
    // For Rwanda numbers (+250123456789), show +250****6789
    if (phone.startsWith('+250') && phone.length >= 13) {
      return `+250****${phone.slice(-3)}`;
    }
    return phone.length > 10 ? `${phone.slice(0, 4)}****${phone.slice(-3)}` : phone;
  };

  const handleImageUpload = () => {
    setShowImageModal(true);
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const cropImage = async (imageUri: string) => {
    try {
      // Get image info to determine original dimensions
      const asset = await ImageManipulator.manipulateAsync(imageUri, [], {});
      const { width: originalWidth, height: originalHeight } = asset;
      
      console.log('Original image dimensions:', { originalWidth, originalHeight });
      
      // Calculate square crop dimensions (use the smaller dimension)
      const cropSize = Math.min(originalWidth, originalHeight);
      const originX = Math.floor((originalWidth - cropSize) / 2);
      const originY = Math.floor((originalHeight - cropSize) / 2);
      
      console.log('Crop parameters:', { cropSize, originX, originY });
      
      // Crop to center square first, then resize
      const croppedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { 
            crop: { 
              originX, 
              originY, 
              width: cropSize, 
              height: cropSize 
            } 
          }
        ],
        { 
          compress: 1.0, // Don't compress yet
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );
      
      // Now resize to final size with compression
      const finalImage = await ImageManipulator.manipulateAsync(
        croppedImage.uri,
        [
          { resize: { width: 400, height: 400 } }
        ],
        { 
          compress: 0.8, 
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );
      
      console.log('Final cropped image:', finalImage);
      return finalImage.uri;
    } catch (error) {
      console.error('Error cropping image:', error);
      Alert.alert('Error', 'Failed to crop image. Please try again.');
      return null;
    }
  };

  const handleImageOption = async (option: string) => {
    setShowImageModal(false);
    
    if (option === 'Remove') {
      setProfileImageUri(null);
      Alert.alert('Success', 'Profile photo removed successfully!');
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      let result: ImagePicker.ImagePickerResult;

      if (option === 'Camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false, // We'll handle cropping manually
          quality: 1.0, // Use highest quality for better cropping
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false, // We'll handle cropping manually
          quality: 1.0, // Use highest quality for better cropping
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Crop the image
        const croppedUri = await cropImage(selectedImage.uri);
        if (croppedUri) {
          setProfileImageUri(croppedUri);
          
          Alert.alert(
            'Upload Image',
            'Do you want to upload this image as your profile photo?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Upload', 
                onPress: () => uploadImage(croppedUri),
                style: 'default'
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadImage = async (imageUri: string) => {
    try {
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        return;
      }

      // Show loading state
      Alert.alert('Uploading...', 'Please wait while we upload your image.');

      // Use the centralized API service
      const result = await uploadProfilePhoto(userId, imageUri, accessToken || undefined);
      
      console.log('Upload success:', result);

      Alert.alert('Success!', 'Profile photo updated successfully!', [
        { text: 'OK' }
      ]);

      // Immediately update profile image from upload response if available
      if (result && result.photo) {
        let fullImageUrl = result.photo;
        if (!fullImageUrl.startsWith('http')) {
          const cleanPath = fullImageUrl.replace(/\\/g, '/');
          fullImageUrl = `${SERVER_BASE_URL}/${cleanPath}`;
        }
        setProfileImageUri(fullImageUrl);
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>SAVING</ThemedText>
        {phoneNumber && (
          <ThemedText style={styles.welcomeText}>
            Welcome, {formatPhoneForDisplay(phoneNumber)}
          </ThemedText>
        )}
      </ThemedView>

      {/* Main Content */}
      <ThemedView style={styles.content}>
        {/* Profile Image Section */}
        <ThemedView style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <Image
              key={profileImageUri} // Force re-render when image changes
              source={
                profileImageUri 
                  ? { uri: profileImageUri }
                  : require('@/assets/images/logo.jpg')
              }
              style={styles.profileImage}
              contentFit="cover"
              onLoad={() => console.log('Image loaded successfully:', profileImageUri)}
              onError={(error) => console.log('Image load error:', error, 'URL:', profileImageUri)}
            />
            {/* Upload Button */}
            <Pressable 
              style={[styles.uploadButton, { backgroundColor: colors.primary }]}
              onPress={handleImageUpload}
            >
              <Ionicons name="add" size={24} color="white" />
            </Pressable>
          </View>
          
          {/* Money Display */}
          
        </ThemedView>

        {/* Financial Overview */}
        <ThemedView style={styles.quickActions}>
          <ThemedText style={styles.sectionTitle}>Saving Overview</ThemedText>
          
          <ThemedView style={styles.actionGrid}>
            <ThemedView style={[styles.actionCard, { borderColor: colors.primary + '30', backgroundColor: colors.primary + '10' }]}>
              <ThemedView style={styles.actionContent}>
                <Ionicons name="trending-up" size={40} color={colors.primary} />
                <ThemedText style={[styles.actionText, styles.cardTitle]}>Total Saving</ThemedText>
                <ThemedView style={{ minHeight: 28, justifyContent: 'center', alignItems: 'center' }}>
                  {isLoadingHomeData ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <ThemedText style={[styles.cardAmount, { color: colors.primary }]}>
                      {homeData ? `${homeData.total_saving?.toLocaleString()} RWF` : '0 RWF'}
                    </ThemedText>
                  )}
                </ThemedView>
              </ThemedView>
            </ThemedView>

            <ThemedView style={[styles.actionCard, { borderColor: colors.warning + '30', backgroundColor: colors.warning + '10' }]}>
              <ThemedView style={styles.actionContent}>
                <Ionicons name="card" size={40} color={colors.warning} />
                <ThemedText style={[styles.actionText, styles.cardTitle]}>Current Loan</ThemedText>
                <ThemedView style={{ minHeight: 28, justifyContent: 'center', alignItems: 'center' }}>
                  {isLoadingHomeData ? (
                    <ActivityIndicator size="small" color={colors.warning} />
                  ) : (
                    <ThemedText style={[styles.cardAmount, { color: colors.warning }]}>
                      {homeData ? `${homeData.total_loan?.toLocaleString()} RWF` : '0 RWF'}
                    </ThemedText>
                  )}
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Recent Transactions */}
        <ThemedView style={styles.transactionsSection}>
          <ThemedText style={styles.sectionTitle}>Latest saving Transactions</ThemedText>
          
          {isLoadingHomeData ? (
            <ThemedView style={[styles.transactionCard, { borderColor: colors.icon + '15', justifyContent: 'center', alignItems: 'center', paddingVertical: 24 }]}>
              <ActivityIndicator size="large" color={colors.icon} />
            </ThemedView>
          ) : homeData?.latest_saving_info ? (
            <ThemedView style={[styles.transactionCard, { borderColor: colors.icon + '15' }]}>
              <ThemedView style={[styles.transactionIcon, { backgroundColor: colors.icon + '15' }]}>
                <Ionicons name="add-circle" size={24} color={colors.income} />
              </ThemedView>
              <ThemedView style={styles.transactionDetails}>
                <ThemedText style={styles.transactionTitle}>Saving Deposit</ThemedText>
                <ThemedText style={styles.transactionDate}>
                  {new Date(homeData.latest_saving_info.year, homeData.latest_saving_info.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </ThemedText>
              </ThemedView>
              <ThemedText style={[styles.transactionAmount, { color: colors.income }]}>
                +{homeData.latest_saving_info.amount?.toLocaleString()} RWF
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={[styles.transactionCard, { borderColor: colors.icon + '15' }]}>
              <ThemedView style={[styles.transactionIcon, { backgroundColor: colors.icon + '15' }]}>
                <Ionicons name="document" size={24} color={colors.icon} />
              </ThemedView>
              <ThemedView style={styles.transactionDetails}>
                <ThemedText style={styles.transactionTitle}>No transactions</ThemedText>
                <ThemedText style={styles.transactionDate}>Start saving today</ThemedText>
              </ThemedView>
              <ThemedText style={[styles.transactionAmount, { color: colors.icon }]}>
                0 RWF
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>

      {/* Image Upload Modal */}
      <Modal
        visible={showImageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowImageModal(false)}
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <ThemedView style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Change Profile Photo</ThemedText>
            <Pressable 
              style={[styles.closeButton, { backgroundColor: colors.icon + '20' }]}
              onPress={() => setShowImageModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.icon} />
            </Pressable>
          </ThemedView>

          {/* Upload Options */}
          <ThemedView style={styles.modalContent}>
            <Pressable 
              style={[styles.optionButton, { borderColor: colors.icon + '30' }]}
              onPress={() => handleImageOption('Camera')}
            >
              <Ionicons name="camera" size={32} color={colors.primary} />
              <ThemedText style={styles.optionText}>Take Photo</ThemedText>
            </Pressable>

            <Pressable 
              style={[styles.optionButton, { borderColor: colors.icon + '30' }]}
              onPress={() => handleImageOption('Gallery')}
            >
              <Ionicons name="images" size={32} color={colors.primary} />
              <ThemedText style={styles.optionText}>Choose from Gallery</ThemedText>
            </Pressable>

            <Pressable 
              style={[styles.optionButton, { borderColor: colors.error + '30' }]}
              onPress={() => handleImageOption('Remove')}
            >
              <Ionicons name="trash" size={32} color={colors.error} />
              <ThemedText style={[styles.optionText, { color: colors.error }]}>Remove Photo</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  imageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 40, // 50% border radius
  },
  moneySection: {
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  moneyAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  quickActions: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: (screenWidth - 52) / 2, // Account for padding and gap
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionContent: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
    minHeight: 140,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  loanAmount: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  transactionsSection: {
    marginBottom: 40,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
