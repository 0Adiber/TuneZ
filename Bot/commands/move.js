module.exports.run = async(player, message) => {
    const args = message.content.split(' ');
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
        player.queue.unshift(entry);
        return message.channel.send(`Moved 🔝 the last entry - \`${entry.title}\` - to the first position of the Queue`);
    } else {
        let tempQ = []
        let entry;

        for(let i = 0; i<player.queue.length; i++) {
            if(i != val) tempQ.push(player.queue[i]);
            else entry = player.queue[i];
        }
        player.queue = [];
        player.queue = [...tempQ];

        player.queue.unshift(entry);
        return message.channel.send(`Moved 🔝 the ${val} entry - \`${entry.title}\` - to the first position of the Queue`);
    }
}
module.exports.help = {
    name: 'move',
    description: 'Moves the given song to the first position of the queue.',
    usage: 'move [arg]',
    aliases: []
}