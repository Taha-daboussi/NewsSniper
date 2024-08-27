const axios = require('axios')
import { Utils } from './Utils'
import { HttpsProxyAgent } from 'https-proxy-agent';
import { Proxy } from '../HttpClient/Proxy';
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


    static buildWebhookParams(data: Root, options: Record<any, any> = { Mode: "Frontend", Website: "UpBit" }) {
        const color = 0x00FF00; // Use hexadecimal color value
        const params = {
            username: 'News Monitor',
            avatar_url: 'https://media.discordapp.net/attachments/821005430020112394/1248392874802810921/kdKdGsgM_400x400.png?ex=66637ff7&is=66622e77&hm=a06e0383793cfb727738cfb0ae4fce350b28ea089ed8c104daba4e069e8d82c6&=&format=webp&quality=lossless',
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
                            value: data.delay.toString(),
                            inline: true,
                        }, {
                            name: 'Cache Status',
                            value: JSON.stringify(data.cacheStatus[0]),
                            inline: true,
                        }, {
                            name: "isUsingBypass",
                            value: (!data.skipBypass).toString(),
                            inline: true
                        }, {
                            name: "Mode",
                            value: options.Mode,
                            inline: true
                        }, {
                            name: "Website",
                            value: options.Website,
                            inline: true
                        }
                    ],
                    footer: {
                        text: 'News Monitor',
                        icon_url: 'https://media.discordapp.net/attachments/821005430020112394/1248392874802810921/kdKdGsgM_400x400.png?ex=66637ff7&is=66622e77&hm=a06e0383793cfb727738cfb0ae4fce350b28ea089ed8c104daba4e069e8d82c6&=&format=webp&quality=lossless'

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
            avatar_url: 'https://media.discordapp.net/attachments/821005392418308147/1053588940621348914/Capture.PNG',
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