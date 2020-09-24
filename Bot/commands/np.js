const {RichEmbed} = require('discord.js');

module.exports.run = async(player, message) => {
    if(!player.playing) {
        const embed = new RichEmbed()
        .setTitle("Currently Playing")
        .setColor(player.color)
        .setDescription('There is currenly no song playing.');
        return message.channel.send(embed);
    }
    const embed = new RichEmbed()
        .setTitle("Currently Playing")
        .setColor(player.color)
        .setDescription(`\`${player.currentSong.title}\` | Requested by: ${player.currentSong.requestedBy}`);
    message.channel.send(embed);
}
module.exports.help = {
    name: 'np',
    description: 'Shows the currently playing song.',
    usage: 'np',
    aliases: []
}