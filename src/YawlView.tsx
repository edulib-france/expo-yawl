import { requireNativeView } from "expo";
import * as React from "react";

import { YawlViewProps } from "./Yawl.types";

const NativeView: React.ComponentType<YawlViewProps> =
  requireNativeView("Yawl");

export default function YawlView(props: YawlViewProps) {
  return <NativeView {...props} />;
}
