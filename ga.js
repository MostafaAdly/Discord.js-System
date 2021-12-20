"use strict";
require('dotenv').config();
const { Client, Intents, MessageEmbed, MessageButton, MessageActionRow, Permissions , MessageAttachment} = require("discord.js")
const client = new Client({
    intents: [Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION',],
    ws: ["GUILDS", "GUILD_MEMBERS"]
})
const zf = require('zero-fill')
client.on('ready', () => {
    console.log(`Giveaway is ready. [ ${client.user.tag} ]`)
})

//===========================================================

let emj = '883400106525741096'
let GiveAwayRole = '892358167172898837'
let prefix = '$'
let gas = {}
let act = {}
let stopped = {}
let loop = 5
let deleteAfter = '1h'

//===========================================================
function winEmbed2(winner, x, arr) {
    let noti = new MessageEmbed()
        .setTitle(client.user.username)
    if (arr.length != 0) {
        noti.setDescription(`Congratulations, <@${winner}> has won \`${x["prize"] == undefined ? x : x["prize"]}\` 🍁`)
            .setColor('GREEN')
    } else {
        noti.setDescription(`Unfortunately, no one has won the giveaway.`)
            .setColor('RED')
    }
    return noti
}

async function forceReroll(message, msgId, prize) {
    let m = message.guild.emojis.cache.get(emj)
    const fetchMsg = await message.channel.messages.fetch(msgId);
    fetchMsg.reactions.cache.map(async (reaction) => {
        let usersThatReacted = [];
        if (reaction.emoji == m) {
            let reactedUsers = await reaction.users.fetch();
            reactedUsers.map((user) => {
                usersThatReacted.push(user.id);
            });
            let users = usersThatReacted.join('-').trim();
            let winner = usersThatReacted[Math.floor(Math.random() * usersThatReacted.length)];
            if (users.length == 0) return;
            if (winner == client.user.id) return forceReroll(message, msgId, prize)
            message.channel.send({ embeds: [winEmbed2(winner, prize, users)], content:`<@${message.author.id}>`})
        }
    });
}

client.on('messageCreate', async msg => {
    if (msg.author.bot || !msg.guild) return
    if (!msg.content.startsWith(prefix)) return
    let txt = msg.content
    let _args = txt.split(/ +/g)
    let args = _args.slice(1)
    let cmd = _args[0].slice(prefix.length)
    if (!msg.member.roles.cache.get(GiveAwayRole)) return
    if (["freroll"].includes(cmd)) {
        if (args.length != 2) {
            sendHelp(msg, cmd);
            return;
        }
        let id = args[0]
        forceReroll(msg, id, args[1])
    }
    if (["gareroll"].includes(cmd)) {
        if (args.length == 0) {
            sendHelp(msg, cmd);
            return;
        }
        let id = args[0]
        if (gas[msg.guild.id] == undefined) gas[msg.guild.id] = {}
        if (gas[msg.guild.id][id] == undefined) {
            msg.reply({ content: `This giveaway does not exist!`})
            return;
        }
        if (gas[msg.guild.id][id]["stop"] != true) {
            msg.reply({ content: `This giveaway hasn't stopped yet!`})
            return;
        }
        let arr = gas[msg.guild.id][id]["list"]
        let a = Math.floor(Math.random() * (arr.length))
        gas[msg.guild.id][id]["winner"] = arr[a]
        msg.channel.send({
            content: `<@${gas[msg.guild.id][id]["host"]}>` + (gas[msg.guild.id][id]["host"] == msg.author.id ? '' : `<@${msg.author.id}>`),
            embeds: [winEmbed2(arr[a], gas[msg.guild.id][id], arr)]
        })
    }
    if (["ga"].includes(cmd)) {
        if (args.length == 0) {
            sendHelp(msg, cmd);
            return
        }
        if (args[0] == "start") {
            let x = parseInt(getMulti(args[1]))
            if (args.length < 4 || x == 0) {
                msg.reply({ content: `${prefix}${cmd} <time> <amount_of_winners> <prize>`})
                return
            }
            let t = parseInt(new Date().getTime() + x)
            if (gas[msg.guild.id] == undefined) gas[msg.guild.id] = {}
            gas[msg.guild.id][msg.id] = {
                "time": t,
                "wins": args[2],
                "prize": getMsg(args, 3),
                "msg": null,
                "winners": null,
                "list": [],
                "stop": false,
                "host": msg.author.id
            }
            newGiveaway(msg)
        }
    }
})
function getMsg(args, a) {
    let msg = ''
    for (let i = a; i < args.length; i++) {
        if (i != args.length - 1) {
            msg += args[i] + ' '
        } else {
            msg += args[i]
        }
    }
    return msg
}
function getMulti(t) {
    if (t.includes('y')) {
        t.replace('y', '')
        return parseInt(t) * 1000 * 60 * 60 * 24 * 365.25
    }
    if (t.includes('mo')) {
        t.replace('mo', '')
        return parseInt(t) * 1000 * 60 * 60 * 24 * 30
    }
    if (t.includes('w')) {
        t.replace('w', '')
        return parseInt(t) * 1000 * 60 * 60 * 24 * 7
    }
    if (t.includes('d')) {
        t.replace('d', '')
        return parseInt(t) * 1000 * 60 * 60 * 24
    }
    if (t.includes('h')) {
        t.replace('h', '')
        return parseInt(t) * 1000 * 60 * 60
    }
    if (t.includes('m')) {
        t.replace('m', '')
        return parseInt(t) * 1000 * 60
    }
    if (t.includes('s')) {
        t.replace('s', '')
        return parseInt(t) * 1000
    }
    return 0
}

client.on('messageReactionAdd', async (reaction, user) => {
    if (!reaction.message.guild) return;
    if (act[reaction.message.guild.id] == undefined) act[reaction.message.guild.id] = {}
    if (act[reaction.message.guild.id][reaction.message.id] == undefined) return;
    if (user == client.user) return;
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error(error)
            return;
        }
    }
    if (gas[reaction.message.guild.id][act[reaction?.message?.guild?.id][reaction.message.id]?.id]["list"].includes(user.id)) return;
    gas[reaction.message.guild.id][act[reaction.message.guild.id][reaction.message.id].id]["list"].push(user.id)
});

async function newGiveaway(msg, h) {
    let x = gas[msg.guild.id][msg.id]
    let g = msg.guild
    let m = g.emojis.cache.get(emj)
    var d = new Date(x["time"]);
    let zxc = countTime((x["time"] - new Date().getTime()) / 1000)
    let asd = d.toUTCString().replace(`${d.getUTCHours()}:${d.getMinutes()}`, `${new Date().getHours()}:${d.getMinutes()}`)
    let em = new MessageEmbed()
        .setTitle(x["prize"])
        .setColor('GREEN')
        .setDescription(`Click on ${m} to enter the giveaway!`)
        .addField(`Ends in:`, `\`${zxc}\` � \`${asd}\``) // Sunday, December 30, 2018 12:00:00 AM
        .addField(`Giveaway by:`, '<@' + msg.author.id + '>')
        .setTimestamp()
        .setFooter(msg.guild.name, msg.guild.iconURL());
    if (h == 1 && gas[msg.guild.id][msg.id]["msg"] != undefined) {
        gas[msg.guild.id][msg.id]["msg"].edit(`**${m} Rqlix Giveaway ${m}**`, em)
        if (((x["time"] - new Date().getTime()) / 1000) <= 0) {
            gas[msg.guild.id][msg.id]["stop"] = true
            gas[msg.guild.id][msg.id]["msg"].edit(`**${m} Rqlix Giveaway ENDED ${m}**`, win(msg))
        }
        return
    }
    let ms = await msg.channel.send({ content: `**${m} Rqlix Giveaway ${m}**`, embeds: [em]});
    ; (await ms).react(m)
    gas[msg.guild.id][msg.id]["msg"] = ms
    if (act[msg.guild.id] == undefined) act[msg.guild.id] = {}
    act[msg.guild.id][ms.id] = msg
    let inte = setInterval(checkorupdate, loop * 1000)
    function checkorupdate() {
        if (stopped[msg.guild.id] != undefined) {
            if (stopped[msg.guild.id].includes(msg.id)) {
                stopped[msg.guild.id] = stopped[msg.guild.id].filter(function (item) {
                    return item !== msg.id
                })
                clearInterval(inte)
                return;
            }
        }
        newGiveaway(msg, 1)
    }
}
function countTime(t) { // 6:25 .... 15:46
    let min = 0
    let hr = 0
    let day = 0
    while (t > 60) {
        t -= 60
        min++
    }
    while (min > 60) {
        min -= 60
        hr++
    }
    while (hr > 24) {
        hr -= 24
        day++
    }
    let a = day >= 1 ? day : hr >= 1 ? hr : min >= 1 ? min : t
    let x = (day >= 1 ? 'days' : hr >= 1 ? 'hours' : min >= 1 ? 'minutes' : 'seconds')
    return `${a | 0} ${x}`
}

function win(msg) {
    let id = msg.author.id
    let arr = gas[msg.guild.id][msg.id]["list"]
    console.log(arr)
    let a = Math.floor(Math.random() * (arr.length))
    let winner = arr[a]
    gas[msg.guild.id][msg.id]["winner"] = winner
    let x = gas[msg.guild.id][msg.id]
    let em = new MessageEmbed()
        .setTitle(x["prize"]);
    if (arr.length != 0) {
        em.addField(`Winner:`, '<@' + x["winner"] + '>')
            .setColor('AQUA')
    } else {
        em.addField(`Winner:`, 'No one has won the giveaway')
            .setColor('RED')
    }
    em.addField(`Hosted by:`, '<@' + id + '>')
        .setTimestamp()
        .setFooter(msg.guild.name, msg.guild.iconURL());
    if (stopped[msg.guild.id] == undefined) stopped[msg.guild.id] = []
    stopped[msg.guild.id].push(msg.id)
    if (act[msg.guild.id][gas[msg.guild.id][msg.id]["msg"].id])
        delete act[msg.guild.id][gas[msg.guild.id][msg.id]["msg"].id]
    setTimeout(() => {
        delete gas[msg.guild.id][msg.id]
    }, getMulti(deleteAfter));
    msg.channel.send({ embeds: [winEmbed2(winner, x, arr)], content: `<@${id}>`})
    return em
}

function sendHelp(msg) {
    msg.reply({ content: 'soon!'})
}

client.login(process.env.TOKEN)