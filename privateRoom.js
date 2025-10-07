const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('private')
        .setDescription('إنشاء أو حذف غرفة نصية خاصة بالعضو')
        .addSubcommand(subcommand =>
            subcommand.setName('create')
                .setDescription('ينشئ غرفة خاصة لعضو محدد')
                .addUserOption(option =>
                    option.setName('member')
                        .setDescription('اختر العضو الذي تريد إنشاء الغرفة له')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('delete')
                .setDescription('يحذف الغرفة الخاصة بالعضو')
                .addUserOption(option =>
                    option.setName('member')
                        .setDescription('اختر العضو الذي تريد حذف غرفته')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const member = interaction.options.getUser('member');
        const guild = interaction.guild;

        if (!member) return interaction.reply({ content: 'العضو غير موجود!', ephemeral: true });

        const channelName = `private-${member.username.toLowerCase()}`;

        if (subcommand === 'create') {
            // تحقق إذا الغرفة موجودة
            const existingChannel = guild.channels.cache.find(ch => ch.name === channelName && ch.type === ChannelType.GuildText);
            if (existingChannel) return interaction.reply({ content: 'الغرفة الخاصة بهذا العضو موجودة بالفعل!', ephemeral: true });

            // إنشاء القناة
            const channel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: member.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels],
                    },
                ],
            });

            await interaction.reply({ content: `تم إنشاء غرفة خاصة للعضو ${member.username}: <#${channel.id}>`, ephemeral: true });
        } else if (subcommand === 'delete') {
            const existingChannel = guild.channels.cache.find(ch => ch.name === channelName && ch.type === ChannelType.GuildText);
            if (!existingChannel) return interaction.reply({ content: 'لم يتم العثور على غرفة خاصة بهذا العضو!', ephemeral: true });

            await existingChannel.delete();
            await interaction.reply({ content: `تم حذف الغرفة الخاصة بالعضو ${member.username}`, ephemeral: true });
        }
    },
};
