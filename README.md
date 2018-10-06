# Map-A-Droid User Submissions

If you need user submissions through Discord and/or Telegram and want it to work with Map-A-Droid, use this!

## How to use
1. Install dependencies -- `npm install`
2. Copy `config.ini.example` to `config.ini`
3. Fill in the config settings appropriately
    * `discordChannel` - the specific channel id that will allow for user submissions
        * Can also use `all` for all channels to be valid
    * `telegramChat` - the specific chat id that will allow for user submissions
        * Can also use `all` for all chats that the bot is in to register
    * `discordtoken` - the token given to you by discord when you set your bot up
        * Look here for further information [Creating a Discord Bot & Getting a Token](
        https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
    * `telegramtoken` - the token given to you by the BotFather when you set your bot up
        * See below for further instruction
    * `screenshotsLocation` - the path on your machine to the screenshots folder
    * `confirmationMessage` - send a message back to the channel when the bot has finished downloading the image
    and saving it in the screenshots folder
        * `true` or `false`
4. Run the bot! -  `node start.js`
    * It is highly suggested using a process manager for this such as [pm2](http://pm2.keymetrics.io/)
    
    
### Telegram Broad Setup Guide
1. Talk to the [BotFather](https://telegram.me/botfather) in the web client
    * Begin the conversation with `/start`
    * Proceed with `/newbot`
    * It will ask you a few questions like what you want to name it and what username it should have and 
    then give you a token - copy that into `telegramtoken` in your config
2. Still talking to the BotFather, use `/setprivacy` and set it to `Disable` 
-- **This has be done before step 3, otherwise you have to kick and re-add your bot**
3. Add your bot to your group or channel - mobile app is best for doing this - 
[example](https://stackoverflow.com/questions/33126743/how-do-i-add-my-bot-to-a-channel/33497769)
    * For channels you have to add the bot as an administrator
4. Determine if you want to allow all places that the bot is included at to submit raid images or only one
    * This is the `telegramChat` config option mentioned earlier
    * To get a chat id, follow 
    [this guide](https://docs.influxdata.com/kapacitor/v1.5/event_handlers/telegram/#get-your-telegram-chat-id) 