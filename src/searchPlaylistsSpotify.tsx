import * as ray from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { PushAction, Icon, List, ActionPanel, OpenInBrowserAction, CopyToClipboardAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { SpotifyPlaylistTracks } from "./getPlaylistTracks";
// var fs = require('fs');


export function SpotifyPlaylistsList() {
  const [searchText, setSearchText] = useState<string>();
  const { response, error, isLoading } = usePlaylistSearch(searchText);

  if (error) {
    showToast(ToastStyle.Failure, "Search has failed", error);
  }

  return (
    <List navigationTitle="Search Playlists" searchBarPlaceholder="Search Playlists..." onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
      {response?.playlists.items
        .map((item: any, index) => {
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

function usePlaylistSearch(query: string | undefined): {
  response?: SpotifyApi.PlaylistSearchResponse;
  error?: string;
  isLoading: boolean;
} {
  const [response, setResponse] = useState<SpotifyApi.PlaylistSearchResponse>();
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
          .searchPlaylists(query, { limit: 50 })
          .then((response: any) => response.body as SpotifyApi.PlaylistSearchResponse);

        if (!cancel) {
          // fs.writeFile('path/response.json', JSON.stringify(response), 'utf8', function(err) {
            //   if (err) throw err;
            //   console.log('complete');
            //   });
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
