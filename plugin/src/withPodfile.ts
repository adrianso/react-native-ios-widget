import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";
import { ConfigPlugin, withDangerousMod } from "expo/config-plugins";
import * as fs from "fs";
import * as path from "path";
import { WidgetConfig } from "./types";

export const withPodfile: ConfigPlugin<Required<WidgetConfig>> = (
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
        tag: "react-native-ios-widget",
        src: podFileContent,
        newSrc: `\t\tinstaller.pods_project.targets.each do |target|
\t\t\ttarget.build_configurations.each do |config|
\t\t\t\tconfig.build_settings['APPLICATION_EXTENSION_API_ONLY'] = 'No'
\t\t\tend
\t\tend`,
        anchor:
          /installer.target_installation_results.pod_target_installation_results/,
        offset: 8,
        comment: "\t\t#",
      }).contents;

      podFileContent = podFileContent
        .concat(`\n\n# >>> Inserted by react-native-ios-widget\n`)
        .concat(
          `target '${targetName}' do
\tuse_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
\tuse_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

  ${pods.map((pod) => `\tpod '${pod}'`).join("\n")}
end`
        )
        .concat(`\n# >>> Inserted by react-native-ios-widget`);

      fs.writeFileSync(podFilePath, podFileContent);

      return config;
    },
  ]);
};
