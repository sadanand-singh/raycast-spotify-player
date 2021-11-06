import * as ray from "@raycast/api";
import { PushAction, List, ActionPanel, Icon } from "@raycast/api";
import { authorize } from "./client";
import { SpotifySongsList } from "./searchSongsSpotify";
import { SpotifyPlaylistsList } from "./searchPlaylistsSpotify";
import { SpotifyRecentSongsList } from "./recentSongsSpotify";
import { SpotifyAlbumsList } from "./searchAlbumsSpotify";
import { SpotifyArtistsList } from "./searchArtistsSpotify";
import { AccessTokenRequiredView } from "./accessTokenRequiredView";
import { MyPlaylistsList } from "./getMyPlaylists";
import { FeaturedPlaylistsList } from "./getFeaturedPlaylists";
import { SpotifyNewReleaseAlbums } from "./getNewAlbumReleases";
import { SpotifyTopArtists } from "./getTopArtists";
import { SpotifyTopTracks } from "./getTopTracks";
import { SpotifySavedAlbums } from "./getMyAlbums";


export default function SpotifyApp() {
  const clientId = ray.preferences.clientId?.value as string;
  const secret = ray.preferences.secret?.value as string;

  if (clientId && secret && clientId?.length != 0 && secret?.length != 0) {
    authorize();
    return (<MyView />);
  }
  else {
    return (<AccessTokenRequiredView />);
  }
}

const MyView = () => {
  return (
    <List throttle>
      <List.Item
        key="10"
        id="10"
        title="My Playlists"
        icon="yourmusic.png"
        accessoryTitle="My Playlists"
        actions={
          <ActionPanel>
            <PushAction title="My Playlists" icon={"yourmusic.png"} target={<MyPlaylistsList />}/>
        </ActionPanel>
        }
      />
      <List.Item
        key="20"
        id="20"
        title="My Saved Albums"
        icon="current_track.png"
        accessoryTitle="My Saved Albums"
        actions={
          <ActionPanel>
            <PushAction title="My Saved Albums" icon={"current_track.png"} target={<SpotifySavedAlbums />}/>
        </ActionPanel>
        }
      />
      <List.Item
        key="11"
        id="11"
        title="Featured Playlists"
        icon="playlists.png"
        accessoryTitle="Featured Playlists in Spotify"
        actions={
          <ActionPanel>
            <PushAction title="Featured" icon={"playlists.png"} target={<FeaturedPlaylistsList />}/>
        </ActionPanel>
        }
      />
       <List.Item
        key="0"
        id="0"
        title="Recent Tracks"
        icon="recent.png"
        accessoryTitle="Recently Played Tracks"
        actions={
          <ActionPanel>
            <PushAction title="Recent Tracks" icon={"recent.png"} target={<SpotifyRecentSongsList />}/>
          </ActionPanel>
        }
      />
      <List.Item
        key="12"
        id="12"
        title="New Releases"
        icon="new_releases.png"
        accessoryTitle="New Releases Albums"
        actions={
          <ActionPanel>
            <PushAction title="Featured" icon={"new_releases.png"} target={<SpotifyNewReleaseAlbums />}/>
          </ActionPanel>
        }
      />
      <List.Item
        key="13"
        id="13"
        title="Top Artists"
        icon="your_tops_artists.png"
        accessoryTitle="My Top Artists"
        actions={
          <ActionPanel>
            <PushAction title="Top Artists" icon={"your_tops_artists.png"} target={<SpotifyTopArtists />}/>
          </ActionPanel>
        }
      />
      <List.Item
        key="14"
        id="14"
        title="Top Songs"
        icon="your_tops_tracks.png"
        accessoryTitle="My Top Songs"
        actions={
          <ActionPanel>
            <PushAction title="Top Songs" icon={"your_tops_tracks.png"} target={<SpotifyTopTracks />}/>
          </ActionPanel>
        }
      />
      <List.Item
        key="1"
        id="1"
        title="Search Playlists"
        icon="browse.png"
        accessoryTitle="Search Playlists in Spotify"
        actions={
          <ActionPanel>
            <PushAction title="Search" icon={"browse.png"} target={<SpotifyPlaylistsList />}/>
          </ActionPanel>
        }
      />
      <List.Item
        key="2"
        id="2"
        title="Search Songs"
        icon="search.png"
        accessoryTitle="Search Songs in Spotify"
        actions={
          <ActionPanel>
            <PushAction title="Search" icon={"search.png"} target={<SpotifySongsList />}/>
          </ActionPanel>
        }
      />
      <List.Item
        key="3"
        id="3"
        title="Search Albums"
        icon="albums.png"
        accessoryTitle="Search Albums in Spotify"
        actions={
          <ActionPanel>
            <PushAction title="Search" icon={"albums.png"} target={<SpotifyAlbumsList />}/>
          </ActionPanel>
        }
      />
      <List.Item
        key="4"
        id="4"
        title="Search Artists"
        icon="artists.png"
        accessoryTitle="Search Artists in Spotify"
        actions={
          <ActionPanel>
            <PushAction title="Search" icon={"artists.png"} target={<SpotifyArtistsList />}/>
          </ActionPanel>
        }
      />
    </List>
  );
};