const Discord = require('discord.js');
const Player = require('./utils/Player').Player;
require('dotenv').config();
const fs = require('fs');

const client = new Discord.Client();

//Command Handler
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
let aliases = [];

//load commands
fs.readdir("./Bot/commands/", (err, files) => {
    if (err) return console.log(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        console.log("Successfully loaded " + file)
        let commandName = file.split(".")[0];
        client.commands.set(commandName, props);
        props.help.aliases.forEach(alias => {
            client.aliases.set(alias, props);
            aliases.push(alias + ":" + props.help.name)
        });
    });
});

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
        client.login(this.token);

        client.on('ready', () => {
            this.logger(`${client.user.tag} ONLINE!`);

            //set some presence stuff
            client.user.setUsername("TuneZ");
            client.user.setPresence({ game: {name: 'by Adiber', type: 'WATCHING', url: 'https://adiber.at'}, status: 'dnd'}).catch(err => console.log(err));

            //create a player object for each server
            client.guilds.array().forEach((guild) => {
                this.servers.set(guild.id, Player({guild: guild, aliases: aliases, color: this.color, countryCode: this.countryCode, prefix: this.prefix}));
                this.logger('+ ' + guild.name);
            });
            this.logger("Servers: " + this.servers.size)

        });

        //message event
        client.on('message', msg => {
            //check if message was sent by the bot himself
            if(msg.author.id == client.user.id) return;
            //get the right player object
            let player = this.servers.get(msg.channel.guild.id);
            if(!player) return;

            //check if this bot is meant
            if(!msg.content.trim().startsWith(player.prefix)) return;

            //get the command
            let cmd = msg.content.trim().substr(player.prefix.length).split(' ')[0];

            //execute right command file
            let commandfile = client.aliases.get(cmd);           
            if(!commandfile) commandfile = client.commands.get(cmd);
            if(!commandfile) return;
            try {
                commandfile.run(player,msg);
            }catch(err) {
                this.logger(err);
            }
        });

        //message update
        client.on('messageUpdate', (_,msg) => {
            //check if message was sent by the bot himself
            if(msg.author.id == client.user.id) return;
            //get the right player object
            let player = this.servers.get(msg.channel.guild.id);
            if(!player) return;

            //check if this bot is meant
            if(!msg.content.trim().startsWith(player.prefix)) return;

            //get the command
            let cmd = msg.content.trim().substr(player.prefix.length).split(' ')[0];

            //execute right command file
            let commandfile = client.aliases.get(cmd);           
            if(!commandfile) commandfile = client.commands.get(cmd);
            if(!commandfile) return;
            try {
                commandfile.run(player,msg);
            }catch(err) {
                this.logger(err);
            }
        });

        //bot joins server
        client.on('guildCreate', guild => {
            this.servers.set(guild.id, Player({guild: guild, aliases: aliases, color: this.color, countryCode: this.countryCode, prefix: this.prefix}));
            this.logger('+ ' + guild.name);
        });

    }
    //logger for the different players
    logger(message) {
        console.log(`${this.id} |=> ${message}`);
    }
}

exports.bot = (token, id, prefix, color) => new Bot(token, id, prefix, color);