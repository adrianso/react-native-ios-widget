import { XcodeProject } from "expo/config-plugins";

/**
 * Reads IPHONEOS_DEPLOYMENT_TARGET from the main application target, so the
 * widget extension can default to the same minimum iOS version as the host app.
 */
export function getMainAppDeploymentTarget(
  xcodeProject: XcodeProject
): string | undefined {
  const appTarget = Object.values(
    xcodeProject.pbxNativeTargetSection() as Record<string, any>
  ).find(
    (target) =>
      target?.productType &&
      String(target.productType).replace(/"/g, "") ===
        "com.apple.product-type.application"
  );

  const configurationLists =
    xcodeProject.hash.project.objects.XCConfigurationList;
  const buildConfigurations =
    xcodeProject.hash.project.objects.XCBuildConfiguration;
  const configurationList = appTarget
    ? configurationLists?.[appTarget.buildConfigurationList]
    : undefined;

  for (const entry of configurationList?.buildConfigurations ?? []) {
    const buildConfiguration = buildConfigurations?.[(entry as any).value];
    const deploymentTarget =
      buildConfiguration?.buildSettings?.IPHONEOS_DEPLOYMENT_TARGET;
    if (deploymentTarget) {
      return String(deploymentTarget).replace(/"/g, "");
    }
  }

  return undefined;
}
