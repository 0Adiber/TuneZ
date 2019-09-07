const {Client} = require('discord.js');
const Player = require('./utils/Player').Player;

class Bot {

    constructor(token, id, prefix, color) {
        this.token = token;
        this.id = id;
        this.prefix = prefix;
        this.color = color;

        this.servers = new Map();

        this.start();
    }
    start() {
        const client = new Client();
        client.login(this.token);

        client.on('ready', () => {
            this.logger(`Logged in as ${client.user.tag}!`);

            client.guilds.array().forEach((guild) => {
                this.servers.set(guild.id, Player(guild, {color: this.color}));
                this.logger('+ ' + guild.name);
            });

            this.logger("Servers: " + this.servers.size)

        });

        client.on('message', msg => {
            if(!msg.content.startsWith(this.prefix)) return;

            if(msg.content.startsWith(`${this.prefix}playnow`)) {
                this.servers.get(msg.channel.guild.id).playnow(msg);
            } else if(msg.content.startsWith(`${this.prefix}playskip`)) {
                this.servers.get(msg.channel.guild.id).playskip(msg);
            } else if(msg.content.startsWith(`${this.prefix}play`)) {
                this.servers.get(msg.channel.guild.id).execute(msg);
            } else if(msg.content.startsWith(`${this.prefix}stop`)) {
                this.servers.get(msg.channel.guild.id).stop(msg);
            } else if(msg.content.startsWith(`${this.prefix}pause`)) {
                this.servers.get(msg.channel.guild.id).pause(msg);
            } else if(msg.content.startsWith(`${this.prefix}resume`)) {
                this.servers.get(msg.channel.guild.id).resume(msg);
            }  else if(msg.content.startsWith(`${this.prefix}queue`)) {
                this.servers.get(msg.channel.guild.id).listQueue(msg);
            } else if(msg.content.startsWith(`${this.prefix}volume`)) {
                this.servers.get(msg.channel.guild.id).volume(msg);
            } else if(msg.content.startsWith(`${this.prefix}help`)) {
                this.servers.get(msg.channel.guild.id).help(msg);
            } else if(msg.content.startsWith(`${this.prefix}disconnect`)) {
                this.servers.get(msg.channel.guild.id).disconnect(msg);
            } else if(msg.content.startsWith(`${this.prefix}loop`)) {
                this.servers.get(msg.channel.guild.id).looping(msg);
            } else if(msg.content.startsWith(`${this.prefix}remove`)) {
                this.servers.get(msg.channel.guild.id).remove(msg);
            } else if(msg.content.startsWith(`${this.prefix}move`)) {
                this.servers.get(msg.channel.guild.id).move(msg);
            } else if(msg.content.startsWith(`${this.prefix}skipto`)) {
                this.servers.get(msg.channel.guild.id).skipto(msg);
            } else if(msg.content.startsWith(`${this.prefix}skip`)) {
                this.servers.get(msg.channel.guild.id).skip(msg);
            } else if(msg.content.startsWith(`${this.prefix}clear`)) {
                this.servers.get(msg.channel.guild.id).clear(msg);
            }

        });
    }
    logger(message) {
        console.log(`${this.id} |=> ${message}`);
    }
}

exports.bot = (token, id, prefix, color) => new Bot(token, id, prefix, color);