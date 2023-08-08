import { ConfigPlugin, withPlugins } from "expo/config-plugins";
import { withXcode } from "./withXcode";
import { withWidgetExtensionEntitlements } from "./withWidgetExtensionEntitlements";
import { withPodfile } from "./withPodfile";
import { withConfig } from "./withConfig";
import { WidgetPluginProps } from "./types";

const withWidget: ConfigPlugin<WidgetPluginProps> = (
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
  const props: WidgetPluginProps = {
    enabled,
    deploymentTarget,
    widgetsFolder,
    groupIdentifier,
    pods,
    targetName,
    bundleIdentifier,
  };

  return withPlugins(config, [
    [withXcode, props],
    [withWidgetExtensionEntitlements, props],
    [withPodfile, props],
    [withConfig, props],
  ]);
};

export default withWidget;
