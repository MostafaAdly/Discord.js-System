require("dotenv").config()
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

client.login(process.env.TOKEN)
const ms = require('ms');
const fs = require('fs')
const db = require("quick.db");
const sug = require("./suggestions.json")
const bug = require("./bugs.json");
const { report } = require("process");
const moment = require('moment');

//===========================================

const timer = new Map();
let prefix = '$'
let sug_channel_id = '892317684748935199'
let bug_channel_id = '892324820392484894'
let reportChannelID = '892324805217517598'
let bannedReportID = '892325171749330954' // 887817756651692052



//===========================================

client.on('ready', async ( ) => {
    console.log(`Logged in as: ${client.user.tag}`)
    bgImg = await loadImage('./' + ImageName)
	client.user.setActivity('Play.RqlixMC.com', { type: "PLAYING" }) // WATCHING , STREAMING , LISTENING

});
    //===========================================
    client.on("messageCreate", async msg => {
        if (msg.author.bot) return
        if (msg.content.startsWith(prefix)) {
            let txt = msg.content
            let _args = txt.split(/ +/g)
            let args = _args.slice(1)
            let cmd = _args[0].slice(prefix.length).toLowerCase()
            if (cmd == undefined) return;
            let caseid = msg.id
            if (['sug', 'bug'].includes(cmd)) {
                let reportChat = msg.guild.channels.cache.find(channel => channel.id === (cmd == "sug" ? sug_channel_id : bug_channel_id))
                let report = args.join(' ');
                if (!report) return msg.channel.send({ embeds: [Embed(`Correct Usage: \`${prefix}${cmd} <report>\``)] });
                if (!reportChat) return msg.channel.send({ embeds: [Embed('Sadly, i cannot find the report-chat.')] });
                let reportEmbed = new MessageEmbed()
                    .setAuthor((cmd == "sug" ? "Suggestion" : "Bug") + ' from: ' + msg.author.tag)
                    .addField((cmd == "sug" ? "Suggestion" : "Bug"), `${report}`)
                    .setColor('RANDOM')
                    .setFooter(`ID: ${caseid}`)
                    .setThumbnail(msg.author.avatarURL())
                    .setTimestamp();
                reportChat.send({ content: `<@${msg.author.id}>`, embeds: [reportEmbed] }).then(send => {
                    if (cmd == "sug") {
                        sug[caseid] = {
                            Report: report,
                            Reporter: msg.author.id,
                            Time: msg.createdAt,
                            MessageID: send.id
                        }
                    } else {
                        bug[caseid] = {
                            Report: report,
                            Reporter: msg.author.id,
                            Time: msg.createdAt,
                            MessageID: send.id
                        }
                    }
                    fs.writeFile(`./${(cmd == "sug" ? "suggestions" : "bugs")}.json`, JSON.stringify((cmd == "sug" ? sug : bug), null, 4), err => {
                        if (err)
                            console.log(err);
                    })
                }).catch(error => console.log(error))
                msg.channel.send({ embeds: [Embed('تم أرسال اقتراحك')] })
            }
            if (cmd == "allreports") {
                if (args.length != 1 || (args[0] != "sugs" && args[0] != "bugs")) {
                    return msg.channel.send({ embeds: [Embed(`Correct Usage: \`${cmd} <sugs/bugs>\``)] })
                }
                let data = undefined;
                let type = args[0]
                for (i in (type == "sugs" ? sug : bug)) {
                    if (data === undefined) {
                        data = "";
                    }
                    let data1 = (type == "sugs" ? sug[i].Report : bug[i].Report)
                    let data2 = (type == "sugs" ? sug[i].Reporter : bug[i].Reporter)
                    const stuff = `${data1} By <@${data2}>`;
                    data += (stuff) + "\n\n";
                }
                if (data !== undefined) {
                    const embed = new MessageEmbed();
                    embed.addField("Messages", data)
                    msg.channel.send({ embeds: [embed] })
                } else if (data === undefined) return msg.channel.send({ embeds: [Embed(`All reports of \`${type}\` are empty`)] })
            }
            if (['dbug', 'dsug'].includes(cmd)) {
                let id = args[0]
                if (!id) return msg.channel.send(Embed('Please, refer an id.'))
                if ((cmd == "dsug" ? sug[id] : bug[id]) === undefined) return msg.channel.send({ embeds: [Embed(`Couldn\'t find that ${(cmd == "dsug" ? "suggestion" : "bug")} id!`)] })
                msg.channel.send({ embeds: [Embed((cmd == "dsug" ? "Suggestion" : "Bug") + ' was deleted successfully.')] })
                const asd = await msg.guild.channels.cache.find(ch => ch.id == (cmd == "dsug" ? sug_channel_id : bug_channel_id)).messages.fetch({ limit: 100 });
                asd.forEach(x => {
                    if (x.id == (cmd == "dsug" ? sug[id].MessageID : bug[id].MessageID)) {
                        x.delete();
                    }
                })
                if (cmd == "dsug") delete sug[id];
                else delete bug[id];
                fs.writeFile(`./${(cmd == "dsug" ? "suggestions" : "bugs")}.json`, JSON.stringify((cmd == "dsug" ? sug : bug), null, 4), err => {
                    if (err)
                        console.log(err)
                })
            }
            if (cmd == "vmute") { // $vmute @muhamed 10s
                if (!msg.member.permissions.has(Permissions.FLAGS.MUTE_MEMBERS)) return; // ROLE , role 
                if (args.length != 2)
                    return msg.reply({ embeds: [Embed(`Correct Usage: \`${prefix}${cmd.toLowerCase()} @<member> <time>\``)] })
                let time = msg.content.split(" ").slice(2).join(" ")
                let mention = msg.mentions.members.first();
                if (!mention) return msg.channel.send({ embeds: [Embed('Please, specify a member.')] });
                if (!mention.voice.channel) return msg.channel.send({ embeds: [Embed(`this user has not in voice channel`)] })
                if (!time || !ms(time)) return msg.channel.send({ embeds: [Embed(`Please Type time`)] })
                await mention.voice.setMute(true)
                msg.channel.send({ embeds: [Embed(`You have \`muted\` ${mention} for \`${time}\``)] })
                setTimeout(() => {
                    mention.voice.setMute(false)
                }, ms(time))
            }
            if (cmd == "role") { // $role @diamond @muhamed 10s
                if (!msg.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) return msg.channel.send({ content: "You don't have permissions" })
                if (args.length != 3)
                    return msg.reply({ embeds: [Embed(`Correct Usage: \`${prefix}${cmd.toLowerCase()} @<role> @<member> <time>\``)] })
                let member = msg.mentions.members.first();
                let time = args[2]
                let role = msg.mentions.roles.first();
                if (!role) return msg.channel.send({ embeds: [Embed('Coudn\'t find this specific role.')] })
                if (!member) return msg.channel.send({ embeds: [Embed('Please, mention someone')] })
                if (!time || !ms(time)) return msg.channel.send({ embeds: [Embed('Please, specify an invalid time.')] })
                timer.set(msg.author.id, {
                    author: {
                        tag: msg.author.tag,
                    },
                    time: ms(time),
                });
                await member.roles.add(role)
                msg.react(`✅`)
                setTimeout(async () => {
                    timer.delete(msg.author.id);
                    if (!member.roles.cache.has(role.id)) return;
                    await member.roles.remove(role)
                }, ms(time))
            }
            if (cmd == "report") {
                Report(msg, args);
            }
        }
    });
    async function sendThenDelete(msg, content, time, embed = null) {
        let m = await msg.channel.send({ content: content, embeds: [embed] })
        setTimeout(() => {
            m.delete().catch(er => { });
        }, time * 1000);
    }
    function Embed(desc) {
        return new MessageEmbed().setDescription(desc).setColor('BLACK');
    }
    function Report(msg, args) {
        console.log(msg.member.roles)
        console.log(msg.member.roles.cache.has(bannedReportID))
        if (msg.member.roles.cache.has(bannedReportID))
            return sendThenDelete(msg, null, 3, Embed('You are banned from our report system.'));
        let reportss_channel = msg.guild.channels.cache.find(m => m.id == reportChannelID) // اسم الروم الي تجيه الريبورتات
        if (!reportss_channel) return
        var mention = msg.mentions.users.first();
        if (!mention) return sendThenDelete(msg, null, 5, Embed('Please, mention a member.'));
        if (mention.id == msg.author.id) return sendThenDelete(msg, null, 3, Embed('You cant report yourself'));
        if (msg.mentions.members.first().permissions.has(Permissions.FLAGS.ADMINISTRATOR)) sendThenDelete(msg, null, 5, Embed('You cant report this user.'))
        if (mention.id == msg.guild.ownerId) return sendThenDelete(msg, null, 3, Embed('You cant report the owner.'))
        var reason = args.slice(1).join(' ');
        if (!reason) return sendThenDelete(msg, null, 3, Embed('Please, specify a reason.'));
        var embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`NEW REPORT`)
            .setThumbnail(msg.author.avatarURL)
            .addField('Reporter Name: ', `<@${msg.author.id}> ID [ ${msg.author.id} ]`, true)
            .addField('ReportedUser Name: ', `${mention} ID [ ${mention.id} ]`, true)
            .addField('Time ', `[ ${moment(msg.createdAt).format('D/MM/YYYY h:mm a')} ]`, true)
            .addField('reason: ', `[ ${reason} ]`, true)
            .addField('Channel: ', `${msg.channel}`, true)
        reportss_channel.send({ embeds: [embed] })
        msg.channel.send({ embeds: [Embed(`You have reported ${mention} for \`${reason}\`.`)] })
    }
client.on("guildMemberAdd", async member => {
    console.log(member.user.username + " joined " + member.guild.name)
    let role_id = await db.get(`auto-role`)
    if (role_id) {
        let role = member.guild.roles.cache.get(role_id)
        if (role) {
            member.roles.add(role)
        }
    }
    if (member.user.bot) return
    sendWelcome(member).then(r => { }).catch(er => { })
})


// welcome 



const { Canvas } = require("canvas-constructor/cairo")
const { createCanvas, loadImage } = require('canvas')

//===========================================
let WlcMessages = [' {name} We hope you brought pizza \nPlease read the server rules to avoid punishment {rules}',
    ' {name} We are delighted to have you among us. On behalf of all the members and the management, we would like to extend our warmest welcome and good wishes! \nPlease read the server rules to avoid punishment {rules}',
    ' {name} A very warm welcome to you! It is lovely to have you among us! \nPlease read the server rules to avoid punishment {rules}',
    ' {name} You are a wonderful person with a wonderful view of life. Your companionship is always an opportunity to learn. A warm welcome to you to join us! \nPlease read the server rules to avoid punishment {rules}',
    ]
let RulesChannel = '892297494258659399'
let bgImg
let WlcChannel = '892297498201313281'
let ImageName = 'bg.jpg'
let ImageExtention = 'jpg'
let role_id = '892301566160306226'
//===========================================

async function sendWelcome(member) {
    let c = member.guild.channels.cache.get(WlcChannel)
    if (!c) return;
    const userAvatar = await loadImage(member.user.displayAvatarURL({ format: ImageExtention }))
    let username = member.user.username.length > 10 ? member.user.username.substr(0, 9) + ".." : member.user.username
    let buffer = await new Canvas(1920, 1080)
        .printImage(bgImg, 0, 0, 1920, 1080)
        .printCircularImage(userAvatar, 1920 / 2, ((1080 / 2) - (58 * 4)), 58 * 4)
        .setColor('#FFFFFF')
        .setTextFont('160px Impact')
        .setTextAlign('center')
        .printText(username, 1920 / 2, ((1080 / 2) + (245)))
        .toBuffer();
    let rand = Math.floor(Math.random() * (WlcMessages.length))
    let msg = WlcMessages[rand]
    c.send({
        files: [new MessageAttachment(buffer, ImageName)], content: msg.replace("{name}", `<@${member.user.id}>`)
        .replace('{rules}', `<#${RulesChannel}>`)
    })
}



// rank 

//===============================================

const canvacord = require('canvacord');

let XpFileName = 'XPJSON.json'
let AdminRoleID = ''
let MemberRoleID = '885350334334124063'
let iconURL = 'https://cdn.discordapp.com/attachments/887406598941712384/887498822719275018/768x768_yellow.png'

//===============================================

client.on('ready', () => {
  console.log('Ready!')
})

let xp = JSON.parse(fs.readFileSync(XpFileName, 'utf8'));
client.on('messageCreate', async message => {
  if (!message.channel.guild) return;
  if (message.author.bot) return;
  if (xp[message.author.id] == undefined || !xp[message.author.id]) {
    xp[message.author.id] = {
      userXP: 0,
      userTOTAL: 0,
      reqXP: 200,
      userLVL: 0,
    }
    fs.writeFile(XpFileName, JSON.stringify(xp, null, 5), err => {
      console.log(err)
    })
  }

  let asd = Math.floor(Math.random() * 2);
  xp[message.author.id].userXP += asd;
  xp[message.author.id].userTOTAL += asd;

  if (xp[message.author.id].userXP > xp
  [message.author.id].reqXP) {
    xp[message.author.id].userXP -= xp
    [message.author.id].reqXP;
    xp[message.author.id].reqXP += 200; // العدد المطلوب لكل لفل يزيد 200 مثلا لفل 1 مطلوب 250 لفل 2 بكون مطلوب 450 زاد 200
    xp[message.author.id].userLVL += 1;

    let newlvl = xp[message.author.id].userLVL;

    message.reply({ content: `Congratulations You leveled up to **${newlvl}**! 🎉`})// رسالة التقدم بالفل

    fs.writeFile(XpFileName, JSON.stringify(xp, null, 5), err => {
      console.log(err)
    })
  }

})


client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + 'rank')) {
    if (!message.channel.guild) return;
    let member = message.mentions.users.first() || message.author;
    if (!xp[member.id]) {
      xp[member.id] = {
        userXP: 0,
        userTOTAL: 0,
        reqXP: 200,
        userLVL: 0,
      }
      fs.writeFile(XpFileName, JSON.stringify(xp, null, 5), err => {
        console.log(err)
      })
    }
    const card = new canvacord.Rank()
      .setUsername(member.username)
      .setDiscriminator(member.discriminator)
      .setRank(xp[member.id].userLVL)
      .setLevel(xp[member.id].userLVL)
      .setCurrentXP(xp[member.id].userXP)
      .setRequiredXP(xp[member.id].reqXP)
      .setAvatar(member.displayAvatarURL({ format: "png", size: 1024 }));
    const img = await card.build();
    return message.channel.send({ files: [new MessageAttachment(img, "rank.png")], content: `**${member.username}'s Rank:**` });
  }
})