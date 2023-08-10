import * as fs from 'fs'
import * as path from 'path'
import archiver from 'archiver'
import { NodeSSH } from 'node-ssh';
import dotenv from 'dotenv'
import * as process from "process";
dotenv.config()

let args = process.argv.splice(2),
    isRollback = args.includes('rollback');

// 当前时间
let curTime = new Date().getTime()
// 当前时间格式化
console.log((isRollback ? '回滚' : '部署') + '时间:' + curTime);

// 设置本地 dist 文件路径
const distPath = path.resolve(process.cwd(), 'dist');

const ssh = new NodeSSH();

// SSH连接配置
const config = {
    host: process.env.HOST || '127.0.0.1',
    port: process.env.SSHPORT || 22,
    username: process.env.USERNAME || 'root',
    privateKey: process.env.SSHKEY || fs.readFileSync(process.env.KEYFILE || '/.ssh/id_rsa').toString(),
    pathUrl: '/www/wwwroot/yihuiblog.top'
};

// 检测远程文件目录是否存在
const checkIsFileExist = () =>{

}


// 本地文件上传至远程服务器
function uploadFile() {
    ssh
        .connect({
            host: config.host,
            username: config.username,
            privateKey: config.privateKey,
            port: Number(config.port),
        })
        .then(()=>{
            return ssh.execCommand('if [ ! -d "/www/wwwroot/yihuiblog.top/dist" ]; then echo "not exists"; fi');
        })
        .then(async result => {
            if (result.stdout.trim() === 'not exists') {
                // 在远程服务器上创建目录
                return await ssh.execCommand('mkdir -p /www/wwwroot/yihuiblog.top/dist');
            } else {
                console.log('目录已存在');
            }
        })
        .then(() => {
            console.log('SSH login success');
            ssh
                .putFile(
                    `${process.cwd()}/dist${curTime}.zip`,
                    `${config.pathUrl}/dist${curTime}.zip`
                )
                .then(() => {
                    console.log('The zip file is upload successful');
                    remoteFileUpdate();
                })
                .catch((err:any) => {
                    console.log('the file upload fail:', err);
                    process.exit(0);
                });
        })
        .catch((err:any) => {
            console.log('SSH conneting fail:', err);
            process.exit(0);
        });
}
//
// 远端文件更新
const remoteFileUpdate = () => {
    let cmd = isRollback
        ? `rm dist && mv dist.bak${curTime} dist`
        : `mv dist dist.bak${curTime} && unzip dist${curTime}.zip`;
    ssh
        .execCommand(cmd, {
            cwd: config.pathUrl,
        })
        .then((result:any) => {
            console.log(`The update message is: ${result.stdout}`);
            if (!result.stderr) {
                console.log('Gratefule! update success!');
                process.exit(0);
            } else {
                console.log('Something wrong:', result);
                process.exit(0);
            }
        });
};
//
// 本地文件压缩
const zipDirector = () => {
    const output = fs.createWriteStream(`${process.cwd()}/dist${curTime}.zip`);
    const archive = archiver('zip', {
        zlib: { level: 9 },
    }).on('error', (err:any) => {
        throw err;
    });
    output.on('close', (err:any) => {
        if (err) {
            console.log('something error width the zip process:', err);
            return;
        }
        uploadFile();
        console.log(`${archive.pointer()} total bytes`);
        console.log(
            'archiver has been finalized and the output file descriptor has closed.'
        );
    });
    output.on('end', () => {
        console.log('Data has been drained');
    });
    archive.pipe(output);
    archive.directory(distPath, '/dist');
    archive.finalize();
};
//
// 回滚代码
if (isRollback) {
    remoteFileUpdate();
} else {
    // 更新代码
    zipDirector();
}
//
export default {
    zipDirector
}
