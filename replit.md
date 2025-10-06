# Overview

This is a Discord bot designed for Arabic-language communities that provides automated responses and creative ideas through slash commands. The bot operates entirely through Discord's slash command system, making it simple to use and requiring minimal permissions. It includes a comprehensive response library, an ideas generator with 600+ categorized ideas, and per-guild channel configuration.

**Recent Changes (Oct 2025):**
- Converted from message-based to slash-command-only operation to avoid MESSAGE_CONTENT Intent requirement
- Added new commands: `/greet`, `/advice`, and `/help`
- Enhanced `/idea` command with category selection via dropdown choices
- Removed message monitoring and processing to simplify permissions

# User Preferences

- Preferred communication style: Simple, everyday language
- User name: Dark (دارك)
- Project focus: Arabic-language Discord bot for community engagement

# System Architecture

## Application Structure

**Single-file Node.js application**: The entire bot logic resides in `bot.js`, keeping the codebase simple and self-contained. This monolithic approach was chosen for ease of deployment on Replit and straightforward maintenance for a focused use case.

**File-based data persistence**: All configuration and content data is stored in JSON files on disk rather than using a database. This design decision prioritizes:
- Simplicity: No database setup or connection management required
- Portability: Data travels with the code
- Replit compatibility: Works seamlessly with Replit's filesystem
- Trade-off: Not suitable for high-concurrency scenarios, but adequate for single-bot operations

**Data files**:
- `config.json`: Stores per-guild settings (designated bot channels)
- `responses.json`: Contains the response library with triggers and replies (structured as `{common: [], extended: []}`)
- `ideas.json`: Array of 600+ idea suggestions for random selection, categorized by type (يوتيوب, تيك توك, لعبة, تطبيق, مقال)

## Bot Framework

**Discord.js v14**: Uses the official Discord.js library for all bot interactions. The bot uses minimal gateway intents:
- `GatewayIntentBits.Guilds`: Server/guild access only
- **No MESSAGE_CONTENT Intent required**: Bot operates entirely through slash commands, avoiding the need for privileged intents

## Command System

**Slash commands** implemented using Discord.js REST API and command builders:

1. **`/idea [type]`** - Generates creative ideas based on category:
   - Options: يوتيوب, تيك توك, لعبة, تطبيق, مقال, عشوائي
   - Searches ideas.json for matching category and returns random suggestion
   - Falls back to random idea if no matches found

2. **`/greet [greeting]`** - Provides contextual greetings:
   - Options: سلام, صباح, مساء, كيف حالك
   - Pulls responses from responses.json common greetings
   - Returns culturally appropriate Arabic greetings

3. **`/advice [topic]`** - Gives advice and motivation:
   - Topics: تحفيز, تعلم, برمجة, تصميم, نصيحة عامة, راحة نفسية
   - Searches responses.json extended library for relevant advice
   - Returns motivational or practical guidance

4. **`/help`** - Displays comprehensive bot usage guide
   - Shows all available commands with descriptions
   - Ephemeral response (only visible to user)

5. **`/setbotroom [channel]`** - Sets designated bot room (Admin only)
   - Requires MANAGE_GUILD permission
   - Stores configuration per guild in config.json
   - Used for future per-channel features

## Response Library Structure

**responses.json** contains two categories:

1. **common**: Basic greetings and common interactions
   - Greetings: سلام, صباح, مساء
   - Basic responses: شكر, وداع, أهلا
   - Used by `/greet` command

2. **extended**: Detailed advice and topic-specific responses
   - Topics: programming, design, learning, motivation, health
   - Rich content for `/advice` command
   - Multiple response variations for diversity

## Ideas Library Structure

**ideas.json**: Array of 600+ creative ideas, each prefixed with category:
- Format: `"يوتيوب: فكرة المحتوى..."`
- Categories cover: YouTube content, TikTok videos, game concepts, app ideas, article topics
- Filtering logic: searches by prefix first, then by contains

## Cooldown System

**User-based cooldown**: 5-second cooldown per user to prevent spam
- Tracked in memory using Map<userId, timestamp>
- Returns friendly Arabic message with remaining time
- Cooldown applies across all commands

## Keep-Alive Mechanism

**Express web server**: A minimal HTTP server runs alongside the Discord bot to satisfy Replit's always-on requirement. This prevents the Replit from sleeping due to inactivity.
- Endpoint: `GET /` returns "🤖 Bot is running - Slash Commands Only"
- Listens on port 3000 (configurable via PORT env var)

## Configuration Management

**Environment-based secrets**: 
- `BOT_TOKEN` (required): Discord bot authentication token
- `CLIENT_ID` (recommended): Application ID for command registration
- `GUILD_ID` (optional): Specific guild ID for faster command deployment

**Runtime configuration updates**: The `config.json` file is read on startup and written synchronously when settings change (e.g., when setting bot room per guild). Each guild's configuration is namespaced by guild ID.

## Error Handling

**Graceful degradation**: 
- Missing data files return fallback values (empty arrays/objects) rather than crashing
- JSON parsing errors are logged but don't terminate the bot
- Interaction errors are caught and report friendly message to user
- Command failures don't crash the bot process

# External Dependencies

## Discord API
- **discord.js** (v14.14.0): Complete Discord bot framework
- **No privileged intents required**: Works with Guilds intent only
- Uses REST API for slash command registration

## Runtime Environment
- **Node.js** (20.x): JavaScript runtime
- **dotenv** (v16.4.0): Environment variable management
- **express** (v4.18.2): HTTP server for Replit keep-alive

## Platform Requirements
- **Replit Secrets**: Must configure `BOT_TOKEN` (required), recommended to add `CLIENT_ID` for command registration
- **Discord Developer Portal**: Bot only needs basic "Guilds" intent enabled (no privileged intents)
- **Bot Permissions**: Send Messages, Use Slash Commands (permissions value: 2048 for basic operation)

## No Database
This application intentionally uses file-based storage instead of a database system. All data persistence occurs through synchronous file I/O operations on JSON files.

# Development Notes

## Advantages of Slash-Commands-Only Approach
- No MESSAGE_CONTENT Intent needed (avoids Discord verification for 100+ servers)
- Simpler permission model
- Built-in command discovery (users can see available commands)
- Type-safe parameter handling with Discord's choice system
- No message parsing or regex complexity

## Trade-offs
- Less "natural" interaction compared to message triggers
- Users must learn commands instead of organic conversation
- Cannot respond to regular messages or mentions
- Requires users to type `/` to interact

## Future Enhancement Possibilities
- Add button/select menu interactions for multi-step flows
- Implement modal forms for complex inputs
- Add context menu commands for message/user actions
- Create scheduled tasks for daily ideas or motivation
- Add statistics tracking for popular commands/ideas
