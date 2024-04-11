import SpotifyWebApi from "spotify-web-api-node";
import { users } from "./utils/users";
import { UserData } from "./types";

export class Spotify {
  private api: SpotifyWebApi;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.api = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: clientSecret,
      redirectUri: redirectUri
    });
  }

  public getAuthUriForUser(userId: number | string): string {
    return this.api.createAuthorizeURL(["user-read-recently-played", "user-read-currently-playing"], userId.toString(), false)
  }

  public async getRecentlyPlayedTracks(userId: number | string): Promise<any> {
    if (!users.exists(userId)) return []; 
    const userData = users.getUserData(userId);
    if (!userData.refreshToken) await this.setTokensForTheFirstTime(userId, userData).catch(() => console.log("grant error"));
    else await this.refreshToken(userId, userData).catch(() => console.log("refresh error"));
    const currentTrack = await this.api.getMyCurrentPlayingTrack();
    const tracks = await this.api.getMyRecentlyPlayedTracks({limit: 5}).catch(() => console.log("tracks error"));
    if (currentTrack.body.item && tracks) {
      return [currentTrack.body.item, ...tracks.body.items];
    }
    return tracks ? tracks.body.items : [];
  }

  private async setTokensForTheFirstTime(userId: number | string, userData: UserData): Promise<void> {
    const grantResponse = await this.api.authorizationCodeGrant(userData.accessToken);
    
    const accessToken = grantResponse.body.access_token;
    const refreshToken = grantResponse.body.refresh_token;
    
    users.setUserData(userId, {accessToken, refreshToken, expirationTime: userData.expirationTime});

    this.api.setAccessToken(accessToken);
    this.api.setRefreshToken(refreshToken);
  }

  private async refreshToken(userId: number | string, userData: UserData): Promise<void> {
    let { accessToken, refreshToken, expirationTime } = userData;
    if (!refreshToken) return;

    this.api.setAccessToken(accessToken);
    this.api.setRefreshToken(refreshToken);

    const refreshed = await this.api.refreshAccessToken();
    accessToken = refreshed.body.access_token;
    refreshToken = refreshed.body.refresh_token || refreshToken;
    expirationTime = new Date().getTime() + refreshed.body.expires_in * 1000; // should be one hour

    users.setUserData(userId, {accessToken, refreshToken: refreshToken, expirationTime});

    this.api.setAccessToken(accessToken);
    this.api.setRefreshToken(refreshToken);
  }
}