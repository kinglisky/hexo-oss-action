const OSS = require('ali-oss');
const recursive = require('recursive-readdir');
const CDN_URL = 'https://ky-test-blog.oss-cn-beijing.aliyuncs.com';
const PUBLISH_PATH = './public';

const {
    OSS_REGION,
    OSS_BUCKET,
    OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET,
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

async function upload(file, path) {
    const res = await client.put(path, file);
    const url = `${CDN_URL}/${res.name}`
    console.log(`SYNC SUCCESS: ${url}`);
    return url;
}

(async function main() {
    const files = await getFiles();
    const success = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await upload(`./${file}`, file.replace('public/', ''));
        success.push(url);
    }
    console.log('DONE\n', success);
})();