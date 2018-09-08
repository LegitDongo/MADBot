# Map-A-Droid User Submissions

If you need user submissions through Discord and want it to work with Map-A-Droid, use this!

## How to use
1. Install dependencies -- `npm install`
2. Copy `config.ini.example` to `config.ini`
3. Fill in the config settings appropriately
    * `channel` - the specific channel id that will allow for user submissions
        * Can also use `all` for all channels to be valid
    * `discordtoken` - the token given to you by discord when you set your bot up
        * Look here for further information [Creating a Discord Bot & Getting a Token](
        https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
    * `screenshotsLocation` - the path on your machine to the screenshots folder
4. Run the bot! -  `node start.js`
    * It is highly suggested using a process manager for this such as [pm2](http://pm2.keymetrics.io/)