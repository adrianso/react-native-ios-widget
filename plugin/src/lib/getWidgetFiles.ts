import * as fs from "fs";
import * as path from "path";

export type WidgetFiles = {
  swiftFiles: string[];
  entitlementFiles: string[];
  plistFiles: string[];
  fontFiles: string[];
  assetDirectories: string[];
};

export const getWidgetFiles = (
  widgetsPath: string,
  targetPath: string,
  moduleRoot: string
) => {
  const widgetFiles: WidgetFiles = {
    swiftFiles: [],
    entitlementFiles: [],
    plistFiles: [],
    fontFiles: [],
    assetDirectories: [],
  };

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  // Ensure moduleRoot directory exists
  if (!fs.existsSync(moduleRoot)) {
    fs.mkdirSync(moduleRoot, { recursive: true });
  }

  // Check if Module.swift exists before proceeding
  const moduleSwiftPath = path.join(widgetsPath, "Module.swift");
  if (!fs.existsSync(moduleSwiftPath)) {
    throw new Error(
      `Module.swift not found at ${moduleSwiftPath}. ` +
        `The widgets folder must contain a Module.swift file for the ReactNativeWidgetExtension module to build correctly.`
    );
  }

  if (fs.lstatSync(widgetsPath).isDirectory()) {
    const files = fs.readdirSync(widgetsPath);

    files.forEach((file) => {
      const fileExtension = file.split(".").pop();

      if (fileExtension === "swift") {
        if (file !== "Module.swift") {
          widgetFiles.swiftFiles.push(file);
        }
      } else if (fileExtension === "entitlements") {
        widgetFiles.entitlementFiles.push(file);
      } else if (fileExtension === "plist") {
        widgetFiles.plistFiles.push(file);
      } else if (fileExtension === "ttf" || fileExtension === "otf") {
        widgetFiles.fontFiles.push(file);
      } else if (fileExtension === "xcassets") {
        widgetFiles.assetDirectories.push(file);
      }
    });
  }

  // Copy files
  [
    ...widgetFiles.swiftFiles,
    ...widgetFiles.entitlementFiles,
    ...widgetFiles.plistFiles,
    ...widgetFiles.fontFiles,
  ].forEach((file) => {
    const source = path.join(widgetsPath, file);
    copyFileSync(source, targetPath);
  });

  // Copy Module.swift to moduleRoot (package ios directory)
  copyFileSync(moduleSwiftPath, path.join(moduleRoot, "Module.swift"));

  // Copy directories
  widgetFiles.assetDirectories.forEach((directory) => {
    const imagesXcassetsSource = path.join(widgetsPath, directory);
    copyDirectorySync(imagesXcassetsSource, targetPath);
  });

  return widgetFiles;
};

const copyFileSync = (source: string, target: string) => {
  let targetFile = target;

  if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
    targetFile = path.join(target, path.basename(source));
  }

  fs.copyFileSync(source, targetFile);
};

const copyDirectorySync = (source: string, target: string) => {
  const targetPath = path.join(target, path.basename(source));
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach((file) => {
      const currentPath = path.join(source, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        copyDirectorySync(currentPath, targetPath);
      } else {
        copyFileSync(currentPath, targetPath);
      }
    });
  }
};
