const {RichEmbed} = require('discord.js');
const fs = require('fs');

module.exports.run = async(player, message) => {
    if(!message.member.hasPermission('ADMINISTRATOR')) return message.reply('You have to be an Administrator to change the permissions');

    let args = message.content.trim().replace(/\s\s+/g, ' ').replace(/,\s+/g,',').split(' '); //command + args
    if(args.length > 3) return message.channel.send(`The command is ${player.prefix}settings <option> [args]`);

    args = args.slice(1);

    if(args.length == 0) {
        let description = `Use \`${player.prefix}settings <option> <value>\` to change an option.`;

        const embed = new RichEmbed()
            .setTitle("TuneZ Settings")
            .setColor(player.color)
            .setDescription(description)
            .addField('❕ Prefix', `Currently: ${player.prefix}\n\`${player.prefix}settings prefix\``, true)
            .addField('🔔 Announce Songs', `Currently: ${player.announcesongs}\n\`${player.prefix}settings announcesongs\``, true)
            .addField('🏳️ Country Code', `Currently: ${player.countryCode}\n\`${player.prefix}settings ccode\``, true)
            .addField('🖊️ Color', `Currently: ${player.color}\n\`${player.prefix}settings color\``, false);
        message.channel.send(embed);
    } else {
        let content = JSON.parse(fs.readFileSync(`./Bot/serverdata/${message.channel.guild.id}.json`, {encoding:'utf8'}));

        if(args.length == 2 && args[0].toLowerCase() === 'prefix') {
            player.prefix = args[1];
            content.prefix = args[1];
            message.channel.send(`The new prefix is: ${player.prefix}`);
        }else if(args[0].toLowerCase() === 'announcesongs') {
            player.announcesongs = !player.announcesongs;
            content.announce = !player.announcesongs;
            message.channel.send(`Song Announcements is now ${player.announcesongs?'on':'off'}`)
        }else if(args.length == 2 && args[0].toLowerCase() === 'ccode') {
            args[1] = args[1].toUpperCase();
            if(!ccodes.includes(args[1])) return message.reply(`${ccode} is not a valid \`ISO 3166-1 alpha-2\` country code!`);
            player.countryCode = args[1];
            content.ccode = args[1];
            message.channel.send(`Default Country Code changed to \`${args[1]}\``)
        }else if(args.length == 2 && args[0].toLowerCase() === 'color') {
            args[1] = args[1].replace('0x', '#');
            if(colorName.includes(args[1].toUpperCase())) {
                player.color = args[1].toUpperCase();
            } else if(hexRex3.test(args[1])) {
                player.color = args[1];
            } else if(hexRex6.test(args[1])) {
                player.color = args[1];
            } else if(numArrRex.test(args[1])) {
                let temp = args[1].substring(1,args[1].length-1).split(',');
                player.color = [parseInt(temp[0]),parseInt(temp[1]),parseInt(temp[2])];
            } else {
                return message.reply(`Thats not a valid parameter for the color option. Valid parameters are: \`Color Name,Hex,RGB Array\``)
            }
            content.color = player.color;
            return message.channel.send(`Color changed to \`${args[1]}\``)
        } else {
            let description = `Use \`${player.prefix}settings <option> <value>\` to change an option.`;

            const embed = new RichEmbed()
                .setTitle("TuneZ Settings")
                .setColor(player.color)
                .setDescription(description)
                .addField('❕ Prefix', `Currently: ${player.prefix}\n\`${player.prefix}settings prefix\``, false)
                .addField('🛎️ Announce Songs', `Currently: ${player.announcesongs}\n\`${player.prefix}settings announcesongs\``, true)
                .addField('🏳️ Country Code', `Currently: ${player.countryCode}\n\`${player.prefix}settings ccode\``, true)
                .addField('🖊️ Color', `Currently: ${player.color}\n\`${player.prefix}settings color\``, true);
            message.channel.send(embed);
        }

        fs.writeFileSync(`./Bot/serverdata/${message.channel.guild.id}.json`, JSON.stringify(content));

    }

}
module.exports.help = {
    name: 'settings',
    description: 'Change settings of the Bot.',
    usage: 'settings [args]',
    aliases: ['se']
}

const ccodes = [
    "AD",
    "AE",
    "AF",
    "AG",
    "AI",
    "AL",
    "AM",
    "AO",
    "AQ",
    "AR",
    "AS",
    "AT",
    "AU",
    "AW",
    "AX",
    "AZ",
    "BA",
    "BB",
    "BD",
    "BE",
    "BF",
    "BG",
    "BH",
    "BI",
    "BJ",
    "BL",
    "BM",
    "BN",
    "BO",
    "BQ",
    "BR",
    "BS",
    "BT",
    "BV",
    "BW",
    "BY",
    "BZ",
    "CA",
    "CC",
    "CD",
    "CF",
    "CG",
    "CH",
    "CI",
    "CK",
    "CL",
    "CM",
    "CN",
    "CO",
    "CR",
    "CU",
    "CV",
    "CW",
    "CX",
    "CY",
    "CZ",
    "DE",
    "DJ",
    "DK",
    "DM",
    "DO",
    "DZ",
    "EC",
    "EE",
    "EG",
    "EH",
    "ER",
    "ES",
    "ET",
    "FI",
    "FJ",
    "FK",
    "FM",
    "FO",
    "FR",
    "GA",
    "GB",
    "GD",
    "GE",
    "GF",
    "GG",
    "GH",
    "GI",
    "GL",
    "GM",
    "GN",
    "GP",
    "GQ",
    "GR",
    "GS",
    "GT",
    "GU",
    "GW",
    "GY",
    "HK",
    "HM",
    "HN",
    "HR",
    "HT",
    "HU",
    "ID",
    "IE",
    "IL",
    "IM",
    "IN",
    "IO",
    "IQ",
    "IR",
    "IS",
    "IT",
    "JE",
    "JM",
    "JO",
    "JP",
    "KE",
    "KG",
    "KH",
    "KI",
    "KM",
    "KN",
    "KP",
    "KR",
    "KW",
    "KY",
    "KZ",
    "LA",
    "LB",
    "LC",
    "LI",
    "LK",
    "LR",
    "LS",
    "LT",
    "LU",
    "LV",
    "LY",
    "MA",
    "MC",
    "MD",
    "ME",
    "MF",
    "MG",
    "MH",
    "MK",
    "ML",
    "MM",
    "MN",
    "MO",
    "MP",
    "MQ",
    "MR",
    "MS",
    "MT",
    "MU",
    "MV",
    "MW",
    "MX",
    "MY",
    "MZ",
    "NA",
    "NC",
    "NE",
    "NF",
    "NG",
    "NI",
    "NL",
    "NO",
    "NP",
    "NR",
    "NU",
    "NZ",
    "OM",
    "PA",
    "PE",
    "PF",
    "PG",
    "PH",
    "PK",
    "PL",
    "PM",
    "PN",
    "PR",
    "PS",
    "PT",
    "PW",
    "PY",
    "QA",
    "RE",
    "RO",
    "RS",
    "RU",
    "RW",
    "SA",
    "SB",
    "SC",
    "SD",
    "SE",
    "SG",
    "SH",
    "SI",
    "SJ",
    "SK",
    "SL",
    "SM",
    "SN",
    "SO",
    "SR",
    "SS",
    "ST",
    "SV",
    "SX",
    "SY",
    "SZ",
    "TC",
    "TD",
    "TF",
    "TG",
    "TH",
    "TJ",
    "TK",
    "TL",
    "TM",
    "TN",
    "TO",
    "TR",
    "TT",
    "TV",
    "TW",
    "TZ",
    "UA",
    "UG",
    "UM",
    "US",
    "UY",
    "UZ",
    "VA",
    "VC",
    "VE",
    "VG",
    "VI",
    "VN",
    "VU",
    "WF",
    "WS",
    "YE",
    "YT",
    "ZA",
    "ZM",
    "ZW"
  ];

const colorName = [
    'DEFAULT',
    'WHITE',
    'AQUA',
    'GREEN',
    'BLUE',
    'PURPLE',
    'LUMINOUS_VIVID_PINK',
    'GOLD',
    'ORANGE',
    'RED',
    'GREY',
    'DARKER_GREY',
    'NAVY',
    'DARK_AQUA',
    'DARK_GREEN',
    'DARK_BLUE',
    'DARK_PURPLE',
    'DARK_VIVID_PINK',
    'DARK_GOLD',
    'DARK_ORANGE',
    'DARK_RED',
    'DARK_GREY',
    'LIGHT_GREY',
    'DARK_NAVY',
    'RANDOM',
  ];

const hexRex3 = /#[0-9A-Fa-f]{3}/g;
const hexRex6 = /#[0-9A-Fa-f]{6}/g;

const numArrRex = /\[(( *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *),){2}( *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *)\]/g;