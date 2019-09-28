module.exports.run = async(player, message) => {
    let ms = message.client.uptime;
        const sec = Math.floor((ms/1000)%60).toString();
        const min = Math.floor((ms/(1000*60))%60).toString();
        const hrs = Math.floor((ms/(1000*60*60))%24).toString();
        const days = Math.floor((ms/(1000*60*60*24))).toString();
        const duration = `${days.padStart(1,'0')} days, ${hrs.padStart(2,'0')} hours, ${min.padStart(2,'0')} min, ${sec.padStart(2,'0')} seconds`
        message.channel.send(`I have been online for: ${duration}`);
}
module.exports.help = {
    name: 'uptime',
    description: 'Calculates the Bot\'s uptime',
    usage: 'uptime',
    aliases: []
}