const OSS = require('ali-oss');
const recursive = require('recursive-readdir');
const PUBLISH_PATH = './public';

// 从 main.yml env 中获取配置
const {
    OSS_REGION,
    OSS_BUCKET,
    OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET,
    ORIGIN,
} = process.env;

const client = new OSS({
    region: OSS_REGION,
    bucket: OSS_BUCKET,
    accessKeyId: OSS_ACCESS_KEY_ID,
    accessKeySecret: OSS_ACCESS_KEY_SECRET,
});

function getFiles() {
    return new Promise((resolve, reject) => {
        recursive(PUBLISH_PATH, (err, files) => {
            if (!err) {
                resolve(files);
            } else {
                reject(err);
            }
        });
    });
}

function upload(file) {
    return client.put(file.replace('public/', ''), `./${file}`)
        .then(res => {
            const url = `${ORIGIN}/${res.name}`
            console.log(`SYNC SUCCESS: ${url}`);
            return url;
        });
}

(async function main() {
    const files = await getFiles();
    await Promise.all(files.map(file => upload(file)));
    console.log('SYNC DONE !');
})();
