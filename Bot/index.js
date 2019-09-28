const {Client} = require('discord.js');
const Player = require('./utils/Player').Player;
require('dotenv').config()

class Bot {

    constructor(token, id, prefix, color) {
        this.token = token;
        this.id = id;
        this.prefix = prefix;
        this.color = color;

        //config
        this.countryCode = process.env.defaultCountryCode||'AT';

        this.servers = new Map();

        this.start();
    }
    async start() {
        const client = new Client();
        client.login(this.token);

        client.on('ready', () => {
            this.logger(`Logged in as ${client.user.tag}!`);

            client.user.setUsername("TuneZ");
            client.user.setPresence({ game: {name: 'by Adiber', type: 'WATCHING', url: 'https://adiber.at'}, status: 'dnd'}).catch(err => console.log(err));

            client.guilds.array().forEach((guild) => {
                this.servers.set(guild.id, Player(guild, {color: this.color, countryCode: this.countryCode, prefix: this.prefix}));
                this.logger('+ ' + guild.name);
            });

            this.logger("Servers: " + this.servers.size)

        });

        client.on('message', msg => {

            if(!msg.content.trim().startsWith(this.prefix)) return;

            let cmd = msg.content.trim().substr(1).split(' ')[0];

            let server = this.servers.get(msg.channel.guild.id);

            if(cmd === 'play') server.execute(msg);
            else if(cmd === 'playnow') server.playnow(msg);
            else if(cmd === 'playskip') server.playskip(msg);
            else if(cmd === 'stop') server.stop(msg);
            else if(cmd === 'pause') server.pause(msg);
            else if(cmd === 'resume') server.resume(msg);
            else if(cmd === 'queue') server.listQueue(msg);
            else if(cmd === 'volume') server.setVolume(msg);
            else if(cmd === 'help') server.help(msg);
            else if(cmd === 'disconnect') server.disconnect(msg);
            else if(cmd === 'loop') server.looping(msg);
            else if(cmd === 'remove') server.remove(msg);
            else if(cmd === 'move') server.move(msg);
            else if(cmd === 'skipto') server.skipto(msg);
            else if(cmd === 'skip') server.skip(msg);
            else if(cmd === 'clear') server.clear(msg);
            else if(cmd === 'charts') server.charts(msg);
            else if(cmd === 'default') server.default(msg);
            else if(cmd === 'loopqueue') server.loopingQueue(msg);
            else if(cmd === 'replay') server.replay(msg);
            else if(cmd === 'cleanup') server.cleanup(msg);
            else if(cmd === 'shuffle') server.shuffle(msg);
            else if(cmd === 'join') server.join(msg);
            else if(cmd === 'search') server.search(msg);
            else if(cmd === 'ping') server.ping(msg);
            else if(cmd === 'uptime') server.uptime(msg);
            else if(cmd === 'np') server.np(msg);
            else if(cmd === 'p') server.execute(msg);
            else if(cmd === 's') server.skip(msg);
            else if(cmd === 'd') server.default(msg);
            else if(cmd === 'c') server.clear(msg);

        });
    }
    logger(message) {
        console.log(`${this.id} |=> ${message}`);
    }
}

exports.bot = (token, id, prefix, color) => new Bot(token, id, prefix, color);