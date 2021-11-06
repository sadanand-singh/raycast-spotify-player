import * as ray from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { List, ActionPanel, CopyToClipboardAction, OpenInBrowserAction, Icon, PushAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { msToHMS, searchResponse } from "./utils";
import { SpotifyRelatedArtists } from "./getRelatedArtists";


export function SpotifyAlbumsTracks({id, title, icon}: {id: string, title: string, icon:ray.ImageLike|undefined}) {
    const [searchText, setSearchText] = useState<string>();
    const { response, error, isLoading } = getAlbumTracks(id);
    if (error) {
      showToast(ToastStyle.Failure, "Search has failed", error);
    }
    const response2 = searchResponse(searchText, response?.items, ["name"]);

    return (
      <List navigationTitle={`Tracks in ${title}`} onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
        {response2
          .map((item) => {
            return (
              <List.Item
                key={item.id}
                id={item.id}
                title={`${title} – ${item.name}`}
                accessoryTitle={msToHMS(item.duration_ms)}
                icon={icon}
                actions={
                  <ActionPanel>
                    <PlayAction itemURI={item.uri} />
                    <CopyToClipboardAction
                      title="Copy URL"
                      content={item.external_urls.spotify}
                    />
                    <OpenInBrowserAction
                        title="Show Artist"
                        url={item.artists[0].external_urls.spotify}
                        icon={"artists.png"}
                        shortcut={{ modifiers: ["cmd"], key: "1" }}
                      />
                    <PushAction
                      title="List Related Artists"
                      icon={"related.png"}
                      target={<SpotifyRelatedArtists id={item.artists[0].id} title={item.artists[0].name}/>}
                      shortcut={{ modifiers: ["cmd"], key: "2" }}
                    />
                  </ActionPanel>
                }
              />
            );
          })}
      </List>
    );
  }

  function getAlbumTracks(album_id: string): {
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
            .getAlbumTracks(album_id, { limit : 15 })
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
    }, [album_id]);

    return { response, error, isLoading };
  }