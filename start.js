var     fs          = require('fs'),
        request     = require('request'),
        config      = JSON.parse(fs.readFileSync('./config.ini', 'utf8'));
const   Discord     = require('discord.js'),
        client      = new Discord.Client();

var appexit = (err = null) => {
    if (err){
        console.log("\x1b[31m%s\x1b[0m", err);
    }
    if (client){
        client.destroy((err) => {
            console.log(err);
    });
    }
    process.exit();
};

// Check required config options
let required = ['channel', 'discordtoken', 'screenshotsLocation'];
for(let i in required){
    if (typeof config[required[i]] === 'undefined' || config[required[i]] === ''){
        appexit('Config not filled out! You have to have the "channel", "discordtoken", and ' +
            '"screenshotsLocation" sections filled out!');
    }
}

var clientready = () => {
    console.log('Ready to go MAD');
};

var clientmessage = message => {
    //don't respond if it's a bot
    if (message.author.bot) return;
    //don't respond if not on a text chat
    if (message.channel.type !== 'text') return;
    if (config.channel !== 'all' && message.channel.id !== config.channel) return;
    if (message.attachments.size > 0){
        message.attachments.forEach(function(attachment){
            console.log('Downloading file: '+attachment.url);
            request.get(attachment.url)
                .pipe(fs.createWriteStream(config.screenshotsLocation + '/' +
                    'raidscreen_'+Date.now()+'_9999_9999_99.jpg'))
                .on('close', function(){
                    console.log('Finished adding file');
                    message.channel.send('File successfully uploaded').then(m => {
                        m.delete(5000);
                    });
                })
                .on('error', function (err ) {
                    console.log(err);
                });
        });
    }
};

client.on('ready', clientready);
client.on('message',  clientmessage);

client.login(config.discordtoken);

client.on('disconnect', (event) => {
    console.log(`Disconnected with code ${ event.code }`);
    if(event.code != 1006)
        appexit();
    else
        client.destroy().then(() => client.login(config.discordtoken));
});

//do some cleanup on ctrl + c
process.on('SIGINT', () => {
    appexit();
});