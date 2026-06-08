import { Composition } from "remotion";
import { ParkingSaasDemo } from "./ParkingSaasDemo";

export function RemotionRoot() {
  return (
    <Composition
      component={ParkingSaasDemo}
      durationInFrames={360}
      fps={30}
      height={1080}
      id="ParkingSaasDemo"
      width={1920}
    />
  );
}
