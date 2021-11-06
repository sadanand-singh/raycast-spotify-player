import * as ray from "@raycast/api";
import { preferences } from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { PushAction, List, Icon, ActionPanel, OpenInBrowserAction, CopyToClipboardAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { searchResponse } from "./utils";
import { SpotifyAlbumsTracks } from "./getAlbumTracks";



export function SpotifyNewReleaseAlbums() {
    const [searchText, setSearchText] = useState<string>();
    const { response, error, isLoading } = getNewReleaseAlbums();
    if (error) {
      showToast(ToastStyle.Failure, "Request has failed", error);
    }
    const response2 = searchResponse(searchText, response?.albums.items, ["name"]);

    return (
      <List navigationTitle={`New Releases`} onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
        {response2
          .filter(item => item.total_tracks > 4)
          .sort((a, b) => new Date(b.release_date).valueOf() - new Date(a.release_date).valueOf())
          .map((item, index) => {
            const icon = {source: item.images[item.images.length - 1].url, mask: ray.ImageMask.Circle};
            return (
              <List.Item
                key={index}
                id={`${index}`}
                title={`${item.name}`}
                accessoryTitle={`${item.total_tracks} tracks - ${item.release_date}`}
                icon={icon}
                actions={
                  <ActionPanel>
                  <PlayAction itemURI={item.uri} />
                  <PushAction
                    title="List Tracks"
                    icon={"lyrics.png"}
                    target={<SpotifyAlbumsTracks id={item.id} title={item.name} icon={icon}/>}
                    shortcut={{ modifiers: ["cmd"], key: "1" }}
                  />
                  <OpenInBrowserAction
                    title="Show Artist"
                    url={item.artists[0].external_urls.spotify}
                    icon={"artists.png"}
                    shortcut={{ modifiers: ["cmd"], key: "2" }}
                    />
                  <OpenInBrowserAction
                    title="Show Album"
                    url={item.external_urls.spotify}
                    icon={icon}
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

  function getNewReleaseAlbums(): {
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
            .getNewReleases({ limit : 35, offset: 0, country: countryName })
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
