import * as React from "react";

import { YawlViewProps } from "./Yawl.types";

export default function YawlView(props: YawlViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
