const doShuffle = require('../utils/shuffle');
module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to shuffle the queue!');
        if(!player.voiceChannel || !player.voiceChannel.connection) return message.reply('The bot needs to be in a channel, to shuffle the queue!');
        if(player.queue.length == 0) return message.reply('There is no song in the queue!');
        if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        await doShuffle.shuffle(player.queue);
        player.connection.dispatcher.end();
        message.channel.send(`The queue has been shuffled 🔀`);
}
module.exports.help = {
    name: 'shuffle',
    description: 'Shuffles the queue.',
    usage: 'shuffle',
    aliases: []
}