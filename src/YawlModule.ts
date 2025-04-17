import wretch from "wretch";
// declare class YawlModule extends NativeModule<YawlModuleEvents> {
//   PI: number;
//   hello(): string;
//   setValueAsync(value: string): Promise<void>;
// }

// This call loads the native module object from the JSI.
// export default requireNativeModule<YawlModule>("Yawl");

export default {
  hello: () => wretch("https://api.github.com").get().text(),
};
