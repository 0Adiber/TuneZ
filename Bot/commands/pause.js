module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
    if(!player.connection.dispatcher) return message.reply('There is no sond playing!');
    if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
    if(player.connection.dispatcher.paused) return;
    message.react("✅");
    player.connection.dispatcher.pause();
    message.channel.send("Paused ⏸️");
}
module.exports.help = {
    name: 'pause',
    description: 'Pauses the currently playing song.',
    usage: 'pause',
    aliases: []
}