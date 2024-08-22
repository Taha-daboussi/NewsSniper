import axios from 'axios'
import { Utils } from './Utils'
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
  }

  
export class DiscordHelpers {

    static async sendWebhook(webhookUrl: string, params: Record<any, any>) {
        axios.post(webhookUrl, params, {
            headers: { 'Content-type': 'application/json' }
        }).catch(async err => {
            Utils.log('Failed to send webhook ' + err)
            await Utils.sleep(3000)
            return this.sendWebhook(webhookUrl, params)
        })
    }

  
    static buildWebhookParams(data : Root){
        const color = 0x00FF00; // Use hexadecimal color value
        const params = {
            username: 'News Monitor',
            avatar_url: 'https://media.discordapp.net/attachments/821005430020112394/1248392874802810921/kdKdGsgM_400x400.png?ex=66637ff7&is=66622e77&hm=a06e0383793cfb727738cfb0ae4fce350b28ea089ed8c104daba4e069e8d82c6&=&format=webp&quality=lossless',

            embeds: [
                {
                    title: 'New Listing Catched',
                    description: data.title,
                    color: color,
                    fields: [
                        {
                            name: 'Listed At ',
                            value: data.listed_at,
                            inline: true,
                        },{
                            name: 'First Listed At',
                            value: data.first_listed_at,
                            inline: true,
                        },{
                            name: 'Delay',
                            value: data.delay.toString(),
                            inline: true,
                        },{
                            name: 'Cache Status',
                            value: JSON.stringify(data.cacheStatus),
                            inline: true,
                        },
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
}