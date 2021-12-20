require("dotenv").config()
const { Discord, Client, Intents, MessageEmbed, MessageButton, MessageActionRow, Permissions } = require("discord.js")
const client = new Client({
    intents: [Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_INTEGRATIONS],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    ws: ["GUILDS", "GUILD_MEMBERS"]
})
//=========================================
let prefix = '$'
let guild
let InvestigationsChannel
let Log_Msg
let Log_Channel
let Log_BannedKick
let Log_Voice
let Log_JoinLeave
let Log_Roles
let Log_Global
let ClearRole
let BadWords = ['https://', 'www.', '.com', '.net'];
client.on('ready', () => {
    console.log(client.guilds.cache.size)
    console.log(`Logged in as: ${client.user.tag}`)
    guild = client.guilds.cache.get('541340723421773835')//541340723421773835
    InvestigationsChannel = guild?.channels.cache.get('892297517973254195')
    Log_Msg = guild?.channels.cache.get('892315110914261032')
    Log_Channel = guild?.channels.cache.get('892297533030797312')
    Log_BannedKick = guild?.channels.cache.get('890792881802055680')
    Log_Voice = guild?.channels.cache.get('892297533337002017')
    Log_JoinLeave = guild?.channels.cache.get('892297530631663618')
    Log_Roles = guild?.channels.cache.get('892297531411816468')
    Log_Global = guild?.channels.cache.get('890792656765075487')
    ClearRole = '892323611178860575'
});
//==========================================//
client.login(process.env.TOKEN);
function SyncEventJoinLeave(ev, type) {
    client.on(ev, async (member) => {
        if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.EMBED_LINKS)) return;
        if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return;
        console.log(member)
        let em = new MessageEmbed()
            .setTitle('**[MEMBER ' + type + ']**')
            .setColor(type == "JOIN" ? 'GREEN' : 'RED')
            .setThumbnail(member.user.avatarURL)
            .setDescription(`**Name:** <@${member.user.id}> (ID: ${member.user.id})\n**${type == "JOIN" ? 'Joined' : 'Left'} At:** ${new Date().toUTCString()}`)
            .setTimestamp()
            .setFooter(member.guild.name, member.guild.iconURL());
        Log_JoinLeave.send({ embeds: [em] }).catch(er => { })
    });
}
SyncEventJoinLeave('guildMemberAdd', 'JOIN')
SyncEventJoinLeave('guildMemberRemove', 'LEAVE')
client.on('messageDelete', message => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.EMBED_LINKS)) return;
    if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return;
    let messageDelete = new MessageEmbed()
        .setTitle('**[MESSAGE DELETE]**')
        .setColor('RED')
        .setThumbnail(message.author.avatarURL)
        .setDescription(`**\n**:wastebasket:  ** Deleted Message ** In ${message.channel}\n\n**Channel:** ${message.channel} (ID: ${message.channel.id})\n**Message ID:** ${message.id}\n**Sent By:** <@${message.author.id}> (ID: ${message.author.id})\n**Message:**\n\`\`\`${message}\`\`\``)
        .setTimestamp()
        .setFooter(message.guild.name, message.guild.iconURL)
    if (!Log_Msg) return;
    Log_Msg.send({ embeds: [messageDelete] }).catch(er => { });
});
client.on('messageUpdate', (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return;
    if (!oldMessage.channel.type === 'dm') return;
    if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.EMBED_LINKS)) return;
    if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return;
    if (oldMessage.content.startsWith('https://')) return;
    let messageUpdate = new MessageEmbed()
        .setTitle('**[MESSAGE EDIT]**')
        .setThumbnail(oldMessage.author.avatarURL)
        .setColor('BLUE')
        .setDescription(`**\n**:wrench: Successfully \`\`EDIT\`\` **MESSAGE** In ${oldMessage.channel}\n\n**Channel:** \`\`${oldMessage.channel.name}\`\` (ID: ${oldMessage.channel.id})\n**Message ID:** ${oldMessage.id}\n**Sent By:** <@${oldMessage.author.id}> (ID: ${oldMessage.author.id})\n\n**Old Message:**\`\`\`${oldMessage}\`\`\`\n**New Message:**\`\`\`${newMessage}\`\`\``)
        .setTimestamp()
        .setFooter(oldMessage.guild.name, oldMessage.guild.iconURL)
    if (!Log_Msg) return;
    Log_Msg.send({ embeds: [messageUpdate] }).catch(er => { });
});

function SyncEventRole(ev, type) {
    client.on(ev, role => {
        if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.EMBED_LINKS)) return;
        if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return;
        role.guild.fetchAuditLogs().then(logs => {
            var userID = logs.entries.first().executor.id;
            var userAvatar = logs.entries.first().executor.avatarURL;
            let roleCreate = new MessageEmbed()
                .setTitle('**[' + type + ' CREATE]**')
                .setThumbnail(userAvatar)
                .setDescription(`**\n**:white_check_mark: Successfully \`\`${type}\`\` Role.\n\n**Role Name:** \`\`${role.name}\`\` (ID: ${role.id})\n**By:** <@${userID}> (ID: ${userID})`)
                .setColor(type == "DELETE" ? "RED" : "GREEN")
                .setTimestamp()
                .setFooter(role.guild.name, role.guild.iconURL)
            if (!Log_Roles) return;
            Log_Roles.send({ embeds: [roleCreate] }).catch(er => { });
        })
    });
}
SyncEventRole('roleCreate', 'CREATE');
SyncEventRole('roleDelete', 'DELETE');
client.on('roleUpdate', (oldRole, newRole) => {
    if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.EMBED_LINKS)) return;
    if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return;
    oldRole.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;

        if (oldRole.name !== newRole.name) {
            let em = new MessageEmbed()
                .setTitle('**[ROLE NAME UPDATE]**')
                .setThumbnail(userAvatar)
                .setColor('BLUE')
                .setDescription(`**\n**:white_check_mark: Successfully \`\`EDITED\`\` Role Name.\n\n**Old Name:** \`\`${oldRole.name}\`\`\n**New Name:** \`\`${newRole.name}\`\`\n**Role ID:** ${oldRole.id}\n**By:** <@${userID}> (ID: ${userID})`)
                .setTimestamp()
                .setFooter(oldRole.guild.name, oldRole.guild.iconURL)

            Log_Roles.send({ embeds: [em] }).catch(er => { });
        }
        if (oldRole.hexColor !== newRole.hexColor) {
            if (oldRole.hexColor === '#000000') {
                var oldColor = '`Default`';
            } else {
                var oldColor = oldRole.hexColor;
            }
            if (newRole.hexColor === '#000000') {
                var newColor = '`Default`';
            } else {
                var newColor = newRole.hexColor;
            }
            let em = new MessageEmbed()
                .setTitle('**[ROLE COLOR UPDATE]**')
                .setThumbnail(userAvatar)
                .setColor('BLUE')
                .setDescription(`**\n**:white_check_mark: Successfully \`\`EDITED\`\` **${oldRole.name}** Role Color.\n\n**Old Color:** ${oldColor}\n**New Color:** ${newColor}\n**Role ID:** ${oldRole.id}\n**By:** <@${userID}> (ID: ${userID})`)
                .setTimestamp()
                .setFooter(oldRole.guild.name, oldRole.guild.iconURL)
            Log_Roles.send({ embeds: [em] }).catch(er => { });
        }
    })
});

function SyncEventChannel(ev, type) {
    client.on(ev, channel => {
        if (!channel.guild) return;
        if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.EMBED_LINKS)) return;
        if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return;
        channel.guild.fetchAuditLogs().then(logs => {
            var userID = logs.entries.first().executor.id;
            var userAvatar = logs.entries.first().executor.avatarURL;

            let em = new MessageEmbed()
                .setTitle('**[CHANNEL ' + type + ']**')
                .setThumbnail(userAvatar)
                .setDescription(`**\n**:white_check_mark: Successfully \`\`${type}\`\` **${channel.type}** channel.\n\n**Channel Name:** \`\`${channel.name}\`\` (ID: ${channel.id})\n**By:** <@${userID}> (ID: ${userID})`)
                .setColor(type == 'CREATED' ? 'GREEN' : 'RED')
                .setTimestamp()
                .setFooter(channel.guild.name, channel.guild.iconURL)
            if (!Log_Channel) return;
            Log_Channel.send({ embeds: [em] }).catch(er => { });
        })
    });
}
SyncEventChannel('channelCreate', 'CREATED');
SyncEventChannel('channelDelete', 'DELETED');
client.on('channelUpdate', (oldChannel, newChannel) => {
    if (!oldChannel.guild) return;
    oldChannel.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;
        function newEm(type) {
            return new MessageEmbed()
                .setTitle('**[CHANNEL EDIT]**')
                .setThumbnail(userAvatar)
                .setColor('BLUE')
                .setDescription(`**\n**:wrench: Successfully Edited **${oldChannel.type}** Channel ${type}\n\n**Old ${type}:**\n\`\`\`${(type == "Name" ? oldChannel.name : oldChannel.topic) || 'NULL'}\`\`\`\n**New ${type}:**\n\`\`\`${(type == "Name" ? newChannel.name : newChannel.topic) || 'NULL'}\`\`\`\n**Channel:** ${oldChannel} (ID: ${oldChannel.id})\n**By:** <@${userID}> (ID: ${userID})`)
                .setTimestamp()
                .setFooter(oldChannel.guild.name, oldChannel.guild.iconURL)
        }
        if (!Log_Channel) return;
        if (oldChannel.name !== newChannel.name)
            Log_Channel.send({ embeds: [newEm('Name')] }).catch(er => { });
        if (oldChannel.topic !== newChannel.topic)
            Log_Channel.send({ embeds: [newEm('Topic')] }).catch(er => { });
    })
});
function SyncEventBan(ev, type) {
    client.on(ev, (guild, user) => {
        if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.EMBED_LINKS)) return;
        if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return;
        guild.fetchAuditLogs().then(logs => {
            var userID = logs.entries.first().executor.id;
            var userAvatar = logs.entries.first().executor.avatarURL;
            if (userID === client.user.id) return;
            let em = new MessageEmbed()
                .setTitle('**[' + type + ']**')
                .setThumbnail(userAvatar)
                .setColor('DARK_RED')
                .setDescription(`**\n**:airplane: Successfully \`\`${type}\`\` **${user.username}** From the server!\n\n**User:** <@${user.id}> (ID: ${user.id})\n**By:** <@${userID}> (ID: ${userID})`)
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL);
            if (!Log_BannedKick) return;
            Log_BannedKick.send({ embeds: [em] }).catch(er => { });
        })
    });
}
SyncEventBan('guildBanAdd', 'BANNED');
SyncEventBan('guildBanRemove', 'UNBANNED');

client.on('guildUpdate', (oldGuild, newGuild) => {
    if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.EMBED_LINKS)) return;
    if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return;
    oldGuild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;
        function newEm(type) {
            return new MessageEmbed()
                .setTitle('**[CHANGE GUILD \`' + type + '\`]**')
                .setThumbnail(userAvatar)
                .setColor('BLUE')
                .setDescription(`**\n**:white_check_mark: Successfully \`\`EDITED\`\` The guild ${type}.\n\n**Old ${type}:** \`\`${oldGuild.name}\`\`\n**New ${type}:** \`\`${newGuild.name}\`\`\n**By:** <@${userID}> (ID: ${userID})`)
                .setTimestamp()
                .setFooter(newGuild.name, oldGuild.iconURL);
        }
        if (oldGuild.name !== newGuild.name)
            Log_Global.send({ embeds: [newEm('Name')] }).catch(er => { })
        if (oldGuild.region !== newGuild.region)
            Log_Global.send(guildRegion).catch(er => { });
        if (oldGuild.verificationLevel !== newGuild.verificationLevel)
            Log_Global.send({
                embeds: [new MessageEmbed()
                    .setTitle('**[GUILD VERIFICATION LEVEL CHANGE]**')
                    .setThumbnail(userAvatar)
                    .setColor('BLUE')
                    .setDescription(`**\n**:white_check_mark: Successfully \`\`EDITED\`\` Guild Verification level.\n\n**Old Verification Level:** ${oldGuild.verificationLevel}\n**New Verification Level:** ${newGuild.verificationLevel}\n**By:** <@${userID}> (ID: ${userID})`)
                    .setTimestamp()
                    .setFooter(oldGuild.name, oldGuild.iconURL)]
            }).catch(er => { })
    })
});
client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (!oldMember.guild) return;
    oldMember.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;
        var userTag = logs.entries.first().executor.tag;
        if (oldMember.nickname !== newMember.nickname) {
            Log_Global.send({
                embeds: [new MessageEmbed()
                    .setTitle('**[UPDATE MEMBER NICKNAME]**')
                    .setThumbnail(userAvatar)
                    .setColor('BLUE')
                    .setDescription(`**\n**:spy: Successfully \`\`CHANGE\`\` Member Nickname.\n\n**User:** ${oldMember} (ID: ${oldMember.id})\n**Old Nickname:** \`${oldMember.nickname}\`\n**New Nickname:** \`${newMember.nickname}\`\n**By:** <@${userID}> (ID: ${userID})`)
                    .setTimestamp()
                    .setFooter(oldMember.guild.name, oldMember.guild.iconURL)]
            })
        }
        let arrOld = oldMember.roles.cache.map(r => `${r.id}`)
        let arrNew = newMember.roles.cache.map(r => `${r.id}`)
        if (oldMember.roles.cache.size < newMember.roles.cache.size) {
            let role;
            for (var a in arrNew) {
                if (!arrOld.includes(arrNew[a]))
                    role = guild.roles.cache.get(arrNew[a])
            }
            if (!role) return;
            Log_Roles.send({
                embeds: [new MessageEmbed()
                    .setTitle('**[ADDED ROLE TO MEMBER]**')
                    .setThumbnail(oldMember.guild.iconURL)
                    .setColor('GREEN')
                    .setDescription(`**\n**:white_check_mark: Successfully \`\`ADDED\`\` Role to **${oldMember.user.username}**\n\n**User:** <@${oldMember.id}> (ID: ${oldMember.user.id})\n**Role:** \`\`${role.name}\`\` (ID: ${role.id})\n**By:** <@${userID}> (ID: ${userID})`)
                    .setTimestamp()
                    .setFooter(userTag, userAvatar)]
            }).catch(er => { });
        }
        if (oldMember.roles.cache.size > newMember.roles.cache.size) {
            let role;
            for (var a in arrOld) {
                if (!arrNew.includes(arrOld[a]))
                    role = guild.roles.cache.get(arrOld[a])
            }
            if (!role) return;
            Log_Roles.send({
                embeds: [new MessageEmbed()
                    .setTitle('**[REMOVED ROLE FROM MEMBER]**')
                    .setThumbnail(oldMember.guild.iconURL)
                    .setColor('RED')
                    .setDescription(`**\n**:negative_squared_cross_mark: Successfully \`\`REMOVED\`\` Role from **${oldMember.user.username}**\n\n**User:** <@${oldMember.user.id}> (ID: ${oldMember.id})\n**Role:** \`\`${role.name}\`\` (ID: ${role.id})\n**By:** <@${userID}> (ID: ${userID})`)
                    .setTimestamp()
                    .setFooter(userTag, userAvatar)]
            }).catch(er => { });
        }
        if (oldMember.guild.ownerId !== newMember.guild.ownerId)
            Log_Global.send({
                embeds: [new MessageEmbed()
                    .setTitle('**[UPDATE GUILD OWNER]**')
                    .setThumbnail(oldMember.guild.iconURL)
                    .setColor('GREEN')
                    .setDescription(`**\n**:white_check_mark: Successfully \`\`TRANSFER\`\` The Owner Ship.\n\n**Old Owner:** <@${oldMember.user.id}> (ID: ${oldMember.user.id})\n**New Owner:** <@${newMember.user.id}> (ID: ${newMember.user.id})`)
                    .setTimestamp()
                    .setFooter(oldMember.guild.name, oldMember.guild.iconURL)]
            }).catch(er => { });
    });
});

client.on('voiceStateUpdate', (voiceOld, voiceNew) => {
    if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.EMBED_LINKS)) return;
    if (!guild?.members?.cache?.get(client?.user?.id).permissions?.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) return;
    voiceOld.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userTag = logs.entries.first().executor.tag;
        var userAvatar = logs.entries.first().executor.avatarURL;
        function newEm(type, pic) {
            return new MessageEmbed()
                .setTitle('**[VOICE ' + type + ']**')
                .setThumbnail(pic)
                .setColor('RED')
                .setDescription(`**User:** <@${voiceOld.id}> (ID: ${voiceOld.id})\n**By:** <@${userID}> (ID: ${userID})\n**Channel:** \`\`${voiceOld.channel.name}\`\` (ID: ${voiceOld.channel.id})`)
                .setTimestamp()
                .setFooter(userTag, voiceOld.guild.iconURL())
        }
        if (voiceOld.serverMute === false && voiceNew.serverMute === true)
            Log_Voice.send({ embeds: [newEm('MUTE', 'https://images-ext-1.discordapp.net/external/pWQaw076OHwVIFZyeFoLXvweo0T_fDz6U5C9RBlw_fQ/https/cdn.pg.sa/UosmjqDNgS.png')] }).catch(er => { });
        if (voiceOld.serverMute === true && voiceNew.serverMute === false)
            Log_Voice.send({ embeds: [newEm('UNMUTE', 'https://images-ext-1.discordapp.net/external/u2JNOTOc1IVJGEb1uCKRdQHXIj5-r8aHa3tSap6SjqM/https/cdn.pg.sa/Iy4t8H4T7n.png')] }).catch(er => { })
        if (voiceOld.serverDeaf === false && voiceNew.serverDeaf === true)
            Log_Voice.send({ embeds: [newEm('DEAF', 'https://images-ext-1.discordapp.net/external/7ENt2ldbD-3L3wRoDBhKHb9FfImkjFxYR6DbLYRjhjA/https/cdn.pg.sa/auWd5b95AV.png')] }).catch(er => { })
        if (voiceOld.serverDeaf === true && voiceNew.serverDeaf === false)
            Log_Voice.send({ embeds: [newEm('UNDEAF', 'https://images-ext-2.discordapp.net/external/s_abcfAlNdxl3uYVXnA2evSKBTpU6Ou3oimkejx3fiQ/https/cdn.pg.sa/i7fC8qnbRF.png')] }).catch(er => { })
    })
    let tag = voiceOld.guild.members.cache.get(voiceOld.id).user.tag;
    function NewChn(type) {
        return new MessageEmbed()
            .setTitle('**[' + type + ' VOICE ROOM]**')
            .setColor(type == "JOIN" ? "GREEN" : 'RED')
            .setThumbnail(voiceOld.avatarURL)
            .setDescription(`**\n**:arrow_lower_right: Successfully \`\`${type}\`\` To Voice Channel.\n\n**Channel:** \`\`${(type == "JOIN" ? voiceNew?.channel?.name : voiceOld?.channel?.name) || 'NULL'}\`\` (ID: ${(type == "JOIN" ? voiceNew?.channel?.id : voiceOld?.channel?.id) || 'NULL'})\n**User:** <@${voiceOld.id}> (ID: ${voiceOld.id})`)
            .setTimestamp()
            .setFooter(tag, voiceOld.guild.iconURL());
    }
    if (((voiceOld?.channel?.id !== voiceNew?.channel?.id) && (voiceNew.channel != undefined)) || voiceOld == null)
        Log_Voice.send({ embeds: [NewChn('JOIN')] }).catch(er => { });
    if ((voiceOld.channel != null && (voiceOld?.channel?.id !== voiceNew?.channel?.id)) || voiceNew.channel == null && voiceOld.channel != null)
        Log_Voice.send({ embeds: [NewChn('LEAVE')] }).catch(er => { });
    if (voiceOld?.channel?.id !== voiceNew?.channel?.id && voiceNew?.channel != null && voiceOld?.channel != null) {
        Log_Voice.send({
            embeds: [new MessageEmbed()
                .setTitle('**[CHANGED VOICE ROOM]**')
                .setColor('GREEN')
                .setThumbnail(voiceOld.avatarURL)
                .setDescription(`**\n**:repeat: Successfully \`\`CHANGED\`\` The Voice Channel.\n\n**From:** \`\`${voiceOld?.channel?.name}\`\` (ID: ${voiceOld?.channel?.id || 'NULL'})\n**To:** \`\`${voiceNew.channel.name || 'NULL'}\`\` (ID: ${voiceNew?.channel?.id})\n**User:** <@${voiceOld.id}> (ID: ${voiceOld.id})`)
                .setTimestamp()
                .setFooter(tag, voiceOld.guild.iconURL())]
        }).catch(er => { });
    }
});

function SearchBadWords(msg) {
    if (!msg) return;
    if (!msg.content.includes("") || msg.content == "") return;
    let con = msg.content
    let messageURL = `https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`
    for (var ads in BadWords) {
        if (con.includes(BadWords[ads])) {
            let em = new MessageEmbed()
                .setTitle(`Investigations`)
                .setImage('https://cdn.discordapp.com/attachments/892297517973254195/892323969733120011/fbi-calling.gif')
                .setDescription(`\n [Message Link.](${messageURL})\n **\n From : <@${msg.author.id}> **\n  **ID** : ${msg.author.id}  \n **\n Channel : ${msg.channel}  ** `)
                .addField(`Text:`, `- **(\`${BadWords[ads]}\`)** `, true)
                .setColor('RANDOM')
            InvestigationsChannel.send({ embeds: [em] }).catch(er => { });
            return 1;
        }
    }
    return 0;
}

client.on('messageCreate', async msg => {
    if (msg.author.bot) return
    if (!msg.channel.guild) return;
    let txt = msg.content
    let _args = txt.split(/ +/g)
    let args = _args.slice(1)
    let cmd = _args[0].slice(prefix.length)
    if (SearchBadWords(msg) == 1) return;
    if (['avatar', 'av', 'avt'].includes(cmd.toLowerCase())) {
        let user = msg.mentions.users.first() || msg.author;
        if (args.length == 1 && msg.guild.members.cache.get(`${args[0]}`) != undefined)
            user = msg.guild.members.cache.get(`${args[0]}`).user
        if (!user) return;
        let avatar = (args[0] && args[0] == "server" ? msg.guild.iconURL() + "?size=4096" : user.avatarURL() + "?size=4096")
        let em = new MessageEmbed()
            .setTitle((args[0] && args[0] == "server" ? msg.guild.name : user.tag))
            .setImage(avatar);
        msg.reply({ embeds: [em] }).catch(er => { })
    }

    if (cmd == "ping") {
        let Bping = `${Math.round(client.ping)}`;
        let em = new MessageEmbed()
            .setDescription(`ــــــــــــــــــــــــــــــ\n${client.username}'s Latency is \`${Bping}\`📶\nــــــــــــــــــــــــــــــ`)
            .setColor('GREEN');
        msg.reply({ embeds: [em] });
    }
    if (cmd == "profile") {
        let user = msg.mentions.users.first() || msg.author;
        msg.guild.invites.fetch().then(invites => {
            let personalInvites = invites.filter(i => i.inviter.id === user.id);
            let inviteCount = personalInvites.reduce((p, v) => v.uses + p, 0);
            let em = new MessageEmbed()
                .setTitle('Profile')
                .setDescription(user.username)
                .addField('Tag |   ', '#' + user.discriminator, true)
                .addField('ID | ', user.id, true)
                .addField('Invites |    ', `- \`${inviteCount}\``, true)
                .addField('Created At | ', `- \`${user.createdAt}\``)
                .setThumbnail(user.avatarURL())
                .setFooter(`Rqlix Development Team`)
                .setColor('RANDOM')
                .setTimestamp();
            msg.channel.send({ embeds: [em] }).catch(er => { });
        });
    }
    if (cmd == "clear") {
        async function sendThenDelete(asd, content, time, embed = null) {
            let m = await asd.channel.send({ content: content, embeds: [embed] })
            setTimeout(() => {
                m.delete().catch(er => { });
            }, time * 1000);
        }
        function Embed(desc) {
            return new MessageEmbed().setDescription(desc).setColor('RANDOM');
        }
        msg.delete().catch(er => { });
        if (msg.member.roles.cache.has(ClearRole)) {
            try {

            } catch (e) {
                msg.reply({ content: `\`${args[0]}\` is not a valid number` })
            }
            if (!args[0]) {
                msg.channel.messages.fetch().then(messages => {
                    msg.channel.bulkDelete(messages).catch(er => { });
                    sendThenDelete(msg, null, 5, Embed(`Number of deleted messages: \`${messages.size}\``));
                });
            } else {
                msg.channel.messages.fetch({ limit: parseInt(args[0]) })
                    .then(messages => msg.channel.bulkDelete(messages)).catch(er => { });
                sendThenDelete(msg, null, 5, Embed(`Number of deleted messages: \`${args[0]}\``));
                msg.delete().catch(er => { })
            }
        } else
            msg.channel.send({ embeds: [Embed('You do not have enough roles or permissions.')] }).catch(er => { });
    }
});

const { getAverageColor } = require('fast-average-color-node')
//avatar 
client.on('messageCreate', message => {
    var args = message.content.split(/ +/g);
    if (message.content.startsWith('$t')) {
        message.channel.send(`متعرف بوتك شغال ولا؟ عديم الاحساس `)
    }
});

