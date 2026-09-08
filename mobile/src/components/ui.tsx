import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useInAppChrome } from "@/src/components/chrome-context";
import { bottomSafeInset, topSafeInset } from "@/src/lib/safe-area";
import { colors } from "@/src/lib/theme";

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const inChrome = useInAppChrome();
  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: inChrome ? 16 : topSafeInset(insets) + 20,
          paddingBottom: inChrome ? 24 : bottomSafeInset(insets) + 20,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Field({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, props.multiline ? styles.multiline : null]}
        {...props}
      />
    </View>
  );
}

export function Button({
  label,
  onPress,
  disabled,
  pending,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  pending?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || pending}
      style={[
        styles.button,
        variant === "secondary" && styles.buttonSecondary,
        variant === "danger" && styles.buttonDanger,
        (disabled || pending) && styles.buttonDisabled,
      ]}
    >
      {pending ? (
        <ActivityIndicator color={variant === "secondary" ? colors.navy : colors.white} />
      ) : (
        <Text
          style={[
            styles.buttonLabel,
            variant === "secondary" && { color: colors.navy },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) return null;
  return <Text style={styles.error}>{children}</Text>;
}

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    gap: 14,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    color: colors.navy,
    fontWeight: "700",
  },
  muted: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.navy,
    fontWeight: "700",
    fontSize: 14,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    color: colors.foreground,
    fontSize: 16,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  button: {
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonLabel: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: colors.danger,
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
});
