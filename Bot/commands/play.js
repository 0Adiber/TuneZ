const video = require('../utils/getVideoUrl');

module.exports.run = async(player, message) => {
    const args = message.content.replace(`${player.prefix}play`, "").trim().replace(/\s\s+/g, ' ').split(' ');
    console.log(args)
    const voiceChannel = message.member.voiceChannel;

    if(!voiceChannel) return message.reply('You need to be in a voice channel to play music!');
    if(player.playing && message.member.voiceChannel.id !== player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if(!permissions.has('CONNECT') || !permissions.has('SPEAK')) return message.reply('I need the permissions to join and speak in your voice channel!');

    if(args[0] == '') {
        if(player.queue.length > 0) {
            player.voiceChannel = voiceChannel;
            let song = player.queue.shift();
            message.channel.send("Now Playing 🎵 `" + song.title + "`");
            player.queue.unshift(song);
            player.play();
            return;
        }
        return message.reply("There is no Song I could play!");
    }

    message.react("✅");
    const songInfo = await video.getUrl(args);

    if(songInfo.songs) {//a list of songs because of playlist
        songInfo.songs.forEach((song) => {
            song.requestedBy = message.member.user.username;
        });
        player.queue = [...player.queue, ...songInfo.songs];
        message.channel.send(`The playlist has been added to the queue!`);

        if(player.playing) return;

        message.channel.send("Now Playing 🎵 `" + songInfo.songs[0].title + "`");
        player.voiceChannel = voiceChannel;
        player.play();
    } else {    //only one song
        const song = {
            title: songInfo.title,
            url: songInfo.url,
            requestedBy: message.member.user.username,
            officialUrl: songInfo.officialUrl
        }

        player.queue.push(song);
        message.channel.send(`${song.title} has been added to the queue!`);
        if(player.playing) return;

        message.channel.send("Now Playing 🎵 `" + song.title + "`");
        player.voiceChannel = voiceChannel;
        player.play();
    }
}

module.exports.help = {
    name: 'play',
    description: 'Searches the song/url and plays it.',
    usage: 'play [args]',
    aliases: ['p']
}