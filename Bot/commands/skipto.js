module.exports.run = async(player, message) => {
    const args = message.content.trim().split(' ');
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
    if(!player.playing) return message.reply("There is currently no song playing!");
    if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
    if(isNaN(args[1])) return message.reply('The command is \'move <entry>\', where entry is the position of the song in the queue!');
    if(player.queue.length < args[1]) return message.reply('That entry doesn\'t exist in the queue!');
    message.react("✅");

    let val = args[1].trim();
    if(val == 0) val = 1;
    val--;

    if(val < 0) {
        let entry = player.queue.pop();
        player.queue = []
        player.queue.push(entry);
        player.connection.dispatcher.end();
        message.channel.send(`Skipped ⏭️ to the last entry of the Queue.`)
    } else {
        player.queue = player.queue.slice(val);
        message.channel.send(`Skipped ⏭️ to the ${val+1}. entry of the Queue.`)
    }

    player.connection.dispatcher.end();
}
module.exports.help = {
    name: 'skipto',
    description: 'Skips to the given position in the queue.',
    usage: 'skipto [arg]',
    aliases: []
}