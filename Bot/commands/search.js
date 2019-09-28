const {RichEmbed} = require('discord.js');

module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to search a video!');
        if(player.playing && message.member.voiceChannel.id !== player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');

        const args = message.content.trim().split(' ');
        if(player.searchWaiting) {
            if(args.length < 2) return message.reply(`You need to make a choice, or cancel the current search!`);
            if(args[1].toLowerCase() === "cancel") {
                message.react("✅");
                player.searchWaiting = false;
                message.channel.send(`Canceled the search process.👌`);
                return;
            }
            if(isNaN(args[1])) return message.reply(`Please enter a number or cancel 💢`);
            if(player.searchList.length < args[1]) return message.reply(`That number is to high! 💢`);
            message.react("✅");
    
            let val = args[1].trim();
            if(val == 0) val = 1;
            val--;

            player.queue.push(player.searchList[val]);
            message.channel.send(`Added the song to the queue 👍`);
            
            if(player.playing) return;
            
            message.channel.send("Now Playing 🎵 `" + player.searchList[val].title + "`");
            player.searchWaiting = false;
            player.voiceChannel = message.member.voiceChannel;
            player.play();
            
            return;
        }
        if(args.length < 1) return message.reply(`You need to give me something to search for 🤔`);
        
        message.react("✅");
        message.channel.send(`Searching 🔍 ${args.slice(1).join(' ')}`);

        let res = await video.getSearch(args);
        if(res.status === "success" && res.songs.length > 0) {

            player.searchList = [...res.songs];
            player.searchWaiting = true;

            let description = ``;
            for(let i = 0; i<res.songs.length; i++) {
                description = description.concat(`\n\n\`${i+1}.\` [${res.songs[i].title}](${res.songs[i].officialUrl})`);
            }
    
            description = description.concat(`\n\n**Type '${player.prefix}search <number>' to make a choice, or '${player.prefix}search cancel' to exit**`)
    
            const embed = new RichEmbed()
                .setAuthor(message.member.user.username, message.member.user.avatarURL)
                .setColor(player.color)
                .setDescription(description);
            message.channel.send(embed);

        } else {
            message.channel.send(`There was an error 😢`);
        }
}
module.exports.help = {
    name: 'search',
    description: 'Searches youtube for a query and adds the results to the queue',
    usage: 'search [args]',
    aliases: []
}