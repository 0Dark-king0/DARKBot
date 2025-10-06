require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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

const userCooldowns = new Map();
const COOLDOWN_MS = 5000;

function checkCooldown(userId) {
  const now = Date.now();
  const last = userCooldowns.get(userId) || 0;
  if (now - last < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
    return { onCooldown: true, remaining };
  }
  userCooldowns.set(userId, now);
  return { onCooldown: false };
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', ()=> {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`🤖 البوت جاهز ويعمل بنظام Slash Commands فقط`);
});

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('idea')
      .setDescription('يعطيك فكرة إبداعية حسب النوع')
      .addStringOption(option =>
        option.setName('type')
          .setDescription('نوع الفكرة')
          .setRequired(true)
          .addChoices(
            { name: '📹 يوتيوب', value: 'يوتيوب' },
            { name: '🎵 تيك توك', value: 'تيك توك' },
            { name: '🎮 لعبة', value: 'لعبة' },
            { name: '📱 تطبيق', value: 'تطبيق' },
            { name: '📝 مقال', value: 'مقال' },
            { name: '🎲 عشوائي', value: 'عشوائي' }
          ))
      .toJSON(),
    
    new SlashCommandBuilder()
      .setName('greet')
      .setDescription('احصل على تحية من البوت')
      .addStringOption(option =>
        option.setName('greeting')
          .setDescription('نوع التحية')
          .setRequired(false)
          .addChoices(
            { name: '👋 سلام', value: 'سلام' },
            { name: '🌅 صباح', value: 'صباح' },
            { name: '🌙 مساء', value: 'مساء' },
            { name: '❓ كيف حالك', value: 'حال' }
          ))
      .toJSON(),
    
    new SlashCommandBuilder()
      .setName('advice')
      .setDescription('احصل على نصيحة أو رد محفز')
      .addStringOption(option =>
        option.setName('topic')
          .setDescription('الموضوع')
          .setRequired(false)
          .addChoices(
            { name: '💪 تحفيز', value: 'تحفيز' },
            { name: '📚 تعلم', value: 'تعلم' },
            { name: '💻 برمجة', value: 'برمجة' },
            { name: '🎨 تصميم', value: 'تصميم' },
            { name: '🎯 نصيحة عامة', value: 'نصيحة' },
            { name: '😌 راحة نفسية', value: 'راحة' }
          ))
      .toJSON(),
    
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('شرح كيفية استخدام البوت')
      .toJSON(),
    
    new SlashCommandBuilder()
      .setName('setbotroom')
      .setDescription('يحدد روم البوت (للأدمن فقط)')
      .addChannelOption(opt => opt.setName('channel').setDescription('اختر الروم').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('⏳ جاري تسجيل الأوامر...');
    if (GUILD_ID && CLIENT_ID) {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
      console.log('✅ تم تسجيل الأوامر في السيرفر المحدد');
    } else if (CLIENT_ID) {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('✅ تم تسجيل الأوامر بشكل عام (قد تستغرق حتى ساعة للظهور)');
    } else {
      console.warn('⚠️ CLIENT_ID غير موجود، لن يتم تسجيل الأوامر. أضف CLIENT_ID في Secrets.');
    }
  } catch(e) {
    console.error('❌ فشل تسجيل الأوامر:', e);
  }
}

client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const cooldown = checkCooldown(interaction.user.id);
    if (cooldown.onCooldown) {
      return interaction.reply({ 
        content: `⏰ انتظر ${cooldown.remaining} ثانية قبل استخدام أمر آخر`, 
        ephemeral: true 
      });
    }

    if (interaction.commandName === 'idea') {
      const type = interaction.options.getString('type');
      let idea;

      if (type === 'عشوائي' || !ideasList.length) {
        idea = ideasList.length ? rand(ideasList) : 'مافي أفكار محمّلة حالياً';
      } else {
        let candidates = ideasList.filter(it => it.toLowerCase().startsWith(type.toLowerCase()));
        if (candidates.length === 0) {
          candidates = ideasList.filter(it => it.toLowerCase().includes(type.toLowerCase()));
        }
        if (candidates.length === 0) {
          idea = `ما حصلت أفكار مناسبة لـ "${type}". هذي فكرة عشوائية:\n${rand(ideasList)}`;
        } else {
          idea = rand(candidates);
        }
      }

      await interaction.reply({ 
        content: `💡 **فكرة ${type}:**\n${idea}`,
        ephemeral: false
      });

    } else if (interaction.commandName === 'greet') {
      const greetType = interaction.options.getString('greeting') || 'سلام';
      let response;

      if (greetType === 'سلام') {
        const greetings = responsesData.common.find(r => r.triggers.some(t => t.includes('السلام')));
        response = greetings ? rand(greetings.responses) : 'وعليكم السلام! 👋';
      } else if (greetType === 'صباح') {
        const greetings = responsesData.common.find(r => r.triggers.some(t => t.includes('صباح')));
        response = greetings ? rand(greetings.responses) : 'صباح النور! ☀️';
      } else if (greetType === 'مساء') {
        const greetings = responsesData.common.find(r => r.triggers.some(t => t.includes('مساء')));
        response = greetings ? rand(greetings.responses) : 'مساء الخير! 🌙';
      } else if (greetType === 'حال') {
        const greetings = responsesData.common.find(r => r.triggers.some(t => t.includes('كيف حالك')));
        response = greetings ? rand(greetings.responses) : 'الحمد لله بخير! وأنت؟ 😊';
      }

      await interaction.reply({ content: response, ephemeral: false });

    } else if (interaction.commandName === 'advice') {
      const topic = interaction.options.getString('topic') || 'نصيحة';
      let response;

      const topicMap = {
        'تحفيز': ['تحفيز', 'حماس', 'دافع'],
        'تعلم': ['تعلم', 'دراسة'],
        'برمجة': ['برمجة', 'كود', 'برمج'],
        'تصميم': ['تصميم', 'ديزاين'],
        'نصيحة': ['نصيحة', 'نصحني'],
        'راحة': ['تعبان', 'ضايق', 'ملل']
      };

      const keywords = topicMap[topic] || ['نصيحة'];
      let foundResponse = null;

      for (const keyword of keywords) {
        foundResponse = responsesData.extended.find(r => 
          r.triggers.some(t => t.toLowerCase().includes(keyword.toLowerCase()))
        );
        if (foundResponse) break;
      }

      response = foundResponse ? rand(foundResponse.responses) : 'أفضل نصيحة: كن نفسك واستمر في التطوير! 💪';

      await interaction.reply({ content: `💭 **${topic}:**\n${response}`, ephemeral: false });

    } else if (interaction.commandName === 'help') {
      const helpText = `
📖 **دليل استخدام البوت:**

**الأوامر المتاحة:**

🎯 \`/idea [النوع]\` - احصل على فكرة إبداعية
   • يوتيوب - أفكار محتوى يوتيوب
   • تيك توك - أفكار فيديوهات قصيرة
   • لعبة - أفكار ألعاب
   • تطبيق - أفكار تطبيقات
   • مقال - أفكار مقالات
   • عشوائي - فكرة عشوائية

👋 \`/greet [نوع]\` - احصل على تحية
   • سلام - تحية عامة
   • صباح - تحية صباحية
   • مساء - تحية مسائية
   • كيف حالك - سؤال عن الحال

💡 \`/advice [الموضوع]\` - احصل على نصيحة
   • تحفيز - كلمات محفزة
   • تعلم - نصائح تعليمية
   • برمجة - نصائح برمجية
   • تصميم - نصائح تصميم
   • نصيحة عامة - نصائح متنوعة
   • راحة نفسية - كلمات مريحة

⚙️ \`/setbotroom\` - تحديد روم البوت (للأدمن)

📌 **ملاحظة:** البوت يعمل الآن بنظام Slash Commands فقط
`;

      await interaction.reply({ content: helpText, ephemeral: true });

    } else if (interaction.commandName === 'setbotroom') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({ content: '❌ ما عندك صلاحية تستخدم هالأمر.', ephemeral: true });
      }
      const channel = interaction.options.getChannel('channel');
      setBotRoom(interaction.guildId, channel.id);
      await interaction.reply({ content: `✅ تم تعيين روم البوت: <#${channel.id}>`, ephemeral: false });
    }

  } catch(e) { 
    console.error('❌ خطأ في معالجة الأمر:', e);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'حدث خطأ أثناء تنفيذ الأمر', ephemeral: true });
    }
  }
});

(async () => {
  await registerCommands();
  await client.login(TOKEN);
})();

const app = express();
app.get('/', (req, res) => res.send('🤖 Bot is running - Slash Commands Only'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Health server listening on port ${PORT}`));
