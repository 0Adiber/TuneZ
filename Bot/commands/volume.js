module.exports.run = async(player, message) => {
    if(!message.member.voiceChannel) return message.reply('You have to be in a voice channel to skip songs!');
    if(!player.playing) return message.reply('There is currently no song playing!');
    if(!message.member.voiceChannel.id === player.voiceChannel.id) return message.reply('You need to be in the same voice channel as I am!');
    const args = message.content.split(' ');
    
    if(args.length < 2) return message.reply("The current volume is "+ player.volume*100 + "% 🎚️");

    if(isNaN(args[1].trim())) {
        message.reply("The command is 'volume <num>', where num is the multiplier (0.5 = 50%, 1 = 100%, 2 = 200%, ...)")
        return;
    }

    const vol = Math.abs(args[1].trim());

    let em;
    if(vol>player.volume) em = "🔊";
    else if(vol==0) em = "🔇";
    else if(vol<player.volume) em = "🔉";
    else em = "🔈";

    player.connection.dispatcher.setVolume(vol);
    player.volume = vol
    message.reply(`Volume changed to ${vol*100}% ${em}`)
}
module.exports.help = {
    name: 'volume',
    description: 'Sets the volume to a given value.',
    usage: 'volume [arg]',
    aliases: []
}