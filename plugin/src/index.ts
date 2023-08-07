import { ConfigPlugin, withPlugins } from "expo/config-plugins";
import { withXcode } from "./withXcode";
import { withWidgetExtensionEntitlements } from "./withWidgetExtensionEntitlements";
import { withPodfile } from "./withPodfile";
import { withConfig } from "./withConfig";

const withWidget: ConfigPlugin<{
  widgetsFolder?: string;
  deploymentTarget?: string;
  groupIdentifier?: string;
  pods?: string[];
  widgetName: string;
}> = (
  config,
  {
    deploymentTarget = "14.0",
    widgetsFolder = "widgets",
    groupIdentifier,
    pods,
  }
) => {
  const targetName = "WidgetsExtension";
  const bundleIdentifier = `${config.ios?.bundleIdentifier}.Widgets`;

  return withPlugins(config, [
    [
      withXcode,
      {
        targetName,
        bundleIdentifier,
        deploymentTarget,
        widgetsFolder,
      },
    ],
    [withWidgetExtensionEntitlements, { targetName, groupIdentifier }],
    [withPodfile, { targetName, pods }],
    [withConfig, { targetName, bundleIdentifier, groupIdentifier }],
  ]);
};

export default withWidget;
