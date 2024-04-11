import { AuthServer } from "./server";
import { TelegramBot } from "./bot";
import { Spotify } from "./spotify";

import { config } from "dotenv";
config();

async function main() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI;
  const botToken = process.env.BOT_TOKEN;

  if (!clientId || !clientSecret || !redirectUri || !botToken) throw new Error("Please write right .env file!");
 
  const spotify = new Spotify(clientId, clientSecret, redirectUri);

  const bot = new TelegramBot(botToken, spotify);
  bot.launch();

  const authServer = new AuthServer(bot);  
  authServer.launch();

  console.log("Successfully started!");
}

main();