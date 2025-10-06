# Overview

This is a Discord bot designed for Arabic-language communities that provides automated canned responses based on trigger words/phrases. The bot monitors messages in designated channels and responds with pre-configured replies from a library. It includes features for managing response patterns (exact match, contains, regex), a random ideas generator, and per-guild channel configuration.

# User Preferences

Preferred communication style: Simple, everyday language.

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
- `ideas.json`: Array of idea suggestions for random selection

## Bot Framework

**Discord.js v14**: Uses the official Discord.js library for all bot interactions. The bot requires specific gateway intents:
- `GatewayIntentBits.Guilds`: Server/guild access
- `GatewayIntentBits.GuildMessages`: Message monitoring
- `GatewayIntentBits.MessageContent`: Reading message text (privileged intent)
- `Partials.Message` and `Partials.Channel`: Handle partial data structures

## Message Processing Pattern Matching

**Three-tier trigger matching system**:
1. **Exact match**: Message content must exactly match trigger (case-insensitive)
2. **Contains match**: Trigger appears anywhere in message (case-insensitive)
3. **Regex match**: Pattern-based matching for complex rules

Each response in the library includes:
- `type`: Matching strategy ('exact', 'contains', 'regex')
- `triggers`: Array of trigger strings/patterns
- `responses`: Array of possible replies (one selected randomly)

## Command System

**Slash commands** implemented using Discord.js REST API and command builders:
- `/setbotroom`: Restricts bot responses to a specific channel (requires MANAGE_CHANNELS permission)
- Additional commands likely include idea generation based on `ideasList` usage

## Keep-Alive Mechanism

**Express web server**: A minimal HTTP server runs alongside the Discord bot to satisfy Replit's always-on requirement. This prevents the Replit from sleeping due to inactivity.

## Configuration Management

**Environment-based secrets**: Bot token (`BOT_TOKEN`), client ID (`CLIENT_ID`), and guild ID (`GUILD_ID`) are loaded from environment variables via dotenv, following security best practices for credential management.

**Runtime configuration updates**: The `config.json` file is read on startup and written synchronously when settings change (e.g., when setting bot room per guild). Each guild's configuration is namespaced by guild ID.

## Error Handling

**Graceful degradation**: Missing data files return fallback values (empty arrays/objects) rather than crashing. JSON parsing errors are logged but don't terminate the bot.

# External Dependencies

## Discord API
- **discord.js** (v14.22.1): Complete Discord bot framework
- Requires MESSAGE CONTENT privileged intent to be enabled in Discord Developer Portal
- Uses REST API for slash command registration

## Runtime Environment
- **Node.js** (18.x): JavaScript runtime
- **dotenv** (v16.6.1): Environment variable management
- **express** (v4.18.2): HTTP server for Replit keep-alive

## Platform Requirements
- **Replit Secrets**: Must configure `BOT_TOKEN` (required), optionally `CLIENT_ID` and `GUILD_ID`
- **Discord Developer Portal**: Bot must be created with proper intents enabled (Guilds, Guild Messages, Message Content)

## No Database
This application intentionally uses file-based storage instead of a database system. All data persistence occurs through synchronous file I/O operations on JSON files.