const {RichEmbed} = require('discord.js');

module.exports.run = async(player, message) => {
    if(player.queue.length == 0) return message.reply('There are no songs in the Queue!');

    let temp = [...player.queue];

    let description = `Currently Playing:\n[${player.currentSong.title}](${player.currentSong.officialUrl})|Requested by: ${player.currentSong.requestedBy}\n\n⬇️Next up⬇️`;

    for(let i = 0; i<10 && i<temp.length; i++) {
        description = description.concat(`\n\`${i+1}.\` [${temp[i].title}](${temp[i].officialUrl})|Requested by: ${temp[i].requestedBy}`);
    }

    description = description.concat(`\n\n**${player.queue.length} Songs are in the queue**`)

    const embed = new RichEmbed()
        .setTitle("Queue")
        .setColor(player.color)
        .setDescription(description);
    message.channel.send(embed);
}
module.exports.help = {
    name: 'queue',
    description: 'Lists the queue.',
    usage: 'queue',
    aliases: ['q']
}