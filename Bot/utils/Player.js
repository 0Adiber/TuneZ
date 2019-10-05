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

        //console.log(options)

        this.color = options.color || '#ff8c00';
        this.countryCode = options.countryCode || 'AT';
        this.prefix = options.prefix || '!';
        this.announcesongs = false;
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