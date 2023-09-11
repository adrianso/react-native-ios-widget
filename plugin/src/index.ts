import { ConfigPlugin, withPlugins } from "expo/config-plugins";
import { withXcode } from "./withXcode";
import { withWidgetExtensionEntitlements } from "./withWidgetExtensionEntitlements";
import { withPodfile } from "./withPodfile";
import { withConfig } from "./withConfig";
import { WidgetConfig } from "./types";

const withWidget: ConfigPlugin<WidgetConfig> = (
  config,
  {
    enabled = true,
    deploymentTarget = "14.0",
    widgetsFolder = "widgets",
    groupIdentifier,
    pods = [],
    targetName = "WidgetsExtension",
    bundleIdentifier = `${config.ios?.bundleIdentifier}.Widgets`,
  }
) => {
  const widget: WidgetConfig = {
    enabled,
    deploymentTarget,
    widgetsFolder,
    groupIdentifier,
    pods,
    targetName,
    bundleIdentifier,
  };

  return withPlugins(config, [
    [withXcode, widget],
    [withWidgetExtensionEntitlements, widget],
    [withPodfile, widget],
    [withConfig, widget],
  ]);
};

export default withWidget;
