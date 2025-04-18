import wretch from "wretch";

import yawl from "./core/index";
// declare class YawlModule extends NativeModule<YawlModuleEvents> {
//   PI: number;
//   hello(): string;
//   setValueAsync(value: string): Promise<void>;
// }

// This call loads the native module object from the JSI.
// export default requireNativeModule<YawlModule>("Yawl");

const aa = new yawl({ apiKey: "key" });

export default {
  yawl: aa,
  hello: () => wretch("https://api.github.com").get().text(),
};
