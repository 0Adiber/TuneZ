const fs = require('fs');

class Player{
    constructor(options = {}) {
        this.guild = options.guild;
        this.aliases = options.aliases;
        this.queue = [];
        this.playing = false;
        this.volume = 1;
        this.loop = false;
        this.loopQueue = false;
        this.disconnected = false;

        this.searchList = [];
        this.searchWaiting = false;


        //PLAYER SETTINGS PER SERVER
            fs.closeSync(fs.openSync(`./Bot/serverdata/${this.guild.id}.json`, 'a'));

            let content = JSON.parse(fs.readFileSync(`./Bot/serverdata/${this.guild.id}.json`, {encoding:'utf8'})||"{}");

            this.color = content.color || options.color || '#ff8c00';
            this.countryCode = content.ccode || options.countryCode || 'AT';
            this.prefix = content.preifx || options.prefix || '!';
            this.announcesongs = content.announce || false;

            content.color = this.color;
            content.ccode = this.countryCode;        
            content.prefix = this.prefix;
            content.announce = this.announcesongs;

            fs.writeFileSync(`./Bot/serverdata/${this.guild.id}.json`, JSON.stringify(content));
        //OVER

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
                    if(this.loop) {
                        this.queue.unshift(this.currentSong);   
                    }
    
                    if(this.loopQueue) {
                        this.queue.push(this.currentSong);
                    }

                    this.playing = false;
                    
                    if(this.announcesongs && queue.length > 0) message.channel.send("🔔 Next up: `" + queue[0].title + "`");

                    if(!this.disconnected) this.play();
                })
                .on('error', error => {
                    console.log(error);
                });
            });
        }catch(err) {
            console.log(err);
        }
        
    }

}

exports.Player = (guild, options) => new Player(guild, options);