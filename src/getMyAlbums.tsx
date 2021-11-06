import * as ray from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { PushAction, List, Icon, ActionPanel, OpenInBrowserAction, CopyToClipboardAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { searchResponse } from "./utils";
import { SpotifyAlbumsTracks } from "./getAlbumTracks";


export function SpotifySavedAlbums() {
    const [searchText, setSearchText] = useState<string>();
    const { response, error, isLoading } = getSavedAlbums();
    if (error) {
      showToast(ToastStyle.Failure, "Request has failed", error);
    }
    const response2 = searchResponse(searchText, response?.items, ["album.name"]);

    return (
      <List navigationTitle={`My Saved Albums`} onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
        {response2
          .sort((item) => item.album.popularity)
          .map((item, index) => {
            const icon = {source: item.album.images[item.album.images.length - 1].url, mask: ray.ImageMask.Circle};
            return (
              <List.Item
                key={index}
                id={`${index}`}
                title={`${item.album.name}`}
                accessoryTitle={`${item.album.total_tracks} tracks - ${item.album.release_date}`}
                icon={icon}
                actions={
                  <ActionPanel>
                  <PlayAction itemURI={item.album.uri} />
                  <PushAction
                    title="List Tracks"
                    icon={"lyrics.png"}
                    target={<SpotifyAlbumsTracks id={item.album.id} title={item.album.name} icon={icon}/>}
                  />
                  <OpenInBrowserAction
                    title="Show Artist"
                    url={item.album.artists[0].external_urls.spotify}
                    icon={"artists.png"}
                    shortcut={{ modifiers: ["cmd"], key: "1" }}
                    />
                  <OpenInBrowserAction
                    title="Show Album"
                    url={item.album.external_urls.spotify}
                    icon={icon}
                    shortcut={{ modifiers: ["cmd"], key: "2" }}
                  />
                  <CopyToClipboardAction
                    title="Copy URL"
                    content={item.album.external_urls.spotify}
                    shortcut={{ modifiers: ["cmd"], key: "3" }}
                  />
                </ActionPanel>
                }
              />
            );
          })}
      </List>
    );
  }

  function getSavedAlbums(): {
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
            .getMySavedAlbums({ limit: 15 })
            .then((response: any) => response.body as any);

          if (!cancel) {
            setResponse(response);
          }
        } catch (e) {
          if (!cancel) {
              console.log(e.toString());
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