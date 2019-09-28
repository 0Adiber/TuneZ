module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
        if(player.queue.length == 0) return message.reply("The Queue is empty!");
        if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        player.queue = []
        message.channel.send(`🆑 Cleared the Queue.`);
}
module.exports.help = {
    name: 'clear',
    description: 'Clears the queeu.',
    usage: 'clear',
    aliases: []
}