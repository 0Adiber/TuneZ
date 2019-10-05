const fetch = require('node-fetch');
const {RichEmbed} = require('discord.js');

module.exports.run = async(player, message) => {
    const args = message.content.replace(`${player.prefix}lyrics`, "").trim().replace(/\s\s+/g, ' ').split(' ');
    if(args.length < 2) return message.reply(`You need to specify which song you want to search for!`);
    let query = args.join().replace(',', '+');
    message.react("✅");
    fetch('https://www.google.com/search?q=lyrics+'+query).then(res => res.text()).then(body => {
        try {
            let description = "";
            const embed = new RichEmbed()
                .setTitle(`**Lyrics for __${title} by ${artist}__**`)
                .setColor(player.color)
                .setDescription(description);
            message.channel.send(embed);
        }catch(err){
            console.log(err);
        }
    }).catch(err => console.log(err));
}
module.exports.help = {
    name: 'lyrics',
    description: 'Get the lyrics of a song.',
    usage: 'lyrics <title>',
    aliases: []
}

const regexp = /\>[a-zA-Z,.'\s]+\<\/span/g;
const regexp2 = /\>[a-zA-Z\s]\</g;