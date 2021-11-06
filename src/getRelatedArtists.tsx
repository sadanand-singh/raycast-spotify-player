import * as ray from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { PushAction, List, Icon, ActionPanel, OpenInBrowserAction, CopyToClipboardAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { searchResponse } from "./utils";
import { SpotifyArtistTracks } from "./getArtistTopTracks";
import { SpotifyArtistAlbums } from "./getArtistAlbums";


export function SpotifyRelatedArtists({id, title}: {id: string, title: string}) {
    const [searchText, setSearchText] = useState<string>();
    const { response, error, isLoading } = getRelatedArtists(id);
    if (error) {
      showToast(ToastStyle.Failure, "Request has failed", error);
    }
    const response2 = searchResponse(searchText, response?.artists, ["name"]);

    return (
      <List navigationTitle={`Related Artists for ${title}`} onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
        {response2
          .filter((item) => item.images.length > 1)
          .sort((item) => item.popularity)
          .map((item, index) => {
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
                    icon={"your_tops_tracks.png"}
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

  function getRelatedArtists(artist_id: string): {
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
            .getArtistRelatedArtists(artist_id)
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
