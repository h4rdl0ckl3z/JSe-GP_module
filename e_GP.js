const http = require('http');
const xml2js = require('xml2js');
const iconv = require('iconv-lite');

async function e_GP(deptIds) {
    const baseUrl = 'http://process3.gprocurement.go.th/EPROCRssFeedWeb/egpannouncerss.xml';
    const announceTypes = ['W0', 'W2', 'B0', 'D0', 'D1', 'D2', 'P0', 'W1', '15'];

    const myData = [];

    const fetchData = (url) => {
        return new Promise((resolve, reject) => {
            http.get(url, (response) => {
                let chunks = [];

                response.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                response.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const decodedContent = iconv.decode(buffer, 'win874');
                    resolve(decodedContent);
                });

            }).on('error', (err) => {
                reject(err);
            });
        });
    };

    try {
        for (const announceType of announceTypes) {
            for (const deptId of deptIds) {
                const url = `${baseUrl}?deptId=${deptId}&anounceType=${announceType}`;
                const response = await fetchData(url);
                const parser = new xml2js.Parser();

                const parsedData = await new Promise((resolve, reject) => {
                    parser.parseString(response, (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });

                const items = parsedData.rss.channel[0].item;
                if (items != undefined) {
                    for (const item of items) {
                        const listData = {}; // Reset listData for each item
                        for (const [key, value] of Object.entries(item)) {
                            if (key !== 'description' && key !== 'guid') {
                                listData[key] = value[0];
                            }
                        }
                        listData['announceType'] = announceType;
                        listData['egpid'] = deptId;
                        myData.push(listData); // Push the object after it is complete
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error fetching or parsing XML:', error);
    }
    return myData;
}

module.exports = { e_GP };