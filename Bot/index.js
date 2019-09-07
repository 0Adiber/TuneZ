const Discord = require('discord.js');
const Player = require('./utils/Player').Player;

class Bot {

    constructor(token, id, prefix) {
        this.token = token;
        this.id = id;
        this.prefix = prefix;

        this.servers = new Map();

        this.start();
    }
    start() {
        const client = new Discord.Client();
        client.login(this.token);

        client.on('ready', () => {
            this.logger(`Logged in as ${client.user.tag}!`);

            client.guilds.array().forEach((guild) => {
                this.servers.set(guild.id, Player(guild));
                this.logger('+ ' + guild.name);
            });

            this.logger("Servers: " + this.servers.size)

        });

        client.on('message', msg => {
            if(!msg.content.startsWith(this.prefix)) return;

            if(msg.content.startsWith(`${this.prefix}play`)) {
                this.servers.get(msg.channel.guild.id).execute(msg);
            } else if(msg.content.startsWith(`${this.prefix}stop`)) {
                this.servers.get(msg.channel.guild.id).stop(msg);
            } else if(msg.content.startsWith(`${this.prefix}pause`)) {
                this.servers.get(msg.channel.guild.id).pause(msg);
            } else if(msg.content.startsWith(`${this.prefix}resume`)) {
                this.servers.get(msg.channel.guild.id).resume(msg);
            } else if(msg.content.startsWith(`${this.prefix}skip`)) {
                this.servers.get(msg.channel.guild.id).skip(msg);
            }

        });
    }
    logger(message) {
        console.log(`${this.id} |=> ${message}`);
    }
}

exports.bot = (token, id, prefix) => new Bot(token, id, prefix);