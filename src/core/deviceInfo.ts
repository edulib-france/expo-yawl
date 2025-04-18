import {
  getDeviceType,
  getReadableVersion,
  getSystemName,
  getSystemVersion,
} from "react-native-device-info";

export type YawlDeviceInfo = {
  app_version: string;
  device_type: string;
  os: string;
  os_version: string;
  platform: string;
};
export const getDeviceInfo = (): YawlDeviceInfo => {
  return {
    app_version: getReadableVersion(),
    device_type: getDeviceType(),
    os: getSystemName(),
    os_version: getSystemVersion(),
    platform: "react-native",
  };
};
