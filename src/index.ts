import { NodeSSH } from 'node-ssh';
import {checkIsFileExist, removeFile, zipDirector} from './fileOperation.ts'
import {outPutFileName,curTime} from './config.ts'
import {getArgs} from "./args.ts";

let args = process.argv.splice(2),
    isRollback = args.includes('rollback');


const ssh = new NodeSSH();
const config = {} as any

// 本地文件上传至远程服务器
const uploadFile = () => {
    ssh
        .connect({
            host: config?.host,
            username: config?.username,
            privateKey: config?.privateKey,
            port: Number(config?.port),
        })
        .then(async ()=>{
            await checkIsFileExist(ssh,`${config?.pathUrl}/dist`)
        })
        .then(() => {
            console.log('SSH login success');
            ssh
                .putFile(
                    `${process.cwd()}/${outPutFileName}`,
                    `${config?.pathUrl}/${outPutFileName}`
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
            cwd: config?.pathUrl,
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
