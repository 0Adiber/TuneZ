const video = require('../utils/getVideoUrl');
module.exports.run = async(player, message) => {
    const args = message.content.replace(`${player.prefix}playskip`, "").trim().replace(/\s\s+/g, ' ').split(' ');
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to playskip a song!');
    if(player.playing) {
        if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
    }
    player.queue = []
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
            player.queue.push(song);
        })
        message.reply(`🎵 ${player.queue[0].title} playing now!`);
    } else { //only one song
        const song = {
            title: songInfo.title,
            url: songInfo.url,
            requestedBy: message.member.user.username,
            officialUrl: songInfo.officialUrl
        }
        player.queue.push(song);
        
        message.reply(`🎵 ${song.title} playing now!`);
    }

    if(player.connection && player.connection.dispatcher) {
        player.connection.dispatcher.end();
    } else {
        player.voiceChannel = message.member.voiceChannel;
        player.play();
    }
}
module.exports.help = {
    name: 'playskip',
    description: 'Plays the given song and skips the whole queue',
    usage: 'playskip [args]',
    aliases: []
}