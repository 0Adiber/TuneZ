const {RichEmbed, Message} = require('discord.js')
const video = require('./getVideoUrl');

class Player{
    constructor(guild, color) {
        this.guild = guild;
        this.queue = [];
        this.playing = false;
        this.color = color;
        this.volume = 1;
        this.loop = false;
    }

    /**
     * The actual play command
     * @param {Message} message
     */
    async execute(message) {
        const args = message.content.replace("!play", "").trim().replace(/\s\s+/g, ' ').split(' ');
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.reply('You need to be in a voice channel to play music!');
        if(this.playing && message.member.voiceChannel.id !== this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT') || !permissions.has('SPEAK')) return message.reply('I need the permissions to join and speak in your voice channel!');

        message.react("✅");
        const songInfo = await video.getUrl(args);
        const song = {
            title: songInfo.title,
            url: songInfo.url,
            requestedBy: message.member.user.username,
            officialUrl: songInfo.officialUrl
        }
        this.queue.push(song);
        message.reply(`${song.title} has been added to the queue!`);
        
        if(this.playing) return;

        message.channel.send("Now Playing 🎵 `" + song.title + "`");
        this.voiceChannel = voiceChannel;
        this.play();
    }

    /**
     * Plays the songs and creates the dispatcher
     * @param {Message} message
     */
    play() {
        this.playing = true;
        try {
            this.voiceChannel.join().then(connection => {
                this.connection = connection;

                const song = this.queue.shift();
                if(!song) {
                    this.voiceChannel.leave();
                    this.playing = false;
                    return;
                }

                if(this.loop) {
                    this.queue.unshift(song);   
                }

                this.currentSong = song;
                const dispatcher =  this.connection.playArbitraryInput(song.url)
                .on('start', () => {
                    dispatcher.setVolume(this.volume);
                })
                .on('end', ()=>{
                    console.log("Song ended!");
                    this.playing = false;
                    this.play();
                })
                .on('error', error => {
                    console.log(error);
                });
                dispatcher.setVolume(this.volume);
            });
        }catch(err) {
            console.log(err);
        }
        
    }

    /**
     * Pause the current song
     * @param {Message} message
     */
    pause(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!this.connection.dispatcher) return message.reply('There is no sond playing!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        if(this.connection.dispatcher.paused) return;
        message.react("✅");
        this.connection.dispatcher.pause();
        message.channel.send("Paused ⏸️");
    }

    /**
     * Resume the current song
     * @param {Message} message
     */
    resume(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!this.connection.dispatcher) return message.reply('I can\'t resume, when I never paused!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');   
        if(!this.connection.dispatcher.paused) return;
        message.react("✅");
        this.connection.dispatcher.resume();
        message.channel.send("Resuming ⏯️");
    }

    /**
     * Skip to the next entry of the Queue
     * @param {Message} message
     */
    skip(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(this.queue.length == 0) return message.reply('There is no song that I could skip to!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        this.connection.dispatcher.end();
        message.channel.send("Skipped ⏭️");
    }

    /**
     * Emties the Queue and stops the current Song
     * @param {Message} message
     */
    stop(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!this.playing) return message.reply('There is currently no song playing!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        this.queue = [];
        this.connection.dispatcher.end();
        message.channel.send("Stopped ⏹️");
    }

    /**
     * Lists the Queue
     * @param {Message} message
     */
    listQueue(message) {
        if(this.queue.length == 0) return message.reply('There are no songs in the Queue!');

        let temp = [...this.queue];

        let description = `Currently Playing:\n[${this.currentSong.title}](${this.currentSong.officialUrl})|Requested by: ${this.currentSong.requestedBy}\n\n⬇️Next up⬇️`;

        for(let i = 0; i<10 && i<temp.length; i++) {
            description = description.concat(`\n\`${i+1}.\` [${temp[i].title}](${temp[i].officialUrl})|Requested by: ${temp[i].requestedBy}`);
        }

        description = description.concat(`\n\n**${this.queue.length} Songs are in the queue**`)

        const embed = new RichEmbed()
            .setTitle("Queue")
            .setColor(this.color)
            .setDescription(description);
        message.channel.send(embed);
    }

    /**
     * Change the volume of the Player(0.5 = 50%, 1 = 100%, 2 = 200%, ...)
     * @param {Message} message
     */
    volume(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!this.playing) return message.reply('There is currently no song playing!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        const args = message.content.split(' ');
        
        if(isNaN(args[1].trim())) {
            message.reply("The command is 'volume <num>', where num is the multiplier (0.5 = 50%, 1 = 100%, 2 = 200%, ...)")
            return;
        }

        const vol = Math.abs(args[1].trim());

        let em;
        if(vol>this.volume) em = "🔊";
        else if(vol<this.volume) em = "🔉";
        else if(vol==0) em = "🔇";
        else em = "🔈";

        this.connection.dispatcher.setVolume(vol);
        this.volume = vol
        message.reply(`Volume changed to ${vol*100}% ${em}`)
    }

    /**
     * Makes the Music Bot leave the channel, but only pauses the Queue
     * @param {Message} message
     */
    disconnect(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
        if(!message.client.voiceChannel) return message.reply("I am currently not in a voice channel!");
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        this.pause(message);
        this.voiceChannel.leave();
    }

    /**
     * Shows the Help page
     * @param {Message} message
     */
    help(message) {

        description = `✔-out https://github.com/0Adiber/DiscordMusicBot \n**for a list of commands**`;

        const embed = new RichEmbed()
            .setTitle("Help")
            .setColor(this.color)
            .setDescription(description);
        message.channel.send(embed);
    }

    /**
     * Loop the current Song
     * @param {Message} message
     */
    looping(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
        if(!this.playing) return message.reply("There is currently no song playing!");
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        if(!this.loop) {
            this.queue.unshift(this.currentSong);
            this.loop = true;
            message.channel.send(`Looping🔁 \`${this.currentSong.title}\``);
        } else {
            this.queue.shift();
            this.loop = false;
            message.channel.send(`Loop stopped ❌`);
        }
    }

    /**
     * Remove an entry from the Queue
     * @param {Message} message
     */
    remove(message) {
        const args = message.content.split(' ');
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
        if(!this.playing) return message.reply("There is currently no song playing!");
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        if(isNaN(args[1])) return message.reply('The command is \'remove <entry>\', where entry is the position of the song in the queue!');
        if(this.queue.length < args[1]) return message.reply('That entry doesn\'t exist in the queue!');
        message.react("✅");

        let val = args[1].trim();

        if(val == 0) val = 1;
        val--;

        if(val < 0) {
            let entry = this.queue.pop();
            return message.channel.send(`Removed 🗑️ the last entry - \`${entry.title}\` - from the Queue`);
        } else {
            let tempQ = []
            let entry;

            for(let i = 0; i<this.queue.length; i++) {
                if(i != val) tempQ.push(this.queue[i]);
                else entry = this.queue[i];
            }
            this.queue = [];
            this.queue = [...tempQ];
            return message.channel.send(`Removed 🗑️ the ${val} entry - \`${entry.title}\` - from the Queue`);
        }
    }

    /**
     * Move an entry of the Queue to the first place
     * @param {Message} message
     */
    move(message) {
        const args = message.content.split(' ');
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
        if(!this.playing) return message.reply("There is currently no song playing!");
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        if(isNaN(args[1])) return message.reply('The command is \'move <entry>\', where entry is the position of the song in the queue!');
        if(this.queue.length < args[1]) return message.reply('That entry doesn\'t exist in the queue!');
        message.react("✅");

        let val = args[1].trim();

        if(val == 0) val = 1;
        val--;

        if(val < 0) {
            let entry = this.queue.pop();
            this.queue.unshift(entry);
            return message.channel.send(`Moved 🔝 the last entry - \`${entry.title}\` - to the first position of the Queue`);
        } else {
            let tempQ = []
            let entry;

            for(let i = 0; i<this.queue.length; i++) {
                if(i != val) tempQ.push(this.queue[i]);
                else entry = this.queue[i];
            }
            this.queue = [];
            this.queue = [...tempQ];

            this.queue.unshift(entry);
            return message.channel.send(`Moved 🔝 the ${val} entry - \`${entry.title}\` - to the first position of the Queue`);
        }
    }

    /**
     * Skip to a certain Entry of the Queue
     * @param {Message} message
     */
    skipto(message) {
        const args = message.content.split(' ');
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
        if(!this.playing) return message.reply("There is currently no song playing!");
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        if(isNaN(args[1])) return message.reply('The command is \'move <entry>\', where entry is the position of the song in the queue!');
        if(this.queue.length < args[1]) return message.reply('That entry doesn\'t exist in the queue!');
        message.react("✅");

        let val = args[1].trim();
        if(val == 0) val = 1;
        val--;

        if(val < 0) {
            let entry = this.queue.pop();
            this.queue = []
            this.queue.push(entry);
            this.connection.dispatcher.end();
            message.channel.send(`Skipped ⏭️ to the last entry of the Queue.`)
        } else {
            this.queue = this.queue.slice(val);
            message.channel.send(`Skipped ⏭️ to the ${val+1}. entry of the Queue.`)
        }

        this.connection.dispatcher.end();
    }

    /**
     * Clears the Queue
     * @param {Message} message
     */
    clear(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
        if(this.queue.length == 0) return message.reply("The Queue is empty!");
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        this.queue = []
        message.channel.send(`🆑 Cleared the Queue.`);
    }

    /**
     * Play the wanted Song now, and skip the rest of the Queue
     * @param {Message} message
     */
    playskip(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
        if(this.playing) {
            if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        }
        this.queue = []
        message.react("✅");
        const songInfo = await video.getUrl(args);
        const song = {
            title: songInfo.title,
            url: songInfo.url,
            requestedBy: message.member.user.username,
            officialUrl: songInfo.officialUrl
        }
        this.queue.push(song);
        message.reply(`🎵 ${song.title} playing now!`);
        this.connection.dispatcher.end();
    }

    /**
     * Play the wanted Song now, and then continue with the queue
     * @param {Message} message
     */
    playnow(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
        if(this.playing) {
            if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        }
        message.react("✅");
        const songInfo = await video.getUrl(args);
        const song = {
            title: songInfo.title,
            url: songInfo.url,
            requestedBy: message.member.user.username,
            officialUrl: songInfo.officialUrl
        }
        this.queue.unshift(song);
        message.reply(`🎵 ${song.title} playing now!`);
        this.connection.dispatcher.end();
    }

}

exports.Player = (guild, color) => new Player(guild, color);