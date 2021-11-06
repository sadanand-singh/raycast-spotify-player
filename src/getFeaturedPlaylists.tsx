import * as ray from "@raycast/api";
import { preferences } from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { PushAction, Icon, List, ActionPanel, OpenInBrowserAction, CopyToClipboardAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { searchResponse } from "./utils";
import { SpotifyPlaylistTracks } from "./getPlaylistTracks";


export function FeaturedPlaylistsList() {
  const [searchText, setSearchText] = useState<string>();
  const { response, error, isLoading } = getFeaturedPlaylist();
  const response2 = searchResponse(searchText, response?.playlists.items, ["name"]);

  if (error) {
    showToast(ToastStyle.Failure, "Request has failed", error);
  }

  return (
    <List navigationTitle="My Playlists" onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
      {response2
        .map((item, index) => {
          const icon = {source: item.images[item.images.length - 1].url, mask: ray.ImageMask.Circle};
          return (
            <List.Item
              key={index}
              id={`${index}`}
              title={`${item.name}`}
              accessoryTitle={`${(item.description.length > 50)?`${item.description.substring(0, 50)}...`:item.description}`}
              subtitle={`${item.tracks.total} tracks`}
              icon={icon}
              actions={
                <ActionPanel>
                  <PlayAction itemURI={item.uri} />
                  <PushAction title="List Tracks" icon={"lyrics.png"} target={<SpotifyPlaylistTracks id={item.id} title={item.name} icon={icon}/>}/>
                  <OpenInBrowserAction
                    title="Show Playlist"
                    url={item.external_urls.spotify}
                    icon={icon}
                    shortcut={{ modifiers: ["cmd"], key: "a" }}
                  />
                  <CopyToClipboardAction
                    title="Copy URL"
                    content={item.external_urls.spotify}
                    shortcut={{ modifiers: ["cmd"], key: "." }}
                  />
                </ActionPanel>
              }
            />
          );
        })}
    </List>
  );
}

function getFeaturedPlaylist(): {
  response?: any;
  error?: string;
  isLoading: boolean;
} {
  const [response, setResponse] = useState<any>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const countryName = preferences.country?.value as string;
  let cancel = false;

  useEffect(() => {
    async function fetchData() {
      if (cancel) {
        return;
      }

      setIsLoading(true);
      setError(undefined);

      try {
        const response = await spotifyApi
          .getFeaturedPlaylists({ limit: 20, country: countryName })
          .then((response: any) => response.body as any);

        if (!cancel) {
          setResponse(response);
        }
      } catch (e) {
        if (!cancel) {
          setError(e.toString());
        }
      } finally {
        if (!cancel) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancel = true;
    };
  }, []);

  return { response, error, isLoading };
}
