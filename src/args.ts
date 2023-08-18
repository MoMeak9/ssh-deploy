import inquirer from 'inquirer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import url from 'url';
import process from 'process';

dotenv.config();

export interface IAns {
    host: string;
    port: number | string;
    username: string;
    loginWay: string;
    password?: string;
    privateKey?: string;
    pathUrl: string;
    localPath: string;
    publishWay: '静态文件' | 'pm2';
    projectName: string;
}

const prompt = inquirer.createPromptModule();

export let config: IAns | undefined;

export const getArgs = async (argv: IAns) => {
    try {
        const ans = await prompt([
            {
                type: 'list',
                name: 'publishWay',
                message: '发布方式？',
                choices: ['静态文件', 'pm2'],
                validate: (input: string) => {
                    if (!input) {
                        return '发布方式不能为空';
                    }
                    return true;
                },
                default: '静态文件',
            },
            {
                type: 'input',
                name: 'host',
                message: '远程服务器地址？',
                default: argv.host || process.env.HOST || '127.0.0.1',
            },
            {
                type: 'input',
                name: 'port',
                message: '远程服务器端口号？',
                default: argv.port || process.env.SSH_PORT || 22,
            },
            {
                type: 'input',
                name: 'username',
                message: '用户名？',
                default: argv.username || process.env.SSH_USERNAME || 'root',
            },
            {
                type: 'list',
                name: 'loginWay',
                message: '登入方式？',
                choices: ['密码 password', '密钥 key'],
                default: '密钥 key',
            },
            {
                type: 'password',
                name: 'password',
                message: '远程服务器密码？',
                mask: '*',
                default: argv.password || process.env.SSH_PASSWORD || '',
                when: (answers: IAns) => answers.loginWay === '密码 password',
            },
            {
                type: 'input',
                name: 'privateKey',
                message: '远程服务器密钥 | 密钥文件地址？',
                default:
                    argv.privateKey ||
                    process.env.SSH_KEY ||
                    process.env.SSH_KEYFILE ||
                    '',
                when: (answers: IAns) => answers.loginWay === '密钥 key',
            },
            {
                type: 'input',
                name: 'pathUrl',
                message: '远程服务器地址（根目录）？',
                default: argv.pathUrl || process.env.REMOTE_PATH || '',
            },
            {
                type: 'input',
                name: 'localPath',
                message: '本地文件路径？',
                default: argv.localPath || process.env.LOCAL_PATH || '/dist',
            },
            {
                type: 'input',
                name: 'projectName',
                message: 'pm2项目名称？',
                default: argv.projectName || process.env.PROJECT_NAME || '',
                when: (answers: IAns) => answers.publishWay === 'pm2',
            },
        ]);
        if (!ans.password && !ans.privateKey) {
            new Error('无效登入信息，缺少有效的密码 | 密钥');
        }
        // 检查密钥地址是不文件是路径
        const pathRegex = /^(\/[\w-]+)+$/;
        if (ans.privateKey && pathRegex.test(ans.privateKey)) {
            ans.privateKey = fs
                .readFileSync(
                    path.resolve(process.cwd(), ans.privateKey),
                    'utf-8',
                )
                .toString();
        }

        // config 文件有最高优先级
        let fileConfig: IAns | undefined;
        if (fs.existsSync(path.resolve(process.cwd(), 's2p.config.json'))) {
            const file = fs.readFileSync(
                path.resolve(process.cwd(), 's2p.config.json'),
                'utf-8',
            );
            fileConfig = JSON.parse(file);
        } else if (
            fs.existsSync(path.resolve(process.cwd(), 's2p.config.cjs'))
        ) {
            fileConfig = await import(
                url.pathToFileURL(path.resolve(process.cwd(), 's2p.config.cjs'))
                    .href
            );
        }

        config = {
            ...ans,
            ...(fileConfig || {}),
        };
    } catch (e) {
        console.error(e);
    }
};
