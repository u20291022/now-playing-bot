import SpotifyWebApi from "spotify-web-api-node";
import { config } from "dotenv";
config();

function main() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri)
    throw new Error("Please write right .env file!");

  const spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri
  });
  
  spotifyApi.getMyCurrentPlayingTrack();
}

main();