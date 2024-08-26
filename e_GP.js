const http = require('http');
const xml2js = require('xml2js');
const iconv = require('iconv-lite');
const pLimit = require('p-limit');

async function e_GP(deptIds) {
    const baseUrl = 'http://process3.gprocurement.go.th/EPROCRssFeedWeb/egpannouncerss.xml';
    const announceTypes = ['W0', 'W2', 'B0', 'D0', 'D1', 'D2', 'P0', 'W1', '15'];
    const parser = new xml2js.Parser();
    const myData = [];
    const limit = pLimit(10);  // Limit to 10 concurrent requests

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

                response.on('error', (err) => {
                    reject(err);
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    };

    const parseAndProcessData = async (response, announceType, deptId) => {
        const parsedData = await parser.parseStringPromise(response);
        const items = parsedData.rss.channel[0].item;

        if (items) {
            items.forEach(item => {
                let listData = {};
                for (const [key, value] of Object.entries(item)) {
                    if (key !== 'description' && key !== 'guid') {
                        listData[key] = value[0];
                    }
                }
                listData['announceType'] = announceType;
                listData['egpid'] = deptId;
                myData.push(listData);
            });
        }
    };

    const fetchAndParse = async (announceType, deptId) => {
        const url = `${baseUrl}?deptId=${deptId}&anounceType=${announceType}`;
        try {
            const response = await fetchData(url);
            await parseAndProcessData(response, announceType, deptId);
        } catch (error) {
            console.error(`Error fetching or parsing XML for deptId: ${deptId}, announceType: ${announceType}`, error);
        }
    };

    try {
        const tasks = [];
        for (const announceType of announceTypes) {
            for (const deptId of deptIds) {
                if (deptId !== '') {
                    tasks.push(limit(() => fetchAndParse(announceType, deptId)));
                }
            }
        }
        await Promise.all(tasks);
    } catch (error) {
        console.error('Error in processing the tasks:', error);
    }

    return JSON.stringify(myData);
}

module.exports = { e_GP };
