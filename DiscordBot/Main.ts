// src/index.ts
import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../Database/Database';
import { getCoinData } from '../Helpers/CoinInfo/GetCoinCMC'
import { Utils } from '../Helpers/Utils';
dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

async function connectDB() {
    try {
        await mongoose.connect("mongodb+srv://blackent151:Ly2HF7qJIOeDkyZD@cluster0.qzd08.mongodb.net/" as string)
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
}
connectDB();

const PREFIX = '!';

const handleSetBinanceApiKey = async (message: any) => {
    if (message && message.content &&  message.content.startsWith(`${PREFIX}addbinance`)) {
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
    if (message && message.content &&  message.content.startsWith(`${PREFIX}addbybit`)) {
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

            await message.reply('Your Binance API key and secret have been securely added!');
        } catch (err) {
            console.error(err);
            await message.reply('An error occurred while saving your Binance API credentials.');
        }
    }
}
const handleSetAmount = async (message: any) => {
    if (message && message.content &&  message.content.startsWith('!setamount')) {
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


client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {

    if (message.content.startsWith(`${PREFIX}help`)) {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Help - Add Binance/Bybit API Keys')
            .setDescription(
                'To add your Binance or Bybit API key, use the following commands:\n\n`!addbinance <apiKey> <apiSecret>`\n`!addbybit <apiKey> <apiSecret>`\n\nKeep your API keys secure and enable IP restrictions on your exchange accounts.\n`!setamount <amount>`\n\nKeep your API keys secure and enable IP restrictions on your exchange accounts.'
            );

        await message.channel.send({ embeds: [helpEmbed] });
    }

    if (message  && message.embeds && message.embeds[0] && message.embeds[0].data.title === 'New Listing Catched' && message.author.id == "1277970962297393172") {
        const description = message.embeds[0].data.description as string
        const embed = new EmbedBuilder()
            .setTitle('New Listing Catched')
            .setDescription(message.embeds[0].data.description || "No Description")
            .addFields(
                ...(message.embeds[0].data.fields || [])
            ).setColor(0xFFCAF1);;
        const CoinName = Utils.extractCoinNames(description);
        CoinName.forEach(async (coinName) => {
            getCoinData(coinName, "https://discord.com/api/webhooks/1277970962297393172/37htilEDkqC2RSHwWuDqZPAo5GfLScyaHfZigfNsMwFEb9ih-YRRD46-qE4_GRZaPK3X")
            
        })
        const buyBinance = new ButtonBuilder().setCustomId('BUY(BINANCE)').setLabel('BUY(BINANCE)').setStyle(ButtonStyle.Primary);
        const buyBybit= new ButtonBuilder().setCustomId('BUY(BYBIT)').setLabel('BUY(BYBIT)').setStyle(ButtonStyle.Primary);
        const longBinance = new ButtonBuilder().setCustomId('LONG(BINANCE)').setLabel('LONG(BINANCE)').setStyle(ButtonStyle.Primary);
        const longBybit = new ButtonBuilder().setCustomId('LONG(BYBIT)').setLabel('LONG(BYBIT)').setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buyBinance,buyBybit,longBinance,longBybit);

        await message.channel.send({ embeds: [embed], components: [row] });
    }
    // Command to add Binance API key

    handleSetBinanceApiKey(message)
    // Command to add Bybit API key
    handleSetByBitApiKey(message)
    // Command to set the amount in the database
    handleSetAmount(message)
});


client.login("MTI3ODY3NTgxMjYxMDIxMTg1MQ.GDfuXe.AqwYfPcqSThylodhPzwxE-vABvjbhaKFxd8b48");
