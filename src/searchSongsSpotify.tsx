import * as ray from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { List, Icon, ActionPanel, OpenInBrowserAction, CopyToClipboardAction, PushAction} from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { SpotifyRelatedArtists } from "./getRelatedArtists";
import { SpotifyAlbumsTracks } from "./getAlbumTracks";
import { msToHMS } from "./utils";


export function SpotifySongsList() {
  const [searchText, setSearchText] = useState<string>();
  const { response, error, isLoading } = useTrackSearch(searchText);

  if (error) {
    showToast(ToastStyle.Failure, "Search has failed", error);
  }

  return (
    <List navigationTitle="Search Tracks" searchBarPlaceholder="Search music..." onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
      {response?.tracks.items
        .sort((item) => item.popularity)
        .map((item: SpotifyApi.TrackObjectFull, index) => {
          const icon = {source: item.album.images[item.album.images.length - 1].url, mask: ray.ImageMask.Circle};
          return (
            <List.Item
              key={index}
              id={`${index}`}
              title={`${item.artists[0].name} – ${item.name}`}
              accessoryTitle={msToHMS(item.duration_ms)}
              icon={icon}
              actions={
                <ActionPanel>
                <PlayAction itemURI={item.uri} />
                <PushAction
                  title="Songs in This Album"
                  icon={"lyrics.png"}
                  target={<SpotifyAlbumsTracks id={item.album.id} title={item.album.name} icon={icon}/>}
                />
                <PushAction
                  title="List Related Artists"
                  icon={"related.png"}
                  target={<SpotifyRelatedArtists id={item.artists[0].id} title={item.artists[0].name}/>}
                  shortcut={{ modifiers: ["cmd"], key: "1" }}
                />
                <OpenInBrowserAction
                  title="Show Album"
                  url={item.album.external_urls.spotify}
                  icon={icon}
                  shortcut={{ modifiers: ["cmd"], key: "2" }}
                />
                <OpenInBrowserAction
                  title="Show Artist"
                  url={item.artists[0].external_urls.spotify}
                  icon={"artists.png"}
                  shortcut={{ modifiers: ["cmd"], key: "3" }}
                />
                <CopyToClipboardAction
                  title="Copy URL"
                  content={item.external_urls.spotify}
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

function useTrackSearch(query: string | undefined): {
  response?: SpotifyApi.TrackSearchResponse;
  error?: string;
  isLoading: boolean;
} {
  const [response, setResponse] = useState<SpotifyApi.TrackSearchResponse>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  let cancel = false;

  useEffect(() => {
    async function fetchData() {
      if (!query || cancel) {
        return;
      }

      setIsLoading(true);
      setError(undefined);

      try {
        const response = await spotifyApi
          .searchTracks(query, { limit: 50 })
          .then((response: any) => response.body as SpotifyApi.TrackSearchResponse);

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
  }, [query]);

  return { response, error, isLoading };
}
