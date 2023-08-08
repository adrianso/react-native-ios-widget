import { ConfigPlugin, withXcodeProject } from "expo/config-plugins";
import * as path from "path";

import { addXCConfigurationList } from "./xcode/addXCConfigurationList";
import { addProductFile } from "./xcode/addProductFile";
import { addToPbxNativeTargetSection } from "./xcode/addToPbxNativeTargetSection";
import { addToPbxProjectSection } from "./xcode/addToPbxProjectSection";
import { addTargetDependency } from "./xcode/addTargetDependency";
import { addPbxGroup } from "./xcode/addPbxGroup";
import { addBuildPhases } from "./xcode/addBuildPhases";
import { getWidgetFiles } from "./lib/getWidgetFiles";
import { WidgetPluginProps } from "./types";

export const withXcode: ConfigPlugin<Required<WidgetPluginProps>> = (
  config,
  { enabled, targetName, bundleIdentifier, deploymentTarget, widgetsFolder }
) => {
  return withXcodeProject(config, (config) => {
    const { platformProjectRoot, projectRoot } = config.modRequest;

    const widgetsPath = path.join(projectRoot, widgetsFolder);
    const targetPath = path.join(platformProjectRoot, targetName);
    const widgetFiles = getWidgetFiles(widgetsPath, targetPath);

    if (!enabled) {
      return config;
    }

    const xcodeProject = config.modResults;
    const marketingVersion = config.version;
    const xCConfigurationList = addXCConfigurationList(xcodeProject, {
      targetName,
      currentProjectVersion: config.ios!.buildNumber || "1",
      bundleIdentifier,
      deploymentTarget,
      marketingVersion,
    });

    const groupName = "Embed Foundation Extensions";
    const productFile = addProductFile(xcodeProject, {
      targetName,
      groupName,
    });

    const targetUuid = xcodeProject.generateUuid();
    const target = addToPbxNativeTargetSection(xcodeProject, {
      targetName,
      targetUuid,
      productFile,
      xCConfigurationList,
    });

    addToPbxProjectSection(xcodeProject, target);

    addTargetDependency(xcodeProject, target);

    addBuildPhases(xcodeProject, {
      targetUuid,
      groupName,
      productFile,
      widgetFiles,
    });

    addPbxGroup(xcodeProject, {
      targetName,
      widgetFiles,
    });

    return config;
  });
};
