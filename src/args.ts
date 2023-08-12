import inquirer from 'inquirer'
import dotenv from 'dotenv'

dotenv.config()

import yargs from 'yargs/yargs'
import {hideBin} from 'yargs/helpers'


interface IAns {
    host: string,
    port: number | string
    username: string
    loginWay: string
    password?: string
    privateKey?: string
    pathUrl: string
}

const prompt = inquirer.createPromptModule();


const argv = yargs(hideBin(process.argv))
    .command('serve', 'start the server', (yargs) => {
        return yargs
            .positional('port', {
                describe: 'port to bind on',
                default: 5000
            })
    }, (argv) => {
        if (argv.verbose) console.info(`start server on :${argv.port}`)
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging'
    })
    .parse()

console.log(argv)
export const getArgs = async () => {
    try {
        const ans = await prompt([
            {
                type: 'input',
                name: 'host',
                message: '远程服务器地址？',
                default: process.env.HOST || '127.0.0.1'
            },
            {
                type: 'input',
                name: 'port',
                message: '远程服务器端口号？',
                default: process.env.SSHPORT || 22
            },
            {
                type: 'input',
                name: 'username',
                message: '用户名？',
                default: process.env.USERNAME || 'root'
            },
            {
                type: 'list',
                name: 'loginWay',
                message: '登入方式？',
                choices: ['密码 password', '密钥 key'],
                default: '密钥 key'
            },
            {
                type: 'password',
                name: 'password',
                message: '远程服务器密码？',
                mask: '*',
                default: process.env.PASSWORD || '',
                when: (answers: IAns) => answers.loginWay === '密码 password'
            },
            {
                type: 'input',
                name: 'privateKey',
                message: '远程服务器密钥 | 密钥文件地址？',
                default: process.env.SSHKEY || process.env.SSH_KEYFILE || '',
                when: (answers: IAns) => answers.loginWay === '密钥 key'
            },
            {
                type: 'input',
                name: 'pathUrl',
                message: '远程服务器地址（根目录）？',
                default: process.env.REMOTEPATH || '',
            },
        ])
        if (!ans.password && !ans.privateKey) {
            new Error('无效登入信息，缺少有效的密码 | 密钥')
        }
        return ans
    } catch (e) {
        console.error(e)
    }
}

getArgs()
