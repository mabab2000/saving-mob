import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/contexts/ThemeContext';
import { getHomeData, uploadProfilePhoto } from '@/services/api';
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

  // Fetch home data when component loads or userId changes
  useEffect(() => {
    if (userId) {
      fetchHomeData();
    }
  }, [userId]);

  const fetchHomeData = async () => {
    if (!userId) return;
    
    try {
      setIsLoadingHomeData(true);
      const data = await getHomeData(userId, accessToken || undefined);
      setHomeData(data);
      
      // Set profile image if available
      if (data.image_preview_link) {
        let fullImageUrl;
        
        // Check if the image_preview_link is already a full URL
        if (data.image_preview_link.startsWith('http')) {
          // It's already a full URL, but check for typos and fix them
          fullImageUrl = data.image_preview_link.replace('aving-api.mababa.app', 'saving-api.mababa.app');
        } else {
          // It's a relative path, construct the full URL
          const cleanPath = data.image_preview_link.replace(/\\/g, '/');
          fullImageUrl = `${SERVER_BASE_URL}/${cleanPath}`;
        }
        
        console.log('Setting profile image URL:', fullImageUrl);
        setProfileImageUri(fullImageUrl);
      } else {
        console.log('No image_preview_link in API response');
        setProfileImageUri(null);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setIsLoadingHomeData(false);
    }
  };

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

      // Immediately refresh home data to get updated profile image
      await fetchHomeData();
      
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
                  : require('@/assets/images/image.jpg')
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
                <ThemedText style={[styles.cardAmount, { color: colors.primary }]}>
                  {isLoadingHomeData ? 'Loading...' : homeData ? `${homeData.total_saving?.toLocaleString()} RWF` : '0 RWF'}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={[styles.actionCard, { borderColor: colors.warning + '30', backgroundColor: colors.warning + '10' }]}>
              <ThemedView style={styles.actionContent}>
                <Ionicons name="card" size={40} color={colors.warning} />
                <ThemedText style={[styles.actionText, styles.cardTitle]}>Current Loan</ThemedText>
                <ThemedText style={[styles.cardAmount, { color: colors.warning }]}>
                  {isLoadingHomeData ? 'Loading...' : homeData ? `${homeData.total_loan?.toLocaleString()} RWF` : '0 RWF'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Recent Transactions */}
        <ThemedView style={styles.transactionsSection}>
          <ThemedText style={styles.sectionTitle}>Latest saving Transactions</ThemedText>
          
          {isLoadingHomeData ? (
            <ThemedView style={[styles.transactionCard, { borderColor: colors.icon + '15' }]}>
              <ThemedView style={[styles.transactionIcon, { backgroundColor: colors.icon + '15' }]}>
                <Ionicons name="time" size={24} color={colors.icon} />
              </ThemedView>
              <ThemedView style={styles.transactionDetails}>
                <ThemedText style={styles.transactionTitle}>Loading...</ThemedText>
                <ThemedText style={styles.transactionDate}>Please wait</ThemedText>
              </ThemedView>
              <ThemedText style={[styles.transactionAmount, { color: colors.icon }]}>
                ...
              </ThemedText>
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
