import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Text, View } from "react-native";
import { Button, Muted } from "@/src/components/ui";
import { photoFromAsset, type ChildPhoto } from "@/src/lib/portraits";
import { colors } from "@/src/lib/theme";

export function ChildPhotoField({
  value,
  onChange,
}: {
  value: ChildPhoto | null;
  onChange: (next: ChildPhoto | null) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function pick(from: "camera" | "library") {
    setPending(true);
    setError(null);
    try {
      if (from === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError("Camera permission is needed for a photo.");
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.7,
        });
        if (!result.canceled && result.assets[0]) {
          onChange(photoFromAsset(result.assets[0]));
        }
        return;
      }
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError("Photo library permission is needed.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        onChange(photoFromAsset(result.assets[0]));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: colors.navy, fontSize: 20, fontWeight: "700" }}>Optional photo</Text>
      <Muted>
        Take a picture or upload one. We use it only to draw three storybook pictures, then discard it. We do not
        store photos of your child.
      </Muted>
      {value ? (
        <View style={{ gap: 8 }}>
          <Image
            source={{ uri: value.uri }}
            style={{
              width: 160,
              height: 160,
              borderRadius: 16,
              backgroundColor: colors.border,
            }}
          />
          <Text style={{ color: colors.navy, fontWeight: "700" }}>Photo added. We will use it once, then discard it.</Text>
        </View>
      ) : null}
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <Button label="Take a photo" pending={pending} onPress={() => pick("camera")} />
      <Button label="Upload a photo" variant="secondary" pending={pending} onPress={() => pick("library")} />
      {value ? (
        <Button label="Remove photo" variant="secondary" onPress={() => onChange(null)} />
      ) : null}
    </View>
  );
}
