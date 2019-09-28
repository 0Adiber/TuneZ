module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to resume songs!');
    if(!player.connection.dispatcher) return message.reply('I can\'t resume, when I never paused!');
    if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');   
    if(!player.connection.dispatcher.paused) return;
    message.react("✅");
    player.connection.dispatcher.resume();
    message.channel.send("Resuming ⏯️");
}
module.exports.help = {
    name: 'resume',
    description: 'Resumes the currently paused song.',
    usage: 'resume',
    aliases: []
}