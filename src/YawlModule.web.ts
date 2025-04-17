import { registerWebModule, NativeModule } from "expo";

import { YawlModuleEvents } from "./Yawl.types";

class YawlModule extends NativeModule<YawlModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit("onChange", { value });
  }
  hello() {
    return "Hello world! 👋";
  }
}

export default registerWebModule(YawlModule);
