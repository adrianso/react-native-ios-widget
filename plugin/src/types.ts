export interface WidgetPluginProps {
  enabled?: boolean;
  widgetsFolder?: string;
  deploymentTarget?: string;
  groupIdentifier: string;
  pods?: string[];
  targetName?: string;
  bundleIdentifier?: string;
}
