import Button from "@/components/Button";
import { View } from "@/components/Themed";
import { useAccounts } from "@/providers/AccountsProvider";
import { isCustomErrorResponse } from "@/typeHandlers";
import { useEffect, useState, } from 'react';
import { Image, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

interface Props {
  style?: object;
  user: UserResponse | null;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  onUploadAvatar: () => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
}

const UpdateAvatar = ({
  style,
  user,
  setError,
  setLoading,
  onUploadAvatar,
  onRemoveAvatar,
}: Props) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { uploadAvatar, removeAvatar } = useAccounts();

  useEffect(() => {
    setImageUri(user?.avatarPath || null);
  }, [user]);

  async function handleRemove() {
    setLoading(true);
    setError("");
    try {
      const response = await removeAvatar();
      if (true === isCustomErrorResponse(response)) {
        setError(response.error || "Something went wrong.");
        return;
      }
      await onRemoveAvatar();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    setLoading(true);
    setError("");
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      const asset = result.assets?.[0];
      if (!result.didCancel && asset?.uri) {
        const response = await uploadAvatar({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          fileName: asset.fileName || 'avatar.jpg',
        });

        if (true === isCustomErrorResponse(response)) {
          setError(response.error || "Something went wrong.");
          setLoading(false);
          return;
        }

        await onUploadAvatar();
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: imageUri || undefined }}
        style={styles.image}
      />
      <View style={styles.buttonsView}>
        <Button
          pressableStyle={styles.uploadAvatarButton}
          textStyle={styles.uploadAvatarButtonText}
          onPress={handleUpload}
          text="Upload"
        />
        <Button
          onPress={handleRemove}
          pressableStyle={styles.removeAvatarButton}
          textStyle={styles.removeAvatarButtonText}
          text="Remove Photo"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonsView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 45,
  },
  removeAvatarButton: {
    backgroundColor: 'red',
    width: 130,
  },
  removeAvatarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginVertical: -10,
  },
  uploadAvatarButton: {
    width: 130,
    marginBottom: 7,
    borderWidth: 0,
  },
  uploadAvatarButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    marginVertical: -10,
    textAlign: 'center',
  },
});

export default UpdateAvatar;
