module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!player.playing) return message.reply('There is currently no song playing!');
        if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        if(!player.loop) player.queue.unshift(player.currentSong);
        player.connection.dispatcher.end();
}
module.exports.help = {
    name: 'replay',
    description: 'Starts the currently playing song again.',
    usage: 'replay',
    aliases: []
}