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

async function sync(files) {
    const success = [];
    const error = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const url = await upload(`./${file}`, file.replace('public/', ''));
            success.push(url);
        } catch (e) {
            error.push(file);
            console.error(e);
        }
    }
    return { success, error };
}

(async function main() {
    const files = await getFiles();
    let { success, error } = await sync(files);
    if (error) {
        const retry = await sync(error);
        success.push(...retry.success);
        error = retry.error;
    }
    console.log('SUCCESS\n', success);
    console.log('ERROR\n', error);
})();
