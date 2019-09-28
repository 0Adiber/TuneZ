module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to clean up the queue!');
        if(!player.voiceChannel || !player.voiceChannel.connection) return message.reply('The bot needs to be in a channel, to clean up the queue!');
        if(player.queue.length == 0) return message.reply('There is no song in the queue!');
        if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        let users = player.voiceChannel.members;
        users.forEach((value, k, m) => {
            for(let s in player.queue) {
                if(value.user.username === s.requestedBy) {
                    player.queue.splice(player.queue.indexOf(s.requestedBy), 1);
                }
            }
        });
        message.channel.send(`The loop is now cleaned up`);
}
module.exports.help = {
    name: 'cleanup',
    description: 'Removes all songs from the queue from people, which are no longer in the channel.',
    usage: 'cleanup',
    aliases: []
}