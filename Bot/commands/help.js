const {RichEmbed} = require('discord.js');
require('dotenv').config();

module.exports.run = async(player, message) => {
    let description = `✅-out ${process.env.HELP_PAGE} \n**for a list of commands**`;

        const embed = new RichEmbed()
            .setTitle("Help")
            .setColor(player.color)
            .setDescription(description);
        message.channel.send(embed);
}
module.exports.help = {
    name: 'help',
    description: 'Helppage.',
    usage: 'help',
    aliases: ['?']
}