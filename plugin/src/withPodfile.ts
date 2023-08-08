import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";
import { ConfigPlugin, withDangerousMod } from "expo/config-plugins";
import * as fs from "fs";
import * as path from "path";
import { WidgetPluginProps } from "./types";

export const withPodfile: ConfigPlugin<Required<WidgetPluginProps>> = (
  config,
  { enabled, targetName, pods }
) => {
  if (!enabled) {
    return config;
  }

  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podFilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let podFileContent = fs.readFileSync(podFilePath).toString();

      podFileContent = mergeContents({
        tag: "react-native-widget-extension-1",
        src: podFileContent,
        newSrc: `installer.pods_project.targets.each do |target|
          target.build_configurations.each do |config|
            config.build_settings['APPLICATION_EXTENSION_API_ONLY'] = 'No'
          end
        end`,
        anchor:
          /installer.target_installation_results.pod_target_installation_results/,
        offset: 0,
        comment: "#",
      }).contents;

      podFileContent = podFileContent
        .concat(`\n\n# >>> Inserted by react-native-widget-extension\n`)
        .concat(
          `target '${targetName}' do
            use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
            use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

            ${pods.map((pod) => `pod '${pod}'`).join("\n")}
          end`
        )
        .concat(`\n# >>> Inserted by react-native-widget-extension`);

      fs.writeFileSync(podFilePath, podFileContent);

      return config;
    },
  ]);
};
