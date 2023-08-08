import { Platform } from "react-native";
import ExpoWidget from "./ExpoModule";

const supportWidgets = (() => {
  if (Platform.OS === "ios") {
    return parseInt(Platform.Version, 10) >= 14;
  }

  return false;
})();

export const reloadAllTimelines = async () => {
  if (!supportWidgets || !ExpoWidget) {
    return;
  }

  await ExpoWidget.reloadAllTimelines();
};
