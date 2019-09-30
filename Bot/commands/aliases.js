const {RichEmbed} = require('discord.js');

module.exports.run = async(player, message) => {
    let description = "Available aliases are: \n\n";
    
    const embed = new RichEmbed()
            .setTitle("Aliases")
            .setColor(player.color)
            .setDescription(description);
        message.channel.send(embed);
}
module.exports.help = {
    name: 'aliases',
    description: 'Displays the available aliases.',
    usage: 'aliases',
    aliases: []
}