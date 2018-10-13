# Map-A-Droid User Submissions

If you need user submissions through Discord and/or Telegram and want it to work with Map-A-Droid, use this!

## How to use
1. Install dependencies -- `npm install`
2. Copy `config.ini.example` to `config.ini`
3. Fill in the config settings appropriately
    * `discordChannel` - the specific channel id that will allow for user submissions
        * Can also use `all` for all channels to be valid
        * Also accepts a list of channel ids to allow from
            * Ex. `"discordChannel": ["my-channel-id-1", "my-channel-id-2"],`
    * `telegramChat` - the specific chat id that will allow for user submissions
        * Can also use `all` for all chats that the bot is in to register
        * Also accepts a list of chat ids to allow from
            * Ex. `"telegramChat": ["my-chat-id-1", "my-chat-id-2"],`
    * `discordtoken` - the token given to you by discord when you set your bot up
        * Look here for further information [Creating a Discord Bot & Getting a Token](
        https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
    * `telegramtoken` - the token given to you by the BotFather when you set your bot up
        * See [below](#telegram-broad-setup-guide) for further instruction
    * `messengertoken` - the page token given to you by FB when you set your bot up
        * Look [below](#fb-messenger-broad-setup-guide) for further information
    * `messengerVerifyToken` - token specified when you set up the FB bot
        * Only used for initial verification, afterwards is optional
    * `messengerAppSecret` - Your App Secret token used for message integrity check. If specified, every POST request 
    will be tested for spoofing.
        * Optional
        * I honestly don't know what this means, but I put it in as an option in case you do
    * `messengerHttpPort` - the port that MADBot is going to expect FB Messenger to send webhooks to
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
    
### FB Messenger Broad Setup Guide
You have to have a few things for this to work appropriately
1. A page associated with a Messenger chat
2. a `ngrok` account, equivalent HTTP tunneling service, or a public facing domain/server that you're cool with
FB sending webhooks to

[Here's an in-depth guide to getting your Facebook page created and getting the token](https://medium.com/crowdbotics/how-to-create-your-very-own-facebook-messenger-bot-with-dialogflow-and-node-js-in-just-one-day-f5f2f5792be5)

Start reading at `3. Setting up Facebook Application`

Note: you don't need Dialogflow or any of the code on the page

Here's the tl;dr:
1. Create a page [here](https://facebook.com/pages/create)
2. Sign up for FB developers and create an app [here](https://developers.facebook.com/quickstarts)
3. Select the Messenger icon and click the `Set Up` button
4. Find the `Token Generation` section, select the page associated, and you will get your page access token in the box
next to the page you selected
5. Copy the token generated into `messengertoken` in your config
6. (Skip if not using ngrok) Go to [ngrok](https://ngrok.com/), make an account, go to the getting started page, download for whatever OS you use
    * Make note of the token in step 3
7. (Skip if not using ngrok) Extract ngrok, put it where you want it, navigate there in a console, and use the following commands in order
    * `./ngrok authtoken YOURAUTHTOKENHERE` - the auth token comes from the getting started page
    * `./ngrok http yourport` - the `yourport` part is the port you put into the `messengerHttpPort` part of your config
    * Make note of the `Forwarding` section (where the URL starts with `https`) for the next step
        * Ex. `https://2fdb5541.ngrok.io`
8. Go to the `Webhooks` section back in your screen from stop 4 and click `Setup Webhooks`, fill out `Callback URL` 
with your ngrok (or equivalent) URL here (from the previous step)
9. Fill out the `Verify Token` - this can be anything you want it to be, but it needs to be put into your config at 
`messengerVerifyToken` for initial verification
9. Select the `messages` and `messaging_postbacks` subscription fields
10. Start the MADBot with these the previous config items, and *then* click `Verify and Save`
    * If you get a `502 Bad Gateway error`, you have to be running MADBot *and* ngrok at the same time
    
####Some notes about ngrok:

Only the paid tier has a permanent url. If you use the free tier, you will have to change the url listed in your 
FB webhooks at least daily

To do that, go to [Facebook Developers](https://developers.facebook.com), go to `Webhooks` then under `Page` webhooks, 
click `Edit Subscription`

This should take you back to a similar prompt from step 8 & 9
    
## Docker Usage
```dockerfile
docker build -t madbot .              # Build the docker Image
docker run -d madbot                  # Launch MADBot (Daemon Mode)
```

MADBot requires an access to the screenshot directory of Map-a-Droid

This can be done easily using -v option to map a local DIR in both MAD and MADBot

## Debugging
Most messages (including downloading of file) are disabled unless you enable debug mode

`-d` or `--debug` will enable debug mode when you run this

Ex. `node start.js --debug`

#### Beer
If you like the project, you can [Buy me a Beer 🍻](https://ko-fi.com/Z8Z3AVDQ)