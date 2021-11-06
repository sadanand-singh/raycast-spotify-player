import * as ray from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { PushAction, List, Icon, ActionPanel, OpenInBrowserAction, CopyToClipboardAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { searchResponse } from "./utils";
import { SpotifyAlbumsTracks } from "./getAlbumTracks";


export function SpotifyArtistAlbums({id, title}: {id: string, title: string}) {
    const [searchText, setSearchText] = useState<string>();
    const { response, error, isLoading } = getArtistAlbums(id);
    if (error) {
      showToast(ToastStyle.Failure, "Request has failed", error);
    }
    const response2 = searchResponse(searchText, response?.items, ["name"]);

    return (
      <List navigationTitle={`Albums for ${title}`} onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
        {response2
          .sort((item) => item.popularity)
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
                    <CopyToClipboardAction
                      title="Copy URL"
                      content={item.external_urls.spotify}
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

  function getArtistAlbums(artist_id: string): {
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
            .getArtistAlbums(artist_id, { limit: 15 })
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
    }, [artist_id]);

    return { response, error, isLoading };
  }

