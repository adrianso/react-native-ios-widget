import { Platform } from "react-native";
import { requireNativeModule } from "expo-modules-core";

const ExpoWidget =
  Platform.OS === "ios"
    ? requireNativeModule("ReactNativeWidgetExtension")
    : undefined;

const checkWidgetSupport = () => {
  if (Platform.OS === "ios") {
    return parseInt(Platform.Version, 10) >= 14;
  }

  return false;
};

const supportWidgets = checkWidgetSupport();

export const reloadAllTimelines = async () => {
  if (!supportWidgets || !ExpoWidget) {
    return;
  }

  await ExpoWidget.reloadAllTimelines();
};
