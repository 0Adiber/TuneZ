module.exports.run = async(player, message) => {
    if(!message.member.hasPermission('ADMINISTRATOR')) message.reply('You have to be an Administrator to change the permissions');

    
}
module.exports.help = {
    name: 'book',
    description: 'Play audio book.',
    usage: 'book [arg]',
    aliases: []
}