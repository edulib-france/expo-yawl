import { nativeApplicationVersion } from "expo-application";
import { deviceType, DeviceType, osName, osVersion } from "expo-device";

export type YawlDeviceInfo = {
  app_version?: string;
  device_type?: string;
  os?: string;
  os_version?: string;
  platform: string;
};
export const getDeviceInfo = (): YawlDeviceInfo => {
  return {
    app_version: nativeApplicationVersion ?? undefined,
    device_type: DeviceType[deviceType ?? 0],
    os: osName ?? undefined,
    os_version: osVersion ?? undefined,
    platform: "react-native",
  };
};
