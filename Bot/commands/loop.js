module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop a song!');
        if(!player.playing || !player.currentSong) return message.reply("There is currently no song playing!");
        if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
        message.react("✅");
        if(!player.loop) {
            //player.queue.unshift(player.currentSong);
            player.loop = true;
            message.channel.send(`Looping🔂 \`${player.currentSong.title}\``);
        } else {
            //player.queue.shift();
            player.loop = false;
            message.channel.send(`Loop stopped ❌`);
        }
}
module.exports.help = {
    name: 'loop',
    description: 'Loops the currently playing song.',
    usage: 'loop',
    aliases: []
}