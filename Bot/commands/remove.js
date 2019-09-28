module.exports.run = async(player, message) => {
    const args = message.content.split(' ');
        if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
        if(!player.playing) return message.reply("There is currently no song playing!");
        if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        if(isNaN(args[1])) return message.reply('The command is \'remove <entry>\', where entry is the position of the song in the queue!');
        if(player.queue.length < args[1]) return message.reply('That entry doesn\'t exist in the queue!');
        message.react("✅");

        let val = args[1].trim();

        if(val == 0) val = 1;
        val--;

        if(val < 0) {
            let entry = player.queue.pop();
            return message.channel.send(`Removed 🗑️ the last entry - \`${entry.title}\` - from the Queue`);
        } else {
            let tempQ = []
            let entry;

            for(let i = 0; i<player.queue.length; i++) {
                if(i != val) tempQ.push(player.queue[i]);
                else entry = player.queue[i];
            }
            player.queue = [];
            player.queue = [...tempQ];
            return message.channel.send(`Removed 🗑️ the ${val} entry - \`${entry.title}\` - from the Queue`);
        }
}
module.exports.help = {
    name: 'remove',
    description: 'Removes the given song from the queue.',
    usage: 'remove [arg]',
    aliases: []
}