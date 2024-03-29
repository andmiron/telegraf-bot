import { BotCommandInterface } from '../interfaces/bot.command.interface';
import { Markup, Telegraf } from 'telegraf';
import { WeatherClient } from '../services/weather.client';
import { BotResponse } from '../types/types';
import { CustomContext } from '../interfaces/custom.context';
import { generateWeatherString } from '../utils/string.generator';

export class GetWeatherCommand implements BotCommandInterface {
   command: string;
   description: string;

   private bot: Telegraf<CustomContext>;
   private weatherClient: WeatherClient;

   constructor(command: string, description: string, bot: Telegraf<CustomContext>, weatherClient: WeatherClient) {
      this.command = command;
      this.description = description;
      this.bot = bot;
      this.weatherClient = weatherClient;
   }

   execute() {
      this.bot.command(this.command, async (ctx) => {
         await ctx.reply(
            BotResponse.SHARE_LOCATION,
            Markup.keyboard([Markup.button.locationRequest(BotResponse.SHARE_BUTTON)])
               .resize()
               .oneTime(),
         );
      });

      this.bot.on('location', async (ctx) => {
         const { latitude, longitude } = ctx.message.location;
         const weatherData = await this.weatherClient.getForecast(latitude, longitude);

         if (weatherData) {
            const weatherMessage = generateWeatherString(weatherData);
            await ctx.reply(weatherMessage, {
               reply_markup: {
                  remove_keyboard: true,
               },
            });
         } else {
            await ctx.reply(BotResponse.WEATHER_FETCH_ERROR);
         }
      });
   }
}
