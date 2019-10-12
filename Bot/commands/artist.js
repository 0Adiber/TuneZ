const artistic = require('../utils/getArtistVideos');
const {RichEmbed} = require('discord.js')

module.exports.run = async(player, message) => {
    let args = message.content.replace(`${player.prefix}artist`, "").trim().replace(/\s\s+/g, ' ').toLowerCase().split(' ');

    args[0] = args.slice(0,args.length-1).join();
    args[1] = args[args.length-1];
    args.splice(2);

    const voiceChannel = message.member.voiceChannel;

    if(!voiceChannel) return message.reply('You need to be in a voice channel to play music!');
    if(player.playing && message.member.voiceChannel.id !== player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if(!permissions.has('CONNECT') || !permissions.has('SPEAK')) return message.reply('I need the permissions to join and speak in your voice channel!');

    if(args.length != 2) return message.reply(`Not enough arguments! The command is: ${player.prefix}artist <artist> [popular/recent]`);
    
    message.react("✅");

    if(args[1] == "popular" || args[1] == "pop") {
        exec(player, message, args[0], 'viewCount')
    } else if(args[1] == "recent" || args[1] == "rec") {
        exec(player, message, args[0], 'date')
    }

}

async function exec(player, message, artist, order) {
    let res = await artistic.getSearch(artist, order).catch(err => console.log(err));
    if(res.status === "success" && res.songs.length > 0) {

        player.queue = [...res.songs];

        let description = ``;
        for(let i = 0; i<res.songs.length; i++) {
            description = description.concat(`\n\n\`${i+1}.\` [${res.songs[i].title}](${res.songs[i].officialUrl})`);
        }

        description = description.concat(`\n\n**Songs have been added to the queue!👍**`)

        const embed = new RichEmbed()
            .setAuthor(message.member.user.username, message.member.user.avatarURL)
            .setColor(player.color)
            .setDescription(description);
        message.channel.send(embed);

        if(player.playing) return;
            
        message.channel.send("Now Playing 🎵 `" + player.queue[0].title + "`");
        player.voiceChannel = message.member.voiceChannel;
        player.play();
        
        return;
    } else {
        message.channel.send(`There was an error 😢`);
    }
}

module.exports.help = {
    name: 'artist',
    description: 'Play songs of the given artist.',
    usage: 'artist [args]', //args <artist> {popular='viewCount',recent='date',auto=autoplay}
    aliases: []
}