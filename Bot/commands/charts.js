const video = require('../utils/getVideoUrl');
module.exports.run = async(player, message) => {
    const args = message.content.split(' ');
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to use player command!');
        if(player.playing) {
            if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        }
        message.react("✅");
        const code = args[1] || player.countryCode;
        const songInfo = await video.getCharts(code);
        
        if(!songInfo.status === "success") {
            message.channel.send("No success getting the Trends!");
            return;
        }

        songInfo.songs.forEach((song) => {
            song.requestedBy = message.member.user.username;
        });

        player.queue = [...player.queue, ...songInfo.songs];
        message.channel.send(`Added the top 10 trending songs 🔥 from ${code}'s YouTube to the queue.`);
        if(!player.playing) {
            player.voiceChannel = message.member.voiceChannel;
            player.play();
        }
}
module.exports.help = {
    name: 'charts',
    description: 'Add the top 10 Songs from the yt charts to the queue (for your region=> !charts <region code>); regionCode =  ISO 3166-1 alpha-2 country code',
    usage: 'charts [region code]',
    aliases: []
}