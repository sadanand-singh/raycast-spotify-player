import { preferences } from "@raycast/api";
import SpotifyWebApi from "spotify-web-api-node";
import * as ray from "@raycast/api";


const debugMode = false;

export const spotifyApi = new SpotifyWebApi();

export function authorize(): void {
  const clientId = preferences.clientId?.value as string;
  const secret = preferences.secret?.value as string;
  const refresh_token = preferences.refreshToken?.value as string;

  if (clientId?.length != 0 && secret?.length != 0) {
    spotifyApi.setClientId(clientId);
    spotifyApi.setClientSecret(secret);
    spotifyApi.setRefreshToken(refresh_token);
    ray.getLocalStorageItem("authData").then((item) => {
      if (!item) {
        debugLog("Getting new token");
        authenticate();
      } else {
        const json = JSON.parse(item as string) as Record<string, never>;
        const token: string = json.token;
        const exp: number = json.expires_in;
        const date = new Date().getTime();
        debugLog(`Currnet time: ${date}, token expires at: ${exp}`);
        if (token.length > 0 && exp > date) {
          debugLog("Using old token", token);
          spotifyApi.setAccessToken(token);
        } else {
          debugLog("Getting new token");
          authenticate();
        }
      }
    });
  }
}

async function authenticate(): Promise<void> {
  const authResponse = await getToken();
  const token = authResponse.access_token;
  debugLog(authResponse);

  if (token.length > 0) {
    spotifyApi.setAccessToken(token);
    const date = new Date();
    date.setSeconds(date.getSeconds() + authResponse.expires_in);
    const exp = date.getTime();
    debugLog(`token: ${token}, expires in: ${exp}`);
    ray.setLocalStorageItem("authData", JSON.stringify({ token: token, expires_in: exp }));
  }
}

async function getToken(): Promise<SpotifyApi.AuthResponseCredentials> {
  return spotifyApi.refreshAccessToken().then((response: any) => response.body);
}

function debugLog(...params: unknown[]): void {
  if (!debugMode) return;
  const logParams: unknown[] = params.map((val) => {
    try {
      return JSON.stringify(val);
    } catch (error) {
      return `Could not stringify debug log: ${error}`;
    }
  });
  console.log(...logParams);
}