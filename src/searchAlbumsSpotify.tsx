import * as ray from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { PushAction, List, Icon, ActionPanel, OpenInBrowserAction, CopyToClipboardAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { SpotifyAlbumsTracks } from "./getAlbumTracks";
import { SpotifyRelatedArtists } from "./getRelatedArtists";


export function SpotifyAlbumsList() {
  const [searchText, setSearchText] = useState<string>();
  const { response, error, isLoading } = useAlbumSearch(searchText);

  if (error) {
    showToast(ToastStyle.Failure, "Search has failed", error);
  }

  return (
    <List navigationTitle="Search Albums" searchBarPlaceholder="Search Albums..." onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
      {response?.albums.items
        .map((item: any, index) => {
          const icon = {source: item.images[item.images.length - 1].url, mask: ray.ImageMask.Circle};
          return (
            <List.Item
              key={index}
              id={`${index}`}
              title={`${item.artists[0].name} – ${item.name}`}
              accessoryTitle={`${item.total_tracks} tracks - ${item.release_date}`}
              icon={icon}
              actions={
                <ActionPanel>
                <PlayAction itemURI={item.uri} />
                <PushAction
                  title="List Tracks"
                  icon={"lyrics.png"}
                  target={<SpotifyAlbumsTracks id={item.id} title={item.name} icon={icon}/>}
                />
                <OpenInBrowserAction
                  title="Show Artist"
                  url={item.artists[0].external_urls.spotify}
                  icon={"artists.png"}
                  shortcut={{ modifiers: ["cmd"], key: "1" }}
                />
                <OpenInBrowserAction
                  title="Show Album"
                  url={item.external_urls.spotify}
                  icon={icon}
                  shortcut={{ modifiers: ["cmd"], key: "2" }}
                />
                <PushAction
                  title="List Related Artists"
                  icon={"related.png"}
                  target={<SpotifyRelatedArtists id={item.artists[0].id} title={item.artists[0].name}/>}
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

function useAlbumSearch(query: string | undefined): {
  response?: SpotifyApi.AlbumSearchResponse;
  error?: string;
  isLoading: boolean;
} {
  const [response, setResponse] = useState<SpotifyApi.AlbumSearchResponse>();
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
          .searchAlbums(query, { limit: 50 })
          .then((response: any) => response.body as SpotifyApi.AlbumSearchResponse);

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
