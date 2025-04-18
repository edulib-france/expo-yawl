import Yawl from "@edulib-france/expo-yawl";
import { registerRootComponent } from "expo";

import App from "./App";
export const yawl = new Yawl({ apiKey: "key", env: "staging" });
yawl.init().finally(() => {
  // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
  // It also ensures that whether you load the app in Expo Go or in a native build,
  // the environment is set up appropriately
  registerRootComponent(App);
});
