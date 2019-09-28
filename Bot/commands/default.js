const fs = require('fs');

module.exports.run = async(player, message) => {
    message.react("✅");
        const args = message.content.split(' ');
        if(!fs.existsSync(`./Bot/userdata/${message.channel.guild.id}`)) fs.mkdirSync(`./Bot/userdata/${message.channel.guild.id}`, { recursive: true });

        fs.closeSync(fs.openSync(`./Bot/userdata/${message.channel.guild.id}/${message.member.user.id}.json`, 'a'));

        let content = JSON.parse(fs.readFileSync(`./Bot/userdata/${message.channel.guild.id}/${message.member.user.id}.json`, {encoding:'utf8'})||"{}");

        if(args[1] === 'add') {
            if(Object.keys(content).length >= 25) return message.channel.send("You already have 25 songs in your default playlist!");
            video.getUrl(args.slice(2)).then(song => {
                if(song.songs) {
                    song.songs.forEach((s) => {
                        if(Object.keys(content).length >= 25) return;
                        content[s.vid] = {
                            title: s.title,
                            url: s.url,
                            officialUrl: s.officialUrl
                        }
                    });
                    message.channel.send(`Added the playlist to your default playlist.`)
                } else {
                    content[song.vid] = {
                        title: song.title,
                        url: song.url,
                        officialUrl: song.officialUrl
                    };
                    message.channel.send(`Added \`${song.title}\` to your default playlist.`)
                }
                fs.writeFileSync(`./Bot/userdata/${message.channel.guild.id}/${message.member.user.id}.json`, JSON.stringify(content));
                
            }).catch(err => console.log(err));
        } else if(args[1] === 'remove') {
            video.getUrl(args.slice(2)).then(song => {
                if(song.songs) {
                    song.songs.forEach((s) => {
                        delete content[s.vid];
                    });
                } else {
                    delete content[song.vid];
                }
                fs.writeFileSync(`./Bot/userdata/${message.channel.guild.id}/${message.member.user.id}.json`, JSON.stringify(content));
                message.channel.send(`Removed 🗑️ \`${song.title}\` from your default playlist.`)
            }).catch(err=>console.log(err));
        } else if(args[1] === 'clear') {
            fs.writeFileSync(`./Bot/userdata/${message.channel.guild.id}/${message.member.user.id}.json`, JSON.stringify({}));
            message.channel.send(`Cleared 🆑 your default playlist`);
        } else if(args[1] === 'list') {
            if(Object.keys(content).length === 0) return message.channel.send('Your default playlist is empty!');
            let description = "";
            let i = 0;
            Object.values(content).forEach(song => {
                description = description.concat(`\n\`${++i}.\` [${song.title}](${song.officialUrl})`);
            });
            const embed = new RichEmbed()
            .setTitle(`${message.member.user.username} default playlist`)
            .setColor(player.color)
            .setDescription(description);
            message.channel.send(embed);
        } else if(!args[1]) {
            if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to play your default!');
            if(player.playing) {
                if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
            }

            if(Object.keys(content).length === 0) return message.channel.send('You don\'t have any songs in your default playlist yet.');

            Object.values(content).forEach(song => {
                player.queue.push({
                    title: song.title,
                    url: song.url,
                    officialUrl: song.officialUrl,
                    requestedBy: message.member.user.username
                });
            });
            
            message.channel.send(`Your default playlist has been added to the queue!`);

            if(!player.playing){
                player.voiceChannel = message.member.voiceChannel;
                player.play();
                message.channel.send(`Now Playing 🎵 \`${player.queue[0].title}\``);
            }
        } else {
            message.channel.send('The command is \'default [add/remove/clear <query/link>]\'');
        }
}
module.exports.help = {
    name: 'default',
    description: 'Plays/Adds/Removes/Clears a song from the users default playlist',
    usage: 'default [add/remove/clear]',
    aliases: ['d']
}