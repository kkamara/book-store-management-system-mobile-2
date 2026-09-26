import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

const ErrorComponent = ({
  error,
  style,
}: {
  error: ErrorType,
  style?: ViewStyle,
}) => {
  return (
    <View style={[styles.view, style ? style : null]}>
      <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
        {error || ""}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: "red",
    fontSize: 18,
  },
  view: {
    minHeight: 22,
    maxHeight: 62,
    width: 300,
  },
});

export default ErrorComponent;