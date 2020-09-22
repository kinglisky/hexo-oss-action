const OSS = require('ali-oss');
const CDN_URL = 'https://ky-test-blog.oss-cn-beijing.aliyuncs.com';

const {
    OSS_REGION,
    OSS_BUCKET,
    OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET,
} = process.env;

console.log('OSS_REGION', OSS_REGION);
console.log('OSS_BUCKET', OSS_BUCKET);
console.log('OSS_ACCESS_KEY_ID', OSS_ACCESS_KEY_ID);
console.log('OSS_ACCESS_KEY_SECRET', OSS_ACCESS_KEY_SECRET);

const client = new OSS({
    region: OSS_REGION,
    bucket: OSS_BUCKET,
    accessKeyId: OSS_ACCESS_KEY_ID,
    accessKeySecret: OSS_ACCESS_KEY_SECRET,
});

async function upload(file, path) {
    const res = await client.put(path, file);
    const url = `${CDN_URL}/${res.name}`
    console.log(`SYNC SUCCESS: ${url}`);
    return url;
}

(async function main() {
    const files = [
        'logo.jpeg',
    ];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await upload(`./${file}`, `image/${file}`);
    }
})();