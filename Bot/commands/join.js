module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel!');
    if(player.voiceChannel && player.voiceChannel.members.size > 1) return message.reply('Sorry, I am already being used.');
    message.react("✅");
    message.member.voiceChannel.join();
    message.channel.send(`Joined \`${message.member.voiceChannel.name}\` 🏃`);
}
module.exports.help = {
    name: 'join',
    description: 'Summon the bot to your channel',
    usage: 'join',
    aliases: []
}