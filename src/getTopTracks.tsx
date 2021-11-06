import * as ray from "@raycast/api";
import { showToast, ToastStyle } from "@raycast/api";
import { PushAction, List, Icon, ActionPanel, OpenInBrowserAction, CopyToClipboardAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { spotifyApi } from "./client";
import { PlayAction } from "./actions";
import { msToHMS, searchResponse } from "./utils";
import { SpotifyAlbumsTracks } from "./getAlbumTracks";
import { SpotifyRelatedArtists } from "./getRelatedArtists";


export function SpotifyTopTracks() {
    const [searchText, setSearchText] = useState<string>();
    const { response, error, isLoading } = getTopTracks();
    if (error) {
      showToast(ToastStyle.Failure, "Request has failed", error);
    }
    const response2 = searchResponse(searchText, response?.items, ["name", "album.name"]);

    return (
      <List navigationTitle={`My Top Tracks`} onSearchTextChange={setSearchText} isLoading={isLoading} throttle>
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

  function getTopTracks(): {
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
            .getMyTopTracks()
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
    }, []);

    return { response, error, isLoading };
  }
