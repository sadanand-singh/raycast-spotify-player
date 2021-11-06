import { Detail } from "@raycast/api";


const clientIDRequiredMarkdownText = `
## ❗️Client ID, Secret and refresh_token Required
Please provide **Client ID**, **Secret** and **refresh_token** in the extension preferences (Preferences -> Extensions -> Spotify Player).\\
To create a new client id and secret, do the following:
1. Go to the [Dashboard](https://developer.spotify.com/dashboard) page at the Spotify Developer website and, if necessary, log in.
2. Accept the latest [Developer Terms of Service](https://developer.spotify.com/terms/) to complete your account set up.
3. Create a new Spotify app at [Applications](https://developer.spotify.com/dashboard/applications)
![Travolta](https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/giphy.gif)
4. Follow the README of the extension to get the refresh_token.
5. Copy **Client ID**, **Client Secret** and **refresh_token** into the extension preferences
`;

export function AccessTokenRequiredView(){
  return <Detail markdown={clientIDRequiredMarkdownText} />;
}
