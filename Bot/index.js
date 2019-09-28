const Discord = require('discord.js');
const Player = require('./utils/Player').Player;
require('dotenv').config();
const fs = require('fs');

const client = new Discord.Client();

//Command Handler
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

//load commands
fs.readdir("./Bot/commands/", (err, files) => {
    if (err) return console.log(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        console.log("Successfully loaded " + file)
        let commandName = file.split(".")[0];
        client.commands.set(commandName, props);
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
                this.servers.set(guild.id, Player(guild, {color: this.color, countryCode: this.countryCode, prefix: this.prefix}));
                this.logger('+ ' + guild.name);
            });
            this.logger("Servers: " + this.servers.size)

        });

        //message event
        client.on('message', msg => {
            //check if this bot is meant
            if(!msg.content.trim().startsWith(this.prefix)) return;

            //get the command
            let cmd = msg.content.trim().substr(1).split(' ')[0];

            //get the right player object
            let player = this.servers.get(msg.channel.guild.id);
            if(!player) return;

            //execute right command file
            let commandfile = client.commands.get(cmd);
            if(!commandfile) return;    
                commandfile.run(player,msg);

        });
    }
    //logger for the different players
    logger(message) {
        console.log(`${this.id} |=> ${message}`);
    }
}

exports.bot = (token, id, prefix, color) => new Bot(token, id, prefix, color);