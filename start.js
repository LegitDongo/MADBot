// Not the best fix in the world, but gets rid of the
// `deprecated Automatic enabling of cancellation of promises is deprecated.` message
process.env["NTBA_FIX_319"] = 1;

var     fs          = require('fs'),
        request     = require('request'),
        winston     = require('winston'),
        config      = JSON.parse(fs.readFileSync('./config.ini', 'utf8')),
        Discord     = false,
        Telegram    = false,
        Messenger   = false
;

let debugMode = false;
for (let val of process.argv){
    if (val === '-d' || val === '--debug'){
        debugMode = true;
        break;
    }
}

// Set up logging
const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    format: winston.format.combine(
        winston.format.colorize({ all:true }),
        winston.format.align(),
        winston.format.timestamp(),
        winston.format.splat(),  // Allows the text to be formatted at log time
        winston.format.simple(), // Same as above
        winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console({
            level: (debugMode ? 'debug' : 'error')
        })
    ]
});

var appexit = (err = null) => {
    if (err){
        logger.error(err);
    }
    if (Discord){
        Discord.destroy((err) => {
            logger.error(err);
        });
    }
    process.exit();
};

// set up services to send to
if (typeof config.discordtoken !== 'undefined' && config.discordtoken !== ''){
    if (typeof config.discordChannel === 'undefined' || config.discordChannel === ''){
        appexit('You have to have the "discordChannel" section filled out in your config!');
    }
    logger.debug('Requiring Discord API and creating instance');
    // Login done in Discord block later
    Discord = new (require('discord.js')).Client();

}

if (typeof config.telegramtoken !== 'undefined' && config.telegramtoken !== ''){
    if (typeof config.telegramChat === 'undefined' || config.telegramChat === ''){
        appexit('You have to have the "telegramChat" section filled out in your config!');
    }
    logger.debug('Requiring Telegram API and creating instance');
    // Login done here for Telegram
    Telegram = new (require('node-telegram-bot-api'))(config.telegramtoken, { polling: true });
}

let messengerRequirements = ['messengertoken', 'messengerVerifyToken', 'messengerHttpPort']; //, 'messengerAppSecret'
let messengerGoodToRoll = true;
for(let i in messengerRequirements){
    if (typeof config[messengerRequirements[i]] === 'undefined' || config[messengerRequirements[i]] === ''){
        messengerGoodToRoll = false;
        break;
    }
}
if (messengerGoodToRoll){
    logger.debug('Requiring FB Messenger API and creating instance/http server');
    Messenger = new (require('messenger-bot'))({
        token: config.messengertoken,
        verify: config.messengerVerifyToken,
        app_secret: config.messengerAppSecret
    });
    (require('http')).createServer(Messenger.middleware()).listen(config.messengerHttpPort);
    logger.info('FB Messenger server running on port 3000');
}

if (!Discord && !Telegram && !Messenger){
    appexit('You have to have at least one service (Discord or Telegram or FB Messenger) set up!');
}

// Check required config options
let required = ['screenshotsLocation'];
for(let i in required){
    if (typeof config[required[i]] === 'undefined' || config[required[i]] === ''){
        appexit('Config not filled out! You have to have the "channel", and ' +
            '"screenshotsLocation" sections filled out!');
    }
}

// Set up download function
function download (url, finishedCallback = false, errorCallback = false) {
    this.url = url;
    this.finishedCallback = finishedCallback;
    this.errorCallback = errorCallback;
    logger.debug('File to request: '+this.url);
    this.finalCount = false;
    this.count = 7;
    this.second = Math.round(Date.now()/1000);
    // File of this name already exists. We need to change to a name that doesn't exist already
    if (fs.existsSync(`${ config.screenshotsLocation }/raidscreen_${ this.second }_9999_9999_99.jpg`)){
        logger.debug(`Filename 'raidscreen_${this.second}_9999_9999_99.jpg' already exists. Trying upcount`);
        while(true){
            if (!fs.existsSync(`${ config.screenshotsLocation }/raidscreen_${ this.second }_9999_9999_${ this.count }.jpg`)){
                this.finalCount = this.count;
                break;
            }
            this.count++;
        }
    }
    this.fileName = `raidscreen_${this.second}_9999_9999_${ this.finalCount ? this.finalCount : '99' }.jpg`;
    logger.debug(`Attempting to download to '${ this.fileName }'`);
    let that = this;
    request.get(url)
        .pipe(fs.createWriteStream(config.screenshotsLocation + '/' + that.fileName))
        .on('close', function(){
            logger.debug(`Finished adding file: ${ that.fileName }`);
            if (that.finishedCallback){
                that.finishedCallback();
            }
        })
        .on('error', function (err) {
            logger.error(err);
            if (that.errorCallback){
                that.errorCallback();
            }
        });
}

// Set up Discord requirements
if (Discord) {
    logger.debug('Setting up Discord stuff');
    var discordReady = () => {
        logger.info('Discord is Ready to go MAD');
    };

    var discordMessage = message => {
        //don't respond if it's a bot
        if (message.author.bot) return;
        //don't respond if not on a text chat
        if (message.channel.type !== 'text') return;

        // Check value of config.discordChannel to make sure it's got some form of valid id
        if (config.discordChannel !== 'all'){
            if ((typeof config.discordChannel === 'string' && message.channel.id !== config.discordChannel) ||
                (Array.isArray(config.discordChannel) && config.discordChannel.indexOf(message.channel.id) === -1)){
                return;
            }
        }

        if (message.attachments.size > 0){
            message.attachments.forEach(function(attachment){
                new download(attachment.url, () => {
                    if (typeof config.confirmationMessage !== 'undefined' && config.confirmationMessage) {
                        message.channel.send('File successfully uploaded').then(m => {
                            m.delete(5000);
                        });
                    }
                });
            });
        }
    };

    Discord.on('ready', discordReady);
    Discord.on('message', discordMessage);
    Discord.login(config.discordtoken);
    Discord.on('disconnect', (event) => {
        logger.error(`Disconnected with code ${ event.code }`);
        if(event.code !== 1006)
            appexit();
        else
            Discord.destroy().then(() => Discord.login(config.discordtoken));
    });
}

// Set up Telegram requirements
if (Telegram){
    logger.debug('Setting up Telegram stuff');
    var telegramErrorMessage = (errorObj) => {
        // error.response is not available if code is EFATAL
        if (errorObj.code === 'EFATAL'){
            return 'Fatal error';
        }
        // error.response.body is a string if code is EPARSE
        if (errorObj.code === 'EPARSE'){
             return errorObj.response.body;
        }
        // error.response.body is an object if code is ETELEGRAM
        if (errorObj.code === 'ETELEGRAM'){
            return `(Code ${ errorObj.response.body.error_code }) ${ errorObj.response.body.description }`;
        }
    };

    var telegramError = (type, error) => {
        if (typeof error.message !== 'undefined' && typeof error.stack !== 'undefined'){
            appexit(`Other error: ${ error.message }\n${ error.stack }`);
        }
        logger.error(`${ type } error - ${ error.code }: ${ telegramErrorMessage(error) }`);
    };

    var getPhotoId = (arrayItems) => {
        let biggestPhoto = false;
        let biggestPhotoSize = false;
        for(let i = arrayItems.length - 1; i >= 0; i--){
            if (arrayItems[i].file_size > biggestPhotoSize){
                biggestPhoto = arrayItems[i];
                biggestPhotoSize = arrayItems[i].file_size;
            }
        }
        if (biggestPhoto) return biggestPhoto.file_id;
        return false;
    };

    var telegramPost = (msg) => {
        // Check value of config.discordChannel to make sure it's got some form of valid id
        if (config.telegramChat !== 'all'){
            if ((typeof config.telegramChat === 'string' && msg.chat.id.toString() !== config.telegramChat) ||
                (Array.isArray(config.telegramChat) && config.telegramChat.indexOf(msg.chat.id.toString()) === -1)){
                return;
            }
        }
        let link = false;
        // The "Gallery" option comes in this
        if (typeof msg.photo !== 'undefined' && msg.photo.length > 0){
            link = getPhotoId(msg.photo);
        }
        // The "File" option comes in this
        if (typeof msg.document !== 'undefined' &&
        (msg.document.file_name.endsWith('.png') || msg.document.file_name.endsWith('.jpg'))){
            link = msg.document.file_id;
        }

        // Couldn't contain a valid image
        if (!link) return false;

        Telegram.getFileLink(link).then((url) => {
            new download(url, () => {
                if (typeof config.confirmationMessage !== 'undefined' && config.confirmationMessage) {
                    Telegram.sendMessage(msg.chat.id, 'Photo successfully uploaded!');
                }
            });
        });
    };

    Telegram.on('photo', (msg) => telegramPost(msg));
    Telegram.on('channel_post', (msg) => telegramPost(msg));
    Telegram.on('polling_error', (error) => { telegramError('Polling', error); });
    Telegram.on('webhook_error', (error) => { telegramError('Webhook', error); });

}

// Set up FB Messenger requirements
if (Messenger){
    logger.debug('Setting up FB Messenger stuff');
    Messenger.on('error', (err) => {
        logger.error(err.message);
    });
    Messenger.on('message', (payload, reply) => {
        if (typeof payload.message.attachments === 'undefined' || payload.message.attachments.length === 0) return;
        for(let i in payload.message.attachments){
            if (payload.message.attachments[i].type === 'image' && typeof payload.message.sticker_id === 'undefined'){
                new download(payload.message.attachments[i].payload.url, () => {
                    reply({text: 'Image successfully uploaded'}, (err) => {
                        if (err) logger.error(err);
                    });
                }, () => {
                    reply({text: 'There was a problem uploading your image'}, (err) => {
                        if (err) logger.error(err);
                    });
                });
            }
        }
    });
}

//do some cleanup on ctrl + c
process.on('SIGINT', () => {
    logger.debug('CTRL + C pressed - shutting down');
    appexit();
});
