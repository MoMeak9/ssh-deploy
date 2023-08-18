import { NodeSSH } from 'node-ssh';
import yargs from 'yargs';
import ora from 'ora';

import { checkIsFileExist, removeFile, zipDirector } from './fileOperation.ts';
import { outPutFileName, curTime } from './config.ts';
import { config, getArgs } from './args.ts';
import { hideBin } from 'yargs/helpers';
import { success, warning, error } from './log.ts';
import process from 'process';

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
                })
                .option('localPath', {
                    alias: 'f',
                    describe: '本地文件路径',
                })
                .option('publishWay', {
                    alias: 't',
                })
                .option('projectName', {
                    alias: 'n',
                    describe: '项目名称',
                });
        },
        async (argv) => {
            await getArgs(argv as any);
            // 更新代码
            await zipDirector(uploadFile);
        },
    )
    .command(
        '*',
        '默认命令',
        () => {},
        () => {
            console.log(warning('请输入正确的命令'));
            yargs.showHelp();
            process.exit(0);
        },
    )
    .parse();

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
            await checkIsFileExist(
                ssh,
                `${config?.pathUrl}${config?.localPath}`,
            );
        })
        .then(() => {
            const spinner = ora('Loading').start();
            spinner.color = 'yellow';
            spinner.text = 'SSH 连接成功，正在上传文件...\n';
            ssh.putFile(
                `${process.cwd()}/${outPutFileName}`,
                `${config?.pathUrl}/${outPutFileName}`,
            )
                .then(() => {
                    console.log(success('压缩文件上传成功'));
                    spinner.stop();
                    remoteFileUpdate();
                })
                .catch((err: any) => {
                    console.log(error('文件上传失败：'), err);
                    spinner.stop();
                    process.exit(0);
                });
        })
        .catch((err: any) => {
            console.log(error('SSH 连接失败：'), err);
            process.exit(0);
        });
};
//
// 远端文件更新
const remoteFileUpdate = async () => {
    const dist = config?.localPath.startsWith('/')
        ? config?.localPath.substring(1)
        : config?.localPath;
    const cmd = `mv ${dist} ${dist}.bak${curTime} && unzip ${outPutFileName}`;
    // 更新代码
    try {
        const result = await ssh.execCommand(cmd, {
            cwd: config?.pathUrl,
        });
        console.log(success(`更新信息: \n${result.stdout}`));
        removeFile(`${process.cwd()}/${outPutFileName}`);
        if (!result.stderr) {
            console.log(success('更新代码成功'));
        } else {
            console.log(error('更新代码失败：'), result.stderr);
        }
        // 重启服务
        if (config?.publishWay === '静态文件') {
            return;
        }
        const restart = await ssh.execCommand(
            `ls -l ${config?.pathUrl}\npm2 restart ${config?.projectName}\n`,
            {
                cwd: config?.pathUrl,
            },
        );
        console.log('远程命令输出：\n' + restart.stdout);
        process.exit(0);
    } catch (e) {
        console.log(error('更新代码失败：'), e);
    }
};
