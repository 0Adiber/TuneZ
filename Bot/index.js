const Discord = require('discord.js');
const video = require('./getVideoUrl');

class Bot {
    constructor(token, id, prefix) {
        this.token = token;
        this.id = id;
        this.prefix = prefix;
        this.start();
    }
    start() {
        const client = new Discord.Client();
        client.login(this.token);

        client.on('ready', () => {
            this.logger(`Logged in as ${client.user.tag}!`);
        });

        client.on('message', msg => {
            if (!msg.toString().startsWith(this.prefix)) return;
            let cmd = msg.toString().substr(1).split(" ");

            if(cmd[0].trim() === ("play")) {
                if(cmd.length != 2) {
                    msg.reply(`The command is: '${this.prefix}play <youtube url/title>`);
                    msg.react("❌");
                    return;
                }
                msg.react("✅");
                if(msg.member.voiceChannel) {
                    msg.member.voiceChannel.join()
                        .then(connection => {
                            video.getUrl(cmd[1])
                            .then(result => {
                                if(result.status != "success"){
                                    msg.reply(result.status);
                                    return;
                                }
                                msg.reply("Now playing: " + result.title);
                                this.dispatcher = connection.playArbitraryInput(result.url);
                            });
                            
                        })
                        .catch(err => console.log(err));
                } else {
                    msg.reply("You have to be in a voice channel!");
                }
            }
        });
    }
    logger(message) {
        console.log(`${this.id} |=> ${message}`);
    }
}

exports.bot = (token, id, prefix) => new Bot(token, id, prefix);