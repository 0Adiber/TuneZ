module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
        if(!player.playing) return message.reply('There is currently no song playing!');
        if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        player.queue = [];
        player.loop = false;
        player.connection.dispatcher.end();
        message.channel.send("Stopped ⏹️");
}
module.exports.help = {
    name: 'stop',
    description: 'Stops the currently playing song, clears the queue and lets the bot disconnect.',
    usage: 'stop',
    aliases: []
}