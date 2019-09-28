const video = require('../utils/getVideoUrl');
module.exports.run = async(player, message) => {
    const args = message.content.replace(`${player.prefix}playnow`, "").trim().replace(/\s\s+/g, ' ').split(' ');
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
    if(player.playing) {
        if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
    }
    message.react("✅");
    const songInfo = await video.getUrl(args);
    const song = {
        title: songInfo.title,
        url: songInfo.url,
        requestedBy: message.member.user.username,
        officialUrl: songInfo.officialUrl
    }
    player.queue.unshift(song);
    message.reply(`🎵 ${song.title} playing now!`);
    if(player.connection && player.connection.dispatcher) {
        player.connection.dispatcher.end();
    } else {
        player.voiceChannel = message.member.voiceChannel;
        player.play();
    }
}
module.exports.help = {
    name: 'playnow',
    description: 'Plays the given song now, but does not skip the queue.',
    usage: 'playnow [args]',
    aliases: []
}