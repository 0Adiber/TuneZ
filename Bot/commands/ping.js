module.exports.run = async(player, message) => {
    message.channel.send('Pinging..').then(m => {
        let ping = m.createdTimestamp-message.createdTimestamp;
        m.edit(`Bot Latency: ${ping}ms, API Latency: ${m.client.ping}ms`);
    });
}
module.exports.help = {
    name: 'ping',
    description: 'Checks the Bot\'s Latencies',
    usage: 'ping',
    aliases: []
}