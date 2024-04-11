import { Telegraf, Telegram } from "telegraf";
import { users } from "./utils/users";
import { Spotify } from "./spotify";
import { InlineQueryResult } from "telegraf/typings/core/types/typegram";

export class TelegramBot {
  private me: Telegraf;
  private methods: Telegram;
  private spotify: Spotify;

  constructor(token: string, spotify: Spotify) {
    this.me = new Telegraf(token);
    this.methods = this.me.telegram;
    this.spotify = spotify;
  }

  public sendSuccessMessage(userId: number | string) {
    this.methods.sendMessage(userId,
      "Вы были успешно авторизированны!\n" +
      "Напишите в поле ввода @unowplaybot, чтобы отправить текущий трек."
    ).catch(() => {});
  }

  public launch(): void {
    this.methods.setMyCommands([{"command": "start", "description": "Авторизация."}]);
    this.listenStartCommand();
    this.listenInlineQuery();
    this.me.launch();
  }

  private listenStartCommand(): void {
    this.me.start(context => {
      const userId = context.from.id;
      
      if (users.exists(userId)) {
        context.reply("Напишите в поле ввода @unowplaybot, чтобы отправить текущий трек.");
      }
      else {
        const url = this.spotify.getAuthUriForUser(userId);
        context.reply(`Авторизуйтесь по ссылке ниже:\n<a href="${url}">Авторизоваться</a>`, {
          link_preview_options: { is_disabled: true },
          parse_mode: "HTML"
        });
      }
    });
  }

  private listenInlineQuery(): void {
    this.me.on("inline_query", async context => {
      const userId = context.from.id;
      if (!users.exists(userId)) return context.answerInlineQuery([]);

      const tracks = await this.spotify.getRecentlyPlayedTracks(userId);
      if (tracks.length === 0) return context.answerInlineQuery([]);

      const results: InlineQueryResult[] = [];
      const titles: string[] = [];
      
      for (let i = 0; i < tracks.length; i++) {
        const track = i === 0 ? tracks[i] : tracks[i].track;
        const title = track.name;

        if (!titles.includes(title)) {
          const id = Math.round(Math.random() * 0xffffff).toString();
          const audio_url = track.preview_url || "";
          const spotifyUri = track.external_urls.spotify;
          const photoUrl = track.album.images[0].url;

          results.push({
            id,
            type: "audio",
            title,
            audio_url,
            caption: audio_url === "" ? "Произошла ошибка при загрузке превью трека!" : `<a href="${spotifyUri}">Spotify</a>`,
            parse_mode: "HTML",
            audio_duration: audio_url === "" ? 1 : 30
          });
        }
      }

      await context.answerInlineQuery(results, {cache_time: 0}).catch(() => {});
    });
  }
}