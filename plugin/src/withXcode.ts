import { ConfigPlugin, withXcodeProject } from "expo/config-plugins";
import * as fs from "fs";
import * as path from "path";

import { addXCConfigurationList } from "./xcode/addXCConfigurationList";
import { addProductFile } from "./xcode/addProductFile";
import { addToPbxNativeTargetSection } from "./xcode/addToPbxNativeTargetSection";
import { addToPbxProjectSection } from "./xcode/addToPbxProjectSection";
import { addTargetDependency } from "./xcode/addTargetDependency";
import { addPbxGroup } from "./xcode/addPbxGroup";
import { addBuildPhases } from "./xcode/addBuildPhases";
import { getWidgetFiles } from "./lib/getWidgetFiles";
import { WidgetConfig } from "./types";

export const withXcode: ConfigPlugin<Required<WidgetConfig>> = (
  config,
  { enabled, targetName, bundleIdentifier, deploymentTarget, widgetsFolder }
) => {
  return withXcodeProject(config, (config) => {
    const { platformProjectRoot, projectRoot } = config.modRequest;

    const widgetsPath = path.join(projectRoot, widgetsFolder);
    const moduleRoot = path.join(
      projectRoot,
      "node_modules",
      "react-native-ios-widget",
      "ios"
    );

    if (!enabled) {
      ensureModuleSwift(widgetsPath, moduleRoot);
      return config;
    }

    const targetPath = path.join(platformProjectRoot, targetName);
    const widgetFiles = getWidgetFiles(widgetsPath, targetPath, moduleRoot);

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

const ensureModuleSwift = (widgetsPath: string, moduleRoot: string) => {
  // Ensure the pod source dir exists for Module.swift.
  if (!fs.existsSync(moduleRoot)) {
    fs.mkdirSync(moduleRoot, { recursive: true });
  }

  // Prefer the real Module.swift from widgets if it exists.
  const moduleSwiftPath = path.join(widgetsPath, "Module.swift");
  const targetPath = path.join(moduleRoot, "Module.swift");
  if (fs.existsSync(moduleSwiftPath)) {
    fs.copyFileSync(moduleSwiftPath, targetPath);
    return;
  }

  // If widgets are disabled and no real Module.swift exists, write a stub
  // so CocoaPods still builds a Swift module and avoids import errors.
  if (!fs.existsSync(targetPath)) {
    const stubModule = [
      "import ExpoModulesCore",
      "",
      "public class ReactNativeWidgetExtensionModule: Module {",
      "  public func definition() -> ModuleDefinition {",
      '    Name("ReactNativeWidgetExtension")',
      "  }",
      "}",
      "",
    ].join("\n");
    fs.writeFileSync(targetPath, stubModule);
  }
};
