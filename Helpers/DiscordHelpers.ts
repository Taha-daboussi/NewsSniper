const axios = require('axios')
import { Utils } from './Utils'
import { HttpsProxyAgent } from 'https-proxy-agent';
import { Proxy } from '../HttpClient/Proxy';
import { CoinEntryData } from './CoinInfo/GetCoinCMC';

const avatar_url = "https://media.discordapp.net/attachments/1262070850983563297/1279094776653811772/L2NLNWNU_400x400.png?ex=66d33157&is=66d1dfd7&hm=6030666087613169e00ea2ba46c7378d03c3f484b24bcca26f2ae03c4e0120bf&=&format=webp&quality=lossless"
export interface Root {
    listed_at: string
    first_listed_at: string
    id: number
    title: string
    category: string
    need_new_badge: boolean
    need_update_badge: boolean
    delay: number
    cacheStatus: string[]
    skipBypass: boolean
}


export class DiscordHelpers {
    static Proxy = new Proxy()

    static async sendWebhook(webhookUrl: string, params: Record<any, any>, isError = false) {
        const proxy = this.Proxy.getMyProxy('Proxy.txt')
        const agent = new HttpsProxyAgent(proxy);
        const configuration = {
            headers: {
                'Content-Type': 'application/json',
            },
            httpsAgent: agent
        };
        //@ts-ignore
        if (!isError) delete configuration.httpsAgent
        axios.post(webhookUrl, params, configuration).catch(async (err: any) => {
            Utils.log('Failed to send webhook ' + err)
            if (err.response && err.response.status && (err.response.status !== 429 || err.response.status !== 400)) {
                return this.sendWebhook(webhookUrl, params)
            }
        })
    }

    static buildWebhookParamsForNews(data: Root, options: Record<any, any> = { Mode: "Frontend", Website: "UpBit" }) {
        const color = 0xFFCAF1; // Use hexadecimal color value
        const params = {
            username: 'News Monitor',
            avatar_url: avatar_url,
            content: "||@everyone||",  // This will mention everyone
            embeds: [
                {
                    title: 'New Listing Catched',
                    description: data.title || "No Title",
                    color: color,
                    fields: [
                        {
                            name: 'Listed At ',
                            value: data.listed_at || "No Listed At info",
                            inline: true,
                        }, {
                            name: 'Delay',
                            value: data.delay && data.delay?.toString() || "No Delay Status ",
                            inline: true,
                        }, {
                            name: 'Cache Status',
                            value: data.cacheStatus && JSON.stringify(data.cacheStatus[0]) || "No Cache Status",
                            inline: true,
                        }, {
                            name: "isUsingBypass",
                            value: (!data.skipBypass).toString(),
                            inline: true
                        }, {
                            name: "Mode",
                            value: options.Mode ,
                            inline: true
                        }, {
                            name: "Website",
                            value: options.Website,
                            inline: true
                        },
                        {
                            name: "Capture Time",
                            value: new Date().toISOString(),
                            inline: true
                        }
                    ],
                    footer: {
                        text: 'News Monitor - Automated Notifications',
                        icon_url: avatar_url

                    },
                    timestamp: new Date().toISOString(), // Include a timestamp
                },
            ],
        };
        return params
    }

    static buildWebhookParamsForCoinInfo(data: CoinEntryData , formattedMessage : string) {
        const color = 0xFFCAF1; // Use hexadecimal color value
        const params = {
            username: 'Coin Info ',
            avatar_url: avatar_url,
            content: "||@everyone||",  // This will mention everyone
            embeds: [
                {
                    title: 'New Coin detected',
                    description: data.tokenName,
                    color: color,
                    fields: [
                        {
                            name: 'fully_diluted_market_cap',
                            value: data.fully_diluted_market_cap || "No fully_diluted_market_cap",
                            inline: true,
                        }, {
                            name: 'market_cap',
                            value: data.market_cap  || "No market_cap Status ",
                            inline: true,
                        }, {
                            name: 'percent_change_1h',
                            value: data.percent_change_1h || "No percent_change_1h Status",
                            inline: true,
                        }, {
                            name: "percent_change_24h",
                            value: data.percent_change_24h || "No percent_change_24h Status",
                            inline: true
                        }, {
                            name: "price",
                            value: data.price || "No price Status",
                            inline: true
                        }, {
                            name: "volume_24h",
                            value: data.volume_24h || "No volume_24h Status",
                            inline: true
                        },
                        {
                            name: "tokenName",
                            value: data.tokenName || "No tokenName Status",
                            inline: true
                        }, 
                        {
                            name: "Marketplaces Trading BTC", // New field for the array
                            value: formattedMessage || "No data available",
                            inline: false // Set to false to display on a new line
                        }
                    ],
                    footer: {
                        text: 'News Monitor - Automated Notifications',
                        icon_url: avatar_url

                    },
                    timestamp: new Date().toISOString(), // Include a timestamp
                },
            ],
        };
        return params
    }

    static buildErrorWebhookParams(err: string) {
        const params = {
            username: 'Error',
            content: "Error",  // This will mention everyone
            avatar_url: avatar_url,
            embeds: [
                {
                    title: 'Contract',
                    description: 'Up Bit Announcment Error',
                    color: 0 || '0',
                    fields: [

                        {
                            name: 'ERROR',
                            value: err || '0',
                            inline: true,
                        },
                    ],
                },
            ],
        };
        return params
    }
}