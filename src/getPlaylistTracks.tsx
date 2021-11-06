import * as ray from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { List, ActionPanel, OpenInBrowserAction, Icon, PushAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { msToHMS, searchResponse } from "./utils";
import { SpotifyAlbumsTracks } from "./getAlbumTracks";
import { SpotifyRelatedArtists } from "./getRelatedArtists";

export function SpotifyPlaylistTracks({id, title, icon}: {id: string, title: string, icon:ray.ImageLike|undefined}) {
    const [searchText, setSearchText] = useState<string>();
    const { response, error, isLoading } = getPlaylistTracks(id);
    if (error) {
      showToast(ToastStyle.Failure, "Request has failed", error);
    }
    const response2 = searchResponse(searchText, response?.items, ["track.name", "track.album.name"]);

    return (
      <List navigationTitle={`Tracks in ${title}`} onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
        {response2
          .sort((item) => item.track.popularity)
          .map((item) => {
            return (
              <List.Item
                key={item.track.id}
                id={item.track.id}
                title={`${title} – ${item.track.name}`}
                accessoryTitle={msToHMS(item.track.duration_ms)}
                icon={icon}
                actions={
                  <ActionPanel>
                  <PlayAction itemURI={item.track.uri} />
                  <PushAction
                  title="Songs in This Album"
                  icon={"lyrics.png"}
                  target={<SpotifyAlbumsTracks id={item.track.album.id} title={item.track.album.name} icon={icon}/>}
                />
                <OpenInBrowserAction
                  title="Show Artist"
                  url={item.track.artists[0].external_urls.spotify}
                  icon={"artists.png"}
                  shortcut={{ modifiers: ["cmd"], key: "1" }}
                />
                <PushAction
                  title="List Related Artists"
                  icon={"related.png"}
                  target={<SpotifyRelatedArtists id={item.track.artists[0].id} title={item.track.artists[0].name}/>}
                  shortcut={{ modifiers: ["cmd"], key: "2" }}
                />
                <OpenInBrowserAction
                  title="Show Album"
                  url={item.track.album.external_urls.spotify}
                  icon={icon}
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

  function getPlaylistTracks(playlist_id: string): {
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
            .getPlaylistTracks(playlist_id, { limit : 25, fields: 'items' })
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
    }, [playlist_id]);

    return { response, error, isLoading };
  }