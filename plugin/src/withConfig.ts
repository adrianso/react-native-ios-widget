import { ConfigPlugin } from "expo/config-plugins";
import {
  addApplicationGroupsEntitlement,
  getWidgetExtensionEntitlements,
} from "./lib/getWidgetExtensionEntitlements";
import { WidgetPluginProps } from "./types";

export const withConfig: ConfigPlugin<Required<WidgetPluginProps>> = (
  config,
  { enabled, groupIdentifier, targetName, bundleIdentifier }
) => {
  if (!enabled) {
    return config;
  }

  let configIndex: null | number = null;
  config.extra?.eas?.build?.experimental?.ios?.appExtensions?.forEach(
    (ext: any, index: number) => {
      if (ext.targetName === targetName) {
        configIndex = index;
      }
    }
  );

  if (!configIndex) {
    config.extra = {
      ...config.extra,
      eas: {
        ...config.extra?.eas,
        build: {
          ...config.extra?.eas?.build,
          experimental: {
            ...config.extra?.eas?.build?.experimental,
            ios: {
              ...config.extra?.eas?.build?.experimental?.ios,
              appExtensions: [
                ...(config.extra?.eas?.build?.experimental?.ios
                  ?.appExtensions ?? []),
                {
                  targetName,
                  bundleIdentifier,
                },
              ],
            },
          },
        },
      },
    };
    configIndex = 0;
  }

  if (configIndex != null && config.extra) {
    const widgetsExtensionConfig =
      config.extra.eas.build.experimental.ios.appExtensions[configIndex];

    widgetsExtensionConfig.entitlements = {
      ...widgetsExtensionConfig.entitlements,
      ...getWidgetExtensionEntitlements(config.ios, {
        groupIdentifier,
      }),
    };

    config.ios = {
      ...config.ios,
      entitlements: {
        ...addApplicationGroupsEntitlement(
          config.ios?.entitlements ?? {},
          groupIdentifier
        ),
      },
    };
  }

  return config;
};
