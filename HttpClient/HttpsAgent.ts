import * as http from 'http';

export class HttpsAgent {
    static sendPostRequest(payload: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: '127.0.0.1',
                port: 8090 ,
                path: '/api/forward',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'my-auth-key-1',
                },
            };
            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        if (data.includes('<!DOCTYPE ')) {
                            reject('Rate Limited  By Cloudfare');
                        }
                        try {
                            const myParseData = JSON.parse(data);
                            myParseData.body = JSON.parse(myParseData.body);
                            resolve(myParseData);
                        } catch (e) {
                            if (
                                data.includes('An existing connection was forcibly')
                            ) {
                                data =
                                    'An existing connection was forcibly closed by the remote host . Trying Again';
                                reject(data);
                            } else {
                                const myParseData = JSON.parse(data);
                                resolve(myParseData);
                            }
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(JSON.stringify(payload));
            req.end();
        });
    }
}
