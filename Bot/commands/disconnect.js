module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to let the bot disconnect!');
        if(!player.voiceChannel) return message.reply("I am currently not in a voice channel!");
        if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        player.disconnected = true;
        player.voiceChannel.leave();
}
module.exports.help = {
    name: 'disconnect',
    description: 'Disconnects from the channel, but does not clear the queue.',
    usage: 'disconnect',
    aliases: []
}