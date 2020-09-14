import React from "react";

export function Spacer({ x = 0, y = 0 }) {
  return <div style={{ width: `${x}px`, height: `${y}px` }}></div>;
}
