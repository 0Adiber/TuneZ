module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        if(player.loop) {
            player.queue.shift();
        }
        player.connection.dispatcher.end();
        message.channel.send("Skipped ⏭️");
}
module.exports.help = {
    name: 'skip',
    description: 'Skips the currently playing song.',
    usage: 'skip',
    aliases: ['s']
}