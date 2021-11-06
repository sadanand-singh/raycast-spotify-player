import {
  closeMainWindow,
  showToast,
  ToastStyle,
  ActionPanel,
} from "@raycast/api";
import { playSong } from "./spotify-applescript";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function PlayAction(props: { itemURI: string }) {
  async function handleAction() {
    try {
      await closeMainWindow();
      await playSong(props.itemURI);
    } catch (error) {
      showToast(ToastStyle.Failure, "Failed playing song", error instanceof Error ? error.message : error.toString());
    }
  }
  const icon = {source: {light: "play-light.png", dark: "play-dark.png"}};
  return (
    <ActionPanel.Item title="Play" icon={icon} onAction={handleAction}/>
  );
}