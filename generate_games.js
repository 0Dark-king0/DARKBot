// سكريبت لتوليد 800+ فكرة لعبة Godot مفصلة
const fs = require('fs');

// قوالب متنوعة
const genres = [
  "2D Platformer", "2D Top-Down Action", "2D Puzzle", "2D Adventure", "2D RPG",
  "2D Tower Defense", "2D Racing", "2D Fighting", "2D Stealth", "2D Survival",
  "2D Metroidvania", "2D Roguelike", "2D Rhythm", "2D Shooter", "2D Strategy",
  "Visual Novel", "Point & Click", "Card Game", "2D Farming Sim", "2D Horror",
  "2D Sports", "2D Arcade", "2D Educational", "2D Simulation", "2D Party Game"
];

const themes = [
  "صحراء", "غابة", "فضاء", "مدينة", "قلعة", "جزيرة", "جبال", "محيط", "كهف", "مختبر",
  "مدرسة", "مستشفى", "سوق", "معبد", "سجن", "مزرعة", "قرية", "عالم سحري", "عالم الأحلام", "المستقبل",
  "الماضي", "عالم الروبوتات", "عالم الحيوانات", "عالم الطعام", "عالم الموسيقى", "البحر", "الثلج", "البركان"
];

const protagonists = [
  "طفل صغير", "فارس شجاع", "ساحرة", "روبوت", "حيوان أليف", "عالم", "محقق", "طباخ", "موسيقار",
  "بطل خارق", "نينجا", "قرصان", "رائد فضاء", "مزارع", "صياد", "حارس", "طالب", "معلم", "طبيب"
];

const mechanics = [
  "قفز ومنصات", "قتال بالسيف", "إطلاق نار", "حل ألغاز", "جمع موارد", "صناعة أدوات",
  "إدارة موارد", "بناء قواعد", "تربية حيوانات", "زراعة محاصيل", "طبخ وجبات",
  "نظام حوار", "اختيارات قصة", "تخفي وتسلل", "سباقات", "قتال Boss", "جمع Collectibles",
  "ترقيات وقدرات", "سحر وتعاويذ", "تجارة ومقايضة", "استكشاف عالم مفتوح"
];

const objectives = [
  "إنقاذ العالم من الشر", "البحث عن كنز مفقود", "حل لغز قديم", "استعادة الذاكرة",
  "إيجاد طريق للعودة للبيت", "إنقاذ صديق مختطف", "بناء أفضل قرية", "هزيمة ملك الشر",
  "جمع كل القطع الأثرية", "اكتشاف سر العائلة", "إثبات البراءة", "الفوز بالبطولة",
  "إيقاف كارثة وشيكة", "استكشاف عالم جديد", "حل سلسلة جرائم"
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTitle(theme, protagonist) {
  const patterns = [
    `${protagonist} ${theme}`,
    `مغامرة في ${theme}`,
    `أسرار ${theme}`,
    `حارس ${theme}`,
    `رحلة ${protagonist}`,
    `${theme} المفقود`,
    `${protagonist} الشجاع`,
    `كنز ${theme}`,
    `لغز ${theme}`,
    `${protagonist} و${theme}`
  ];
  return rand(patterns);
}

function generateStory(protag, theme, objective) {
  const stories = [
    `${protag} يعيش حياة عادية في ${theme} حتى يكتشف ${objective}. يجب عليه خوض مغامرة خطيرة مليئة بالتحديات والألغاز لتحقيق هدفه وإنقاذ من يحب.`,
    
    `في ${theme} البعيد، ${protag} يواجه تحدياً كبيراً: ${objective}. مع مساعدة أصدقاء جدد وأدوات سحرية، ينطلق في رحلة ملحمية مليئة بالمفاجآت.`,
    
    `${protag} يستيقظ يوماً ليجد ${theme} قد تغير تماماً. المهمة الوحيدة أمامه: ${objective}. كل خطوة تقربه من الحقيقة وتكشف أسراراً مدفونة منذ زمن بعيد.`,
    
    `عندما يهدد خطر غامض ${theme}، ${protag} هو الأمل الوحيد. مهمته ${objective} قبل فوات الأوان. رحلة مليئة بالعقبات والمعارك تنتظره.`,
    
    `${protag} يحلم دائماً بالمغامرة، وأخيراً جاءت فرصته في ${theme}. هدفه ${objective}، لكن الطريق محفوف بالمخاطر والمفاجآت التي ستغير حياته للأبد.`
  ];
  return rand(stories);
}

function generateMechanics(genre) {
  const mechs = [];
  mechs.push(`- ${rand(mechanics)}`);
  mechs.push(`- ${rand(mechanics)}`);
  mechs.push(`- ${rand(mechanics)}`);
  mechs.push(`- ${rand(mechanics)}`);
  
  if (genre.includes('Platformer')) mechs.push('- قفز مزدوج وحركة دقيقة');
  if (genre.includes('RPG')) mechs.push('- نظام مستويات وخبرة');
  if (genre.includes('Puzzle')) mechs.push('- ألغاز بيئية متدرجة الصعوبة');
  if (genre.includes('Action')) mechs.push('- قتال ديناميكي وCombo Attacks');
  
  return mechs.join('\n');
}

function generateImplementation(genre) {
  const base = `**الخطوة 1: إعداد المشروع**
- إنشاء مشروع Godot 4.5 جديد
- ضبط إعدادات النافذة والجرافيكس

**الخطوة 2: إنشاء المشاهد الأساسية**
- Player.tscn: CharacterBody2D للاعب
- World.tscn: المستوى الرئيسي
- Enemy.tscn: الأعداء الأساسيين

**الخطوة 3: برمجة الميكانيكا الأساسية**
- Player.gd: التحكم والحركة
- سكريبتات الأعداء والتفاعلات
- نظام الصحة والضرر

**الخطوة 4: بناء المستويات**
- تصميم مستويات متدرجة الصعوبة
- إضافة Collectibles والتحديات
- نظام Checkpoints والحفظ

**الخطوة 5: الصقل والتحسين**
- إضافة الموسيقى والمؤثرات الصوتية
- تحسين واجهة المستخدم
- اختبار وموازنة الصعوبة`;
  
  return base;
}

function generateScenes() {
  return `- Player.tscn
- World.tscn
- Enemy.tscn
- Collectible.tscn
- UI/MainMenu.tscn
- UI/HUD.tscn
- UI/PauseMenu.tscn
- UI/GameOver.tscn`;
}

function generateScripts() {
  return `- Player.gd (تحكم اللاعب)
- Enemy.gd (سلوك الأعداء)
- GameManager.gd (إدارة اللعبة)
- LevelManager.gd (المستويات)
- UIController.gd (الواجهة)
- SaveSystem.gd (الحفظ)`;
}

function generateAssets(theme) {
  return `**الرسومات:**
- player_sprite.png
- ${theme}_tileset.png
- enemies_spritesheet.png
- items_icons.png
- background_layers.png

**الأصوات:**
- jump.wav
- attack.wav
- collect.wav
- bg_music.ogg
- ${theme}_ambience.ogg`;
}

function generateExpansion() {
  const expansions = [
    "إضافة مستويات إضافية ومناطق سرية",
    "نظام إنجازات ومكافآت",
    "وضع صعوبة أعلى New Game+",
    "شخصيات قابلة للعب متعددة",
    "تحديات يومية وأسبوعية",
    "وضع Multiplayer محلي",
    "Boss Fights متقدمة",
    "قصص جانبية وشخصيات NPC"
  ];
  
  return `- ${rand(expansions)}\n- ${rand(expansions)}\n- ${rand(expansions)}`;
}

// توليد الأفكار
const games = [];

// نبدأ من الأفكار الموجودة (6)
const existingGames = require('./godot_games.json');
games.push(...existingGames);

console.log('🎮 بدء توليد أفكار الألعاب...');

for (let i = games.length; i < 800; i++) {
  const genre = rand(genres);
  const theme = rand(themes);
  const protag = rand(protagonists);
  const obj = rand(objectives);
  
  const game = {
    title: generateTitle(theme, protag),
    genre: genre,
    story: generateStory(protag, theme, obj),
    mechanics: generateMechanics(genre),
    implementation: generateImplementation(genre),
    scenes: generateScenes(),
    scripts: generateScripts(),
    assets: generateAssets(theme),
    expansion: generateExpansion()
  };
  
  games.push(game);
  
  if ((i + 1) % 100 === 0) {
    console.log(`✅ تم توليد ${i + 1} فكرة...`);
  }
}

// حفظ الملف
fs.writeFileSync('godot_games.json', JSON.stringify(games, null, 2));
console.log(`\n🎉 تم! تم توليد ${games.length} فكرة لعبة مفصلة!`);
console.log(`📁 حُفظ في: godot_games.json`);
