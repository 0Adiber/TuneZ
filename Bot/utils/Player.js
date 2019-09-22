const {RichEmbed, Message} = require('discord.js')
const video = require('./getVideoUrl');
const doShuffle = require('./shuffle');
const fs = require('fs');

class Player{
    constructor(guild, options) {
        this.guild = guild;
        this.queue = [];
        this.playing = false;
        this.volume = 1;
        this.loop = false;
        this.loopQueue = false;
        this.disconnected = false;

        this.searchList = [];
        this.searchWaiting = false;

        //options
        options = options || {};
        this.color = options.color || '#ff8c00';
        this.countryCode = options.countryCode || 'AT';
        this.prefix = options.prefix || '!';
    }

    /**
     * The actual play command
     * @param {Message} message
     */
    async execute(message) {
        const args = message.content.replace(`${this.prefix}play`, "").trim().replace(/\s\s+/g, ' ').split(' ');
        const voiceChannel = message.member.voiceChannel;

        if(!voiceChannel) return message.reply('You need to be in a voice channel to play music!');
        if(this.playing && message.member.voiceChannel.id !== this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT') || !permissions.has('SPEAK')) return message.reply('I need the permissions to join and speak in your voice channel!');

        if(args[0] == '') {
            if(this.queue.length > 0) {
                this.voiceChannel = voiceChannel;
                let song = this.queue.shift();
                message.channel.send("Now Playing 🎵 `" + song.title + "`");
                this.queue.unshift(song);
                this.play();
                return;
            }
            return message.reply("There is no Song I could play!");
        }

        message.react("✅");
        const songInfo = await video.getUrl(args);

        if(songInfo.songs) {//a list of songs because of playlist
            songInfo.songs.forEach((song) => {
                song.requestedBy = message.member.user.username;
            });
            this.queue = [...this.queue, ...songInfo.songs];
            message.channel.send(`The playlist has been added to the queue!`);

            if(this.playing) return;

            message.channel.send("Now Playing 🎵 `" + songInfo.songs[0].title + "`");
            this.voiceChannel = voiceChannel;
            this.play();
        } else {    //only one song
            const song = {
                title: songInfo.title,
                url: songInfo.url,
                requestedBy: message.member.user.username,
                officialUrl: songInfo.officialUrl
            }

            this.queue.push(song);
            message.channel.send(`${song.title} has been added to the queue!`);
            if(this.playing) return;

            message.channel.send("Now Playing 🎵 `" + song.title + "`");
            this.voiceChannel = voiceChannel;
            this.play();
        }
    }

    /**
     * Plays the songs and creates the dispatcher
     * @param {Message} message
     */
    async play() {
        this.playing = true;
        this.disconnected = false;
        try {
            this.voiceChannel.join().then(connection => {
                this.connection = connection;

                const song = this.queue.shift();
                if(!song) {
                    this.voiceChannel.leave();
                    this.playing = false;
                    return;
                }

                if(this.voiceChannel && this.voiceChannel.members.size < 2) {
                    this.voiceChannel.leave();
                    this.playing = false;
                    return;
                }

                this.currentSong = song;
                const dispatcher =  this.connection.playArbitraryInput(song.url)
                .on('start', () => {
                    dispatcher.setVolume(this.volume);
                })
                .on('end', ()=>{
                    console.log("Song ended!");

                    if(this.loop) {
                        this.queue.unshift(this.currentSong);   
                    }
    
                    if(this.loopQueue) {
                        this.queue.push(this.currentSong);
                    }

                    this.playing = false;
                    if(!this.disconnected) this.play();
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
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to resume songs!');
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
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        if(this.loop) {
            this.queue.shift();
        }
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
    setVolume(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!this.playing) return message.reply('There is currently no song playing!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        const args = message.content.split(' ');
        
        if(args.length < 2) return message.reply("The current volume is "+ this.volume*100 + "% 🎚️");

        if(isNaN(args[1].trim())) {
            message.reply("The command is 'volume <num>', where num is the multiplier (0.5 = 50%, 1 = 100%, 2 = 200%, ...)")
            return;
        }

        const vol = Math.abs(args[1].trim());

        let em;
        if(vol>this.volume) em = "🔊";
        else if(vol==0) em = "🔇";
        else if(vol<this.volume) em = "🔉";
        else em = "🔈";

        this.connection.dispatcher.setVolume(vol);
        this.volume = vol
        message.reply(`Volume changed to ${vol*100}% ${em}`)
    }

    /**
     * Makes the Music Bot leave the channel, but only pauses the Queue and stops the current song
     * @param {Message} message
     */
    disconnect(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to let the bot disconnect!');
        if(!this.voiceChannel) return message.reply("I am currently not in a voice channel!");
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        this.disconnected = true;
        this.voiceChannel.leave();
    }

    /**
     * Shows the Help page
     * @param {Message} message
     */
    help(message) {
        let description = `✅-out http://ec2-34-226-142-167.compute-1.amazonaws.com:7043/ \n**for a list of commands**`;

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
        if(!this.playing || !this.currentSong) return message.reply("There is currently no song playing!");
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        if(!this.loop) {
            //this.queue.unshift(this.currentSong);
            this.loop = true;
            message.channel.send(`Looping🔂 \`${this.currentSong.title}\``);
        } else {
            //this.queue.shift();
            this.loop = false;
            message.channel.send(`Loop stopped ❌`);
        }
    }

    /**
     * Loop the whole queue -> stops the song loop
     * @param {Message} message 
     */

    loopingQueue(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop the queue!');
        if(!this.playing || !this.currentSong) return message.reply("There is currently no song playing!");
        if(this.queue.length == 0) return message.reply("There is not a single song in the queue!");
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        if(this.loopQueue) {
            this.loopQueue = false;
            return message.channel.send(`Queue Loop stopped ❌`);
        }
        if(this.loop) {
            this.queue.push(this.queue.shift());
            this.loop = false;
            this.loopQueue = true;
            message.channel.send(`Loop stopped ❌, Queue Loop started 🔁`);
        } else {
            //this.queue.push(this.queue.shift());
            this.loopQueue = true;
            message.channel.send(`Queue Loop started 🔁`);
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
        const args = message.content.trim().split(' ');
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
    async playskip(message) {
        const args = message.content.replace(`${this.prefix}playskip`, "").trim().replace(/\s\s+/g, ' ').split(' ');
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to playskip a song!');
        if(this.playing) {
            if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        }
        this.queue = []
        message.react("✅");
        const songInfo = await video.getUrl(args);

        if(songInfo.songs) { //playlist
            songInfo.songs.forEach((s) => {
                const song = {
                    title: s.title,
                    url: s.url,
                    requestedBy: message.member.user.username,
                    officialUrl: s.officialUrl
                }
                this.queue.push(song);
            })
            message.reply(`🎵 ${this.queue[0].title} playing now!`);
        } else { //only one song
            const song = {
                title: songInfo.title,
                url: songInfo.url,
                requestedBy: message.member.user.username,
                officialUrl: songInfo.officialUrl
            }
            this.queue.push(song);
            
            message.reply(`🎵 ${song.title} playing now!`);
        }

        if(this.connection && this.connection.dispatcher) {
            this.connection.dispatcher.end();
        } else {
            this.voiceChannel = message.member.voiceChannel;
            this.play();
        }
    }

    /**
     * Play the wanted Song now, and then continue with the queue
     * @param {Message} message
     */
    async playnow(message) {
        const args = message.content.replace(`${this.prefix}playnow`, "").trim().replace(/\s\s+/g, ' ').split(' ');
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
        if(this.connection && this.connection.dispatcher) {
            this.connection.dispatcher.end();
        } else {
            this.voiceChannel = message.member.voiceChannel;
            this.play();
        }
    }
    /**
     * Add the top 10 Songs from the yt charts to the queue (for your region=> !charts <region code>)
     * regionCode =  ISO 3166-1 alpha-2 country code
     * 
     * sadly it doesn't work that well, because yt messed up with the ordering of the trends, but when that's fixed, it should yield the top 10, and not just any of the trends
     * 
     * @param {Message} message 
     */
    async charts(message){
        const args = message.content.split(' ');
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to use this command!');
        if(this.playing) {
            if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        }
        message.react("✅");
        const code = args[1] || this.countryCode;
        const songInfo = await video.getCharts(code);
        
        if(!songInfo.status === "success") {
            message.channel.send("No success getting the Trends!");
            return;
        }

        songInfo.songs.forEach((song) => {
            song.requestedBy = message.member.user.username;
        });

        this.queue = [...this.queue, ...songInfo.songs];
        message.channel.send(`Added the top 10 trending songs 🔥 from ${code}'s YouTube to the queue.`);
        if(!this.playing) {
            this.voiceChannel = message.member.voiceChannel;
            this.play();
        }
    }

    /**
     * Every user can have his personal playlist with a maximum of 25 songs per user
     * @param {Message} message 
     */
    async default(message) {
        message.react("✅");
        const args = message.content.split(' ');
        if(!fs.existsSync(`./Bot/userdata/${message.channel.guild.id}`)) fs.mkdirSync(`./Bot/userdata/${message.channel.guild.id}`, { recursive: true });

        fs.closeSync(fs.openSync(`./Bot/userdata/${message.channel.guild.id}/${message.member.user.id}.json`, 'a'));

        let content = JSON.parse(fs.readFileSync(`./Bot/userdata/${message.channel.guild.id}/${message.member.user.id}.json`, {encoding:'utf8'})||"{}");

        if(args[1] === 'add') {
            if(Object.keys(content).length >= 25) return message.channel.send("You already have 25 songs in your default playlist!");
            video.getUrl(args.slice(2)).then(song => {
                if(song.songs) {
                    song.songs.forEach((s) => {
                        if(Object.keys(content).length >= 25) return;
                        content[s.vid] = {
                            title: s.title,
                            url: s.url,
                            officialUrl: s.officialUrl
                        }
                    });
                    message.channel.send(`Added the playlist to your default playlist.`)
                } else {
                    content[song.vid] = {
                        title: song.title,
                        url: song.url,
                        officialUrl: song.officialUrl
                    };
                    message.channel.send(`Added \`${song.title}\` to your default playlist.`)
                }
                fs.writeFileSync(`./Bot/userdata/${message.channel.guild.id}/${message.member.user.id}.json`, JSON.stringify(content));
                
            }).catch(err => console.log(err));
        } else if(args[1] === 'remove') {
            video.getUrl(args.slice(2)).then(song => {
                if(song.songs) {
                    song.songs.forEach((s) => {
                        delete content[s.vid];
                    });
                } else {
                    delete content[song.vid];
                }
                fs.writeFileSync(`./Bot/userdata/${message.channel.guild.id}/${message.member.user.id}.json`, JSON.stringify(content));
                message.channel.send(`Removed 🗑️ \`${song.title}\` from your default playlist.`)
            }).catch(err=>console.log(err));
        } else if(args[1] === 'clear') {
            fs.writeFileSync(`./Bot/userdata/${message.channel.guild.id}/${message.member.user.id}.json`, JSON.stringify({}));
            message.channel.send(`Cleared 🆑 your default playlist`);
        } else if(args[1] === 'list') {
            if(Object.keys(content).length === 0) return message.channel.send('Your default playlist is empty!');
            let description = "";
            let i = 0;
            Object.values(content).forEach(song => {
                description = description.concat(`\n\`${++i}.\` [${song.title}](${song.officialUrl})`);
            });
            const embed = new RichEmbed()
            .setTitle(`${message.member.user.username} default playlist`)
            .setColor(this.color)
            .setDescription(description);
            message.channel.send(embed);
        } else if(!args[1]) {
            if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to play your default!');
            if(this.playing) {
                if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
            }

            if(Object.keys(content).length === 0) return message.channel.send('You don\'t have any songs in your default playlist yet.');

            Object.values(content).forEach(song => {
                this.queue.push({
                    title: song.title,
                    url: song.url,
                    officialUrl: song.officialUrl,
                    requestedBy: message.member.user.username
                });
            });
            
            message.channel.send(`Your default playlist has been added to the queue!`);

            if(!this.playing){
                this.voiceChannel = message.member.voiceChannel;
                this.play();
                message.channel.send(`Now Playing 🎵 \`${this.queue[0].title}\``);
            }
        } else {
            message.channel.send('The command is \'default [add/remove/clear <query/link>]\'');
        }
        
    }

    /**
     * shows what song is currently playing
     * @param {Message} message 
     */
    async np(message) {
        if(!this.playing) {
            const embed = new RichEmbed()
            .setTitle("Currently Playing")
            .setColor(this.color)
            .setDescription('There is currenly no song playing.');
            return message.channel.send(embed);
        }
        const embed = new RichEmbed()
            .setTitle("Currently Playing")
            .setColor(this.color)
            .setDescription(`\`${this.currentSong.title}\` | Requested by: ${this.currentSong.requestedBy}`);
        message.channel.send(embed);
    }

    /**
     * plays the current song playing again
     * @param {Messsage} message 
     */
    async replay(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!this.playing) return message.reply('There is currently no song playing!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        if(!this.loop) this.queue.unshift(this.currentSong);
        this.connection.dispatcher.end();        
    }

    /**
     * Removes absent user's songs from the queue
     * @param {Message} message 
     */
    async cleanup(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to clean up the queue!');
        if(!this.voiceChannel || !this.voiceChannel.connection) return message.reply('The bot needs to be in a channel, to clean up the queue!');
        if(this.queue.length == 0) return message.reply('There is no song in the queue!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        let users = this.voiceChannel.members;
        users.forEach((value, k, m) => {
            for(let s in this.queue) {
                if(value.user.username === s.requestedBy) {
                    this.queue.splice(this.queue.indexOf(s.requestedBy), 1);
                }
            }
        });
        message.channel.send(`The loop is now cleaned up`);
    }

    /**
     * Shuffles the queue and skips the current song
     * @param {Message} message 
     */
    async shuffle(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to shuffle the queue!');
        if(!this.voiceChannel || !this.voiceChannel.connection) return message.reply('The bot needs to be in a channel, to shuffle the queue!');
        if(this.queue.length == 0) return message.reply('There is no song in the queue!');
        if(!message.member.voiceChannel.id === this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        await doShuffle.shuffle(this.queue);
        this.connection.dispatcher.end();
        message.channel.send(`The queue has been shuffled 🔀`);
    }

    /**
     * Searches youtube for a query and adds the results to a current list
     * and choose a result by number or cancel the search
     * when a number is chosen, it gets placed to the queue
     * @param {Message} message 
     */
    async search(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to search a video!');
        if(this.playing && message.member.voiceChannel.id !== this.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');

        const args = message.content.trim().split(' ');
        if(this.searchWaiting) {
            if(args.length < 2) return message.reply(`You need to make a choice, or cancel the current search!`);
            if(args[1].toLowerCase() === "cancel") {
                message.react("✅");
                this.searchWaiting = false;
                message.channel.send(`Canceled the search process.👌`);
                return;
            }
            if(isNaN(args[1])) return message.reply(`Please enter a number or cancel 💢`);
            if(this.searchList.length < args[1]) return message.reply(`That number is to high! 💢`);
            message.react("✅");
    
            let val = args[1].trim();
            if(val == 0) val = 1;
            val--;

            this.queue.push(this.searchList[val]);
            message.channel.send(`Added the song to the queue 👍`);
            
            if(this.playing) return;
            
            message.channel.send("Now Playing 🎵 `" + this.searchList[val].title + "`");
            this.searchWaiting = false;
            this.voiceChannel = message.member.voiceChannel;
            this.play();
            
            return;
        }
        if(args.length < 1) return message.reply(`You need to give me something to search for 🤔`);
        
        message.react("✅");
        message.channel.send(`Searching 🔍 ${args.slice(1).join(' ')}`);

        let res = await video.getSearch(args);
        if(res.status === "success" && res.songs.length > 0) {

            this.searchList = [...res.songs];
            this.searchWaiting = true;

            let description = ``;
            for(let i = 0; i<res.songs.length; i++) {
                description = description.concat(`\n\n\`${i+1}.\` [${res.songs[i].title}](${res.songs[i].officialUrl})`);
            }
    
            description = description.concat(`\n\n**Type '${this.prefix}search <number>' to make a choice, or '${this.prefix}search cancel' to exit**`)
    
            const embed = new RichEmbed()
                .setAuthor(message.member.user.username, message.member.user.avatarURL)
                .setColor(this.color)
                .setDescription(description);
            message.channel.send(embed);

        } else {
            message.channel.send(`There was an error 😢`);
        }
    }

    /**
     * Lists command aliases
     * @param {Message} message 
     */
    async aliases(message) {

    }

    /**
     * checks the bot's response time to discord
     * @param {Message} message 
     */
    async ping(message) {

    }

    /**
     * Summon the bot to your channel
     * @param {Message} message 
     */
    async join(message) {
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel!');
        if(this.voiceChannel && this.voiceChannel.members.size > 1) return message.reply('Sorry, I am already being used.');
        message.react("✅");
        message.member.voiceChannel.join();
        message.channel.send(`Joined \`${message.member.voiceChannel.name}\` 🏃`);
    }

    /**
     * Get the lyrics of the current playing song
     * @param {Message} message 
     */
    async lyrics(message) {

    }

    /**
     * Change settings of this player
     * @param {Message} message 
     */
    async settings(message) {

    }

}

exports.Player = (guild, options) => new Player(guild, options);