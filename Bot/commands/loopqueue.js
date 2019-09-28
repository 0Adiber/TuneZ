module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to loop the queue!');
    if(!player.playing || !player.currentSong) return message.reply("There is currently no song playing!");
    if(player.queue.length == 0) return message.reply("There is not a single song in the queue!");
    if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
    message.react("✅");
    if(player.loopQueue) {
        player.loopQueue = false;
        return message.channel.send(`Queue Loop stopped ❌`);
    }
    if(player.loop) {
        player.queue.push(player.queue.shift());
        player.loop = false;
        player.loopQueue = true;
        message.channel.send(`Loop stopped ❌, Queue Loop started 🔁`);
    } else {
        //player.queue.push(player.queue.shift());
        player.loopQueue = true;
        message.channel.send(`Queue Loop started 🔁`);
    }
}
module.exports.help = {
    name: 'loopqueue',
    description: 'Loops the whole queue.',
    usage: 'loopqueue',
    aliases: []
}