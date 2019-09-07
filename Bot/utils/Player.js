const video = require('./getVideoUrl');

class Player{
    constructor(guild) {
        this.guild = guild;
        this.queue = [];
        this.playing = false;
    }

    async execute(message) {
        const args = message.content.split(' ');
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.reply('You need to be in a voice channel to play music!');
        if(this.playing && message.member.voiceChannel.id !== this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT') || !permissions.has('SPEAK')) return message.reply('I need the permissions to join and speak in your voice channel!');

        message.react("✅");

        const songInfo = await video.getUrl(args[1]);
        const song = {
            title: songInfo.title,
            url: songInfo.url
        }
        this.queue.push(song);
        message.reply(`${song.title} has been added to the queue!`);
        
        if(this.playing) return;

        try {
            this.connection = await voiceChannel.join();
            this.voiceChannel = voiceChannel;
            this.play();
        } catch(err){
            console.log(err);
        }
    }

    play() {
        this.playing = true;
        const song = this.queue.shift();
        if(!song) {
            this.voiceChannel.leave();
            this.playing = false;
            return;
        }
        const dispatcher =  this.connection.playArbitraryInput(song.url)
        .on('end', ()=>{
            console.log("Song ended!");
            this.play();
        })
        .on('error', error => {
            console.log(error);
        });
    }

    pause(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        if(!this.connection.dispatcher) return message.reply('There is no sond playing!');
        if(this.connection.dispatcher.paused) return;
        message.react("✅");
        this.connection.dispatcher.pause();
    }

    resume(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        if(!this.connection.dispatcher) return message.reply('There was no sond playing!');
        if(!this.connection.dispatcher.paused) return;
        message.react("✅");
        this.connection.dispatcher.resume();
    }

    skip(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        if(this.queue.length == 0) return message.reply('There is no song that I could skip to!');
        message.react("✅");
        this.connection.dispatcher.end();
    }

    stop(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        this.queue = [];
        this.connection.dispatcher.end();
    }

}

exports.Player = (guild) => new Player(guild);