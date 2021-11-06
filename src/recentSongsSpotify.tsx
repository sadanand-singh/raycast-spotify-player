import * as ray from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { List, Icon, ActionPanel, OpenInBrowserAction, CopyToClipboardAction, PushAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { msToHMS, searchResponse } from "./utils";
import { SpotifyAlbumsTracks } from "./getAlbumTracks";
import { SpotifyRelatedArtists } from "./getRelatedArtists";


export function SpotifyRecentSongsList() {
  const [searchText, setSearchText] = useState<string>();
  const { response, error, isLoading } = getRecentTracks();

  if (error) {
    showToast(ToastStyle.Failure, "Search has failed", error);
  }
  const response2 = searchResponse(searchText, response?.items, ["track.name", "item.track.album.name"]);

  return (
    <List navigationTitle="Recent Tracks" isLoading={isLoading} onSearchTextChange={setSearchText} throttle>
      {response2
      // This filter is needed since spotify can return duplicates
        .filter((v,i,a)=>a.findIndex(t=>(t.track.id === v.track.id))===i)
        .sort((item) => item.track.popularity)
        .map((item, index) => {
          const icon = {source: item.track.album.images[item.track.album.images.length - 1].url, mask: ray.ImageMask.Circle};
          return (
            <List.Item
              key={index}
              id={`${index}`}
              title={`${item.track.artists[0].name} – ${item.track.name}`}
              accessoryTitle={msToHMS(item.track.duration_ms)}
              icon={icon}
              actions={
                <ActionPanel>
                <PlayAction itemURI={item.track.uri} />
                <PushAction
                  title="Songs in This Album"
                  icon={"lyrics.png"}
                  target={<SpotifyAlbumsTracks id={item.track.album.id} title={item.track.album.name} icon={icon}/>}
                />
                <OpenInBrowserAction
                  title="Show Album"
                  url={item.track.album.external_urls.spotify}
                  icon={icon}
                  shortcut={{ modifiers: ["cmd"], key: "1" }}
                />
                <OpenInBrowserAction
                  title="Show Artist"
                  url={item.track.artists[0].external_urls.spotify}
                  icon={"artists.png"}
                  shortcut={{ modifiers: ["cmd"], key: "2" }}
                />
                <PushAction
                  title="List Related Artists"
                  icon={"related.png"}
                  target={<SpotifyRelatedArtists id={item.track.artists[0].id} title={item.track.artists[0].name}/>}
                  shortcut={{ modifiers: ["cmd"], key: "3" }}
                />
                <CopyToClipboardAction
                  title="Copy URL"
                  content={item.track.external_urls.spotify}
                  shortcut={{ modifiers: ["cmd"], key: "4" }}
                />
              </ActionPanel>
              }
            />
          );
        })}
    </List>
  );
}


function getRecentTracks(): {
  response?: any;
  error?: string;
  isLoading: boolean;
} {
  const [response, setResponse] = useState<any>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
          .getMyRecentlyPlayedTracks({ limit: 20 })
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
