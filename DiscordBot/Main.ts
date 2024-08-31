// src/index.ts
import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, ButtonInteraction } from 'discord.js';
import User from '../Database/Database';
import { getCoinData } from '../Helpers/CoinInfo/GetCoinCMC'
import { Utils } from '../Helpers/Utils';
import { buyCoinFromBinance, buyCoinFromBybit } from './BuyActions'
import { connectDB } from '../Database/Database'
let userCache: Record<string, any> = {};
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});



const PREFIX = '!';
const BOT_TOKEN = "MTI3ODY3NTgxMjYxMDIxMTg1MQ.GDfuXe.AqwYfPcqSThylodhPzwxE-vABvjbhaKFxd8b48"
const handleSetBinanceApiKey = async (message: any) => {
    if (message && message.content && message.content.startsWith(`${PREFIX}addbinance`)) {
        const args = message.content.split(' ').slice(1);
        if (args.length !== 2) {
            return message.reply('Please provide both an API Key and Secret. Usage: `!addbinance <apiKey> <apiSecret>`');
        }

        const [apiKey, apiSecret] = args;

        try {
            const user = await User.findOneAndUpdate(
                { discordTag: message.author.tag },
                { binanceApiKey: apiKey, binanceApiSecret: apiSecret },
                { new: true, upsert: true }
            );
            await message.reply('Your Binance API key and secret have been securely added!');
        } catch (err) {
            console.error(err);
            await message.reply('An error occurred while saving your Binance API credentials.');
        }
    }
}
const handleSetByBitApiKey = async (message: any) => {
    if (message && message.content && message.content.startsWith(`${PREFIX}addbybit`)) {
        const args = message.content.split(' ').slice(1);
        if (args.length !== 2) {
            return message.reply(
                'Please provide both an API Key and Secret. Usage: `!addbybit <apiKey> <apiSecret>`'
            );
        }

        const [apiKey, apiSecret] = args;
        try {
            const user = await User.findOneAndUpdate(
                { discordTag: message.author.tag },
                { bybitApiKey: apiKey, bybitApiSecret: apiSecret },
                { new: true, upsert: true }
            );

            await message.reply('Your Upbit API key and secret have been securely added!');
        } catch (err) {
            console.error(err);
            await message.reply('An error occurred while saving your Binance API credentials.');
        }
    }
}
const handleSetAmount = async (message: any) => {
    if (message && message.content && message.content.startsWith('!setamount')) {
        const args = message.content.split(' ').slice(1);
        if (args.length !== 1) {
            return message.reply('Please provide an amount. Usage: `!setamount <amount>`');
        }
        const [amount] = args;
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount)) {
            return message.reply('Please provide a valid number for the amount.');
        }
        try {
            // Update the amount in the database
            const user = await User.findOneAndUpdate(
                { discordTag: message.author.tag },
                { amount: parsedAmount },
                { new: true, upsert: true }
            );

            await message.reply(`Your amount has been set to ${parsedAmount}.`);
        } catch (err) {
            await message.reply('An error occurred while saving your amount.');
        }
    }
}
const replayToButtonInteraction = async (buttonInteraction: ButtonInteraction, content: string) => {
    try {
        await buttonInteraction.reply({ content: content, ephemeral: true })
    } catch (err) {
        Utils.log('Error in replaying to button interaction ' + err, 'error')
    }
}
const dataErrorHandling = (amount : number  , apiKey : string , apiSecret : string ,buttonInteraction  : ButtonInteraction) => {
    if(!amount || !apiKey || !apiSecret){
        replayToButtonInteraction(buttonInteraction, "Please set your amount and API keys first")
        return false 
    }
    return true 
}
async function fetchAndCacheDatabase() {
    try {
        // Connect to MongoDB

        // Fetch all user documents
        const users = await User.find({});

        // Update the cache
        userCache = users.reduce((cache, user) => {
            cache[user.discordTag] = user;
            return cache;
        }, {} as Record<string, any>);

    } catch (error) {
        console.error('Error fetching data from MongoDB:', error);
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {

    if (message.content.startsWith(`${PREFIX}help`)) {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Help - Add Binance/Bybit API Keys')
            .setDescription(
                'To add your Binance or Bybit API key, use the following commands:\n\n`!addbinance <apiKey> <apiSecret>`\n`!addbybit <apiKey> <apiSecret>`\n\n`!setamount <amount>`\n\nKeep your API keys secure and enable IP restrictions on your exchange accounts.'
            );

        await message.channel.send({ embeds: [helpEmbed] });
    }

    if (message && message.embeds && message.embeds[0] && message.embeds[0].data.title === 'New Listing Catched' && message.author.id == "1277970962297393172") {
        const description = message.embeds[0].data.description as string
        const embed = new EmbedBuilder()
            .setTitle('New Listing Catched')
            .setDescription(message.embeds[0].data.description || "No Description")
            .addFields(...(message.embeds[0].data.fields || []))
            .setColor(0xFFCAF1);;

        const CoinName = Utils.extractCoinNames(description);
        CoinName.forEach(async (coinName) => {
            const webhook = "https://discord.com/api/webhooks/1277970962297393172/37htilEDkqC2RSHwWuDqZPAo5GfLScyaHfZigfNsMwFEb9ih-YRRD46-qE4_GRZaPK3X"
            getCoinData(coinName, webhook)

            const buyBinance = new ButtonBuilder().setCustomId(`💰 Buy on Binance | Coin: ${coinName}`).setLabel(`💰 Buy on Binance | Coin: ${coinName}`).setStyle(ButtonStyle.Primary);
            const buyBybit = new ButtonBuilder().setCustomId(`💰 Buy on bybit | Coin: ${coinName}`).setLabel(`💰 Buy on bybit | Coin: ${coinName}`).setStyle(ButtonStyle.Primary);
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buyBinance, buyBybit);

            await message.channel.send({ embeds: [embed], components: [row] });
        })
    }

    // Command to add Binance API key
    handleSetBinanceApiKey(message)
    // Command to add Bybit API key
    handleSetByBitApiKey(message)
    // Command to set the amount in the database
    handleSetAmount(message)
});

// TODO to refactor 
client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isButton()) return; // Ensure the interaction is a button click
    const buttonInteraction = interaction as ButtonInteraction;

    if (!userCache[interaction.user.username]) replayToButtonInteraction(buttonInteraction, 'Please set your amount and API keys first');
    const customId = buttonInteraction.customId; // Retrieve the custom ID of the clicked button
    const {amount , binanceApiKey , binanceApiSecret , bybitApiKey , bybitApiSecret} = userCache[interaction.user.username]._doc
    // Handle button interaction based on the custom ID
    if (customId && customId.includes('💰 Buy on Binance | Coin:')) {
        const coin = customId.split('💰 Buy on Binance | Coin: ')[1];

        const canBuyCoinFromBuybit = dataErrorHandling(amount,binanceApiKey,binanceApiSecret, buttonInteraction)
        if(!canBuyCoinFromBuybit) return

        const response = await buyCoinFromBinance(coin + "USDT", amount, binanceApiKey, binanceApiSecret);
        replayToButtonInteraction(buttonInteraction, response.toString())
    } else if (customId && customId.includes('💰 Buy on bybit | Coin:')) {
        const coin = customId.split('💰 Buy on bybit | Coin: ')[1];
        const canBuyCoinFromBuybit = dataErrorHandling(amount,bybitApiKey,bybitApiSecret, buttonInteraction)
        if(!canBuyCoinFromBuybit) return

        const response = await buyCoinFromBybit(coin + "USDT", amount.toString(), bybitApiKey, bybitApiSecret);
        replayToButtonInteraction(buttonInteraction, response.toString())
    }
});


client.on('error', (error) => {
    Utils.log('An error occurred: in discord Monitor ' + error, 'error');
})

client.login(BOT_TOKEN);
setInterval(fetchAndCacheDatabase, 5 * 1000);
fetchAndCacheDatabase();
connectDB();