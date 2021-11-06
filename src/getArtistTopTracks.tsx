import * as ray from "@raycast/api";
import { preferences } from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { PushAction, List, Icon, ActionPanel, OpenInBrowserAction, CopyToClipboardAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { msToHMS, searchResponse } from "./utils";
import { SpotifyAlbumsTracks } from "./getAlbumTracks";
import { SpotifyRelatedArtists } from "./getRelatedArtists";


export function SpotifyArtistTracks({id, title}: {id: string, title: string}) {
    const [searchText, setSearchText] = useState<string>();
    const { response, error, isLoading } = getArtistTracks(id);
    if (error) {
      showToast(ToastStyle.Failure, "Request has failed", error);
    }
    const response2 = searchResponse(searchText, response?.tracks, ["name", "album.name"]);

    return (
      <List navigationTitle={`Top Tracks for ${title}`} onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
        {response2
          .sort((item) => item.popularity)
          .map((item, index) => {
            const icon = {source: item.album.images[item.album.images.length - 1].url, mask: ray.ImageMask.Circle};
            return (
              <List.Item
                key={index}
                id={`${index}`}
                title={`${item.album.name} – ${item.name}`}
                subtitle={`${item.album.release_date}`}
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
                  <OpenInBrowserAction
                    title="Show Album"
                    url={item.album.external_urls.spotify}
                    icon={"albums.png"}
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

  function getArtistTracks(artist_id: string): {
    response?: any;
    error?: string;
    isLoading: boolean;
  } {
    const [response, setResponse] = useState<any>();
    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    let cancel = false;
    const country = preferences.country?.value as string;

    useEffect(() => {
      async function fetchData() {
        if (cancel) {
          return;
        }

        setIsLoading(true);
        setError(undefined);

        try {
          const response = await spotifyApi
            .getArtistTopTracks(artist_id, country)
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
    }, [artist_id]);

    return { response, error, isLoading };
  }
