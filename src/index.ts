import { NodeSSH } from 'node-ssh';
import { checkIsFileExist, removeFile, zipDirector } from './fileOperation.ts';
import { outPutFileName, curTime } from './config.ts';
import { config, getArgs } from './args.ts';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
    .command(
        'publish',
        '发布服务',
        (yargs) => {
            return yargs
                .option('host', {
                    alias: 'h',
                    describe: '远程服务器地址',
                })
                .option('port', {
                    alias: 'p',
                    describe: '远程服务器端口号',
                })
                .option('username', {
                    alias: 'u',
                    describe: '用户名',
                })
                .option('loginWay', {
                    alias: 'l',
                    describe: '登入方式',
                    default: '密钥 key',
                })
                .option('password', {
                    alias: 'w',
                    describe: '远程服务器密码',
                })
                .option('privateKey', {
                    alias: 'k',
                    describe: '远程服务器密钥 | 密钥文件地址',
                })
                .option('pathUrl', {
                    alias: 'r',
                    describe: '远程服务器地址（根目录）',
                });
        },
        async (argv) => {
            await getArgs(argv as any);
            // 更新代码
            await zipDirector(uploadFile);
        },
    )
    .showHelp('log')
    .help('h')
    .alias('h', 'help').argv;

const ssh = new NodeSSH();

// 本地文件上传至远程服务器
const uploadFile = () => {
    ssh.connect({
        host: config?.host,
        username: config?.username,
        privateKey: config?.privateKey,
        port: Number(config?.port),
    })
        .then(async () => {
            await checkIsFileExist(ssh, `${config?.pathUrl}/dist`);
        })
        .then(() => {
            console.log('SSH login success');
            ssh.putFile(
                `${process.cwd()}/${outPutFileName}`,
                `${config?.pathUrl}/${outPutFileName}`,
            )
                .then(() => {
                    console.log('压缩文件上传成功');
                    remoteFileUpdate();
                })
                .catch((err: any) => {
                    console.log('文件上传失败：', err);
                    process.exit(0);
                });
        })
        .catch((err: any) => {
            console.log('SSH 连接失败：', err);
            process.exit(0);
        });
};
//
// 远端文件更新
const remoteFileUpdate = () => {
    const cmd = `mv dist dist.bak${curTime} && unzip ${outPutFileName}`;
    ssh.execCommand(cmd, {
        cwd: config?.pathUrl,
    }).then((result: any) => {
        console.log(`The update message is: ${result.stdout}`);
        removeFile(`${process.cwd()}/${outPutFileName}`);
        if (!result.stderr) {
            console.log('Gratefule! update success!');
            process.exit(0);
        } else {
            console.log('Something wrong:', result);
            process.exit(0);
        }
    });
};
