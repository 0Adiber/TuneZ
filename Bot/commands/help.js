const {RichEmbed} = require('discord.js');

module.exports.run = async(player, message) => {
    let description = `✅-out http://ec2-34-226-142-167.compute-1.amazonaws.com:7043/ \n**for a list of commands**`;

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