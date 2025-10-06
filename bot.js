require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || null;
const GUILD_ID = process.env.GUILD_ID || null;

if (!TOKEN) {
  console.error("Missing BOT_TOKEN in environment. ضع التوكن في Secrets باسم BOT_TOKEN");
  process.exit(1);
}

const DATA_DIR = __dirname;
function loadJSON(name, fallback) {
  try {
    const p = path.join(DATA_DIR, name);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) {
    console.error("fail load", name, e);
  }
  return fallback;
}

const responsesData = loadJSON('responses.json', { common: [], extended: [] });
const ideasList = loadJSON('ideas.json', []);

const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
let config = {};
try { if (fs.existsSync(CONFIG_FILE)) config = JSON.parse(fs.readFileSync(CONFIG_FILE,'utf8')); } catch(e){console.error(e);}
function saveConfig(){ fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2)); }
function setBotRoom(guildId, channelId){ config[guildId] = config[guildId] || {}; config[guildId].botRoom = channelId; saveConfig(); }
function getBotRoom(guildId){ return config[guildId] ? config[guildId].botRoom : null; }

function rand(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
function matchLibrary(content, library){
  const text = content.toLowerCase();
  const matches = [];
  for (const item of library) {
    for (const trig of item.triggers) {
      const t = trig.toLowerCase();
      try {
        if (item.type === 'exact' && text === t) { matches.push(item); break; }
        else if (item.type === 'contains' && text.includes(t)) { matches.push(item); break; }
        else if (item.type === 'regex') { const re = new RegExp(t); if (re.test(text)) { matches.push(item); break; } }
      } catch(e){ console.error('bad trig',trig,e); }
    }
  }
  return matches;
}

const userCooldowns = new Map();
const COOLDOWN_MS = 8000;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

client.once('ready', ()=> {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  try{
    if (message.author.bot) return;
    const content = message.content.trim();
    const guildId = message.guild ? message.guild.id : null;
    const botRoomId = guildId ? getBotRoom(guildId) : null;
    const inBotRoom = message.channelId === botRoomId;

    const now = Date.now();
    const last = userCooldowns.get(message.author.id) || 0;
    if (now - last < COOLDOWN_MS) return;

    const lowered = content.toLowerCase();
    const mentioned = message.mentions.has(client.user) || lowered.includes(client.user.username.toLowerCase()) || lowered.includes('بوت');
    const looksLikeQuestion = content.includes('؟') || /\b(كيف|لماذا|ليش|وش|ما|هل|وين|متى)\b/i.test(content) || content.endsWith('?');

    if (mentioned && looksLikeQuestion && !inBotRoom) {
      let reply = 'تعال الروم حقي أعطيك 😁';
      if (botRoomId) reply += ` <#${botRoomId}>`;
      else reply += ' (أطلب من الأدمن يعيّن روم البوت باستخدام /setbotroom)';
      await message.reply(reply);
      userCooldowns.set(message.author.id, Date.now());
      return;
    }

    if (inBotRoom) {
      if (/(فكرة|ابغا فكرة|هات فكرة|idea)/i.test(content)) {
        await message.reply('تبغى الفكرة لأي نوع؟ (مثال: يوتيوب, تيك توك, لعبة, تطبيق, مقال) — اكتب اسم النوع هنا خلال 20 ثانية');
        const filter = m => m.author.id === message.author.id && m.channelId === message.channelId;
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 20000 });
        if (collected && collected.size > 0) {
          const answer = collected.first().content.trim().toLowerCase();
          let candidates = ideasList.filter(it => it.toLowerCase().startsWith(answer));
          if (candidates.length === 0) candidates = ideasList.filter(it => it.toLowerCase().includes(answer));
          if (candidates.length === 0) {
            await message.reply('ما حصلت شي مشابه. هذي فكرة عشوائية بدلًا عنها:\n' + (ideasList.length ? rand(ideasList) : 'مافي أفكار محمّلة'));
          } else {
            await message.reply('حلو! جرب هالفكرة:\n' + rand(candidates));
          }
        } else {
          await message.reply('ما وصلني رد منك — إذا تبي جرب /idea أو اكتب \"فكرة\" مرة ثانية داخل روم البوت.');
        }
        userCooldowns.set(message.author.id, Date.now());
        return;
      }

      const matches = [...matchLibrary(content, responsesData.common || []), ...matchLibrary(content, responsesData.extended || [])];
      if (matches.length > 0) {
        const chosen = rand(matches);
        await message.reply(rand(chosen.responses));
        userCooldowns.set(message.author.id, Date.now());
      }
      return;
    }

    const matches = matchLibrary(content, responsesData.common || []);
    if (matches.length > 0) {
      const chosen = rand(matches);
      await message.reply(rand(chosen.responses));
      userCooldowns.set(message.author.id, Date.now());
    }
  } catch(err) {
    console.error('messageCreate error', err);
  }
});

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder().setName('idea').setDescription('يعطيك فكرة عشوائية (سيسألك عن النوع داخل روم البوت)').toJSON(),
    new SlashCommandBuilder()
      .setName('setbotroom')
      .setDescription('يحدد روم البوت (Admins only)')
      .addChannelOption(opt => opt.setName('channel').setDescription('اختر الروم').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    if (GUILD_ID && CLIENT_ID) {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
      console.log('Registered guild commands');
    } else if (CLIENT_ID) {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('Registered global commands (may take up to 1 hour)');
    } else {
      console.warn('CLIENT_ID not provided; skipping command registration.');
    }
  } catch(e) {
    console.error('Failed to register commands', e);
  }
}

client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'idea') {
      await interaction.reply({ content: 'اكتب \"فكرة\" داخل روم البوت ثم حدّد النوع (يوتيوب/تيك توك/لعبة/تطبيق/مقال).', ephemeral: true });
    } else if (interaction.commandName === 'setbotroom') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({ content: 'ما عندك صلاحية تستخدم هالأمر.', ephemeral: true });
      }
      const channel = interaction.options.getChannel('channel');
      setBotRoom(interaction.guildId, channel.id);
      await interaction.reply({ content: `تم تعيين روم البوت: <#${channel.id}>`, ephemeral: false });
    }
  } catch(e) { console.error('interaction error', e); }
});

(async () => {
  await registerCommands();
  await client.login(TOKEN);
})();

const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Health server listening on port ${PORT}`));
