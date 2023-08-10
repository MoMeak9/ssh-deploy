import * as fs from 'fs'
import { NodeSSH } from 'node-ssh';
import dotenv from 'dotenv'
import * as process from "process";
import {checkIsFileExist, removeFile, zipDirector} from './fileOperation.ts'
import {outPutFileName,curTime} from './config.ts'
dotenv.config()

let args = process.argv.splice(2),
    isRollback = args.includes('rollback');


const ssh = new NodeSSH();

// SSH连接配置
const config = {
    host: process.env.HOST || '127.0.0.1',
    port: process.env.SSHPORT || 22,
    username: process.env.USERNAME || 'root',
    privateKey: process.env.SSHKEY || fs.readFileSync(process.env.KEYFILE || '/.ssh/id_rsa').toString(),
    pathUrl: process.env.REMOTEPATH
};

// 本地文件上传至远程服务器
const uploadFile = () => {
    ssh
        .connect({
            host: config.host,
            username: config.username,
            privateKey: config.privateKey,
            port: Number(config.port),
        })
        .then(async ()=>{
            await checkIsFileExist(ssh,'/www/wwwroot/yihuiblog.top/dist')
        })
        .then(() => {
            console.log('SSH login success');
            ssh
                .putFile(
                    `${process.cwd()}/${outPutFileName}`,
                    `${config.pathUrl}/${outPutFileName}`
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
        : `mv dist dist.bak${curTime} && unzip ${outPutFileName}`;
    ssh
        .execCommand(cmd, {
            cwd: config.pathUrl,
        })
        .then((result:any) => {
            console.log(`The update message is: ${result.stdout}`);
            removeFile(`${process.cwd()}/${outPutFileName}`)
            if (!result.stderr) {
                console.log('Gratefule! update success!');
                process.exit(0);
            } else {
                console.log('Something wrong:', result);
                process.exit(0);
            }
        });
};


// 回滚代码
if (isRollback) {
    remoteFileUpdate();
} else {
    // 更新代码
    zipDirector(uploadFile);
}
//
export default {
    zipDirector
}
