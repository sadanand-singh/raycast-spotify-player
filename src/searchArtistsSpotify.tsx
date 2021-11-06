import * as ray from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { PushAction, List, Icon, ActionPanel, OpenInBrowserAction, CopyToClipboardAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { SpotifyArtistTracks } from "./getArtistTopTracks";
import { SpotifyArtistAlbums } from "./getArtistAlbums";
import { SpotifyRelatedArtists } from "./getRelatedArtists";


export function SpotifyArtistsList() {
  const [searchText, setSearchText] = useState<string>();
  const { response, error, isLoading } = useArtistSearch(searchText);

  if (error) {
    showToast(ToastStyle.Failure, "Search has failed", error);
  }

  return (
    <List navigationTitle="Search Artists" searchBarPlaceholder="Search Artists..." onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
      {response?.artists.items
        .filter((item) => item.images.length > 1)
        .sort((item) => item.popularity)
        .map((item: any, index) => {
          const icon = {source: item.images[item.images.length - 1].url, mask: ray.ImageMask.Circle};
          return (
            <List.Item
              key={index}
              id={`${index}`}
              title={`${item.name}`}
              accessoryTitle={`${item.followers.total} Followers`}
              icon={icon}
              actions={
                <ActionPanel>
                <PlayAction itemURI={item.uri} />
                <OpenInBrowserAction
                  title="Show Artist"
                  url={item.external_urls.spotify}
                  icon={"artists.png"}
                />
                <PushAction
                  title="List Top Tracks"
                  icon={"lyrics.png"}
                  target={<SpotifyArtistTracks id={item.id} title={item.name}/>}
                  shortcut={{ modifiers: ["cmd"], key: "1" }}
                />
                <PushAction
                  title="List Albums"
                  icon={"albums.png"}
                  target={<SpotifyArtistAlbums id={item.id} title={item.name}/>}
                  shortcut={{ modifiers: ["cmd"], key: "2" }}
                />
                <PushAction
                  title="List Related Artists"
                  icon={"related.png"}
                  target={<SpotifyRelatedArtists id={item.id} title={item.name}/>}
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

function useArtistSearch(query: string | undefined): {
  response?: SpotifyApi.ArtistSearchResponse;
  error?: string;
  isLoading: boolean;
} {
  const [response, setResponse] = useState<SpotifyApi.ArtistSearchResponse>();
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
          .searchArtists(query, { limit: 50 })
          .then((response: any) => response.body as SpotifyApi.ArtistSearchResponse);

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
