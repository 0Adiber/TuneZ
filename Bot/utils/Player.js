class Player{
    constructor(guild, aliases, options) {
        this.guild = guild;
        this.aliases = aliases;
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

}

exports.Player = (guild, options) => new Player(guild, options);