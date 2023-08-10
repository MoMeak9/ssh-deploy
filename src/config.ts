import path from "path";
import dotenv from 'dotenv'
dotenv.config()

// 当前时间
export const curTime = new Date().getTime()

// 设置本地 dist 文件路径
export const distPath = path.resolve(process.cwd(), 'dist');
export const outPutFileName = `dist${curTime}.zip`

export const sshConfig = {
    host: process.env.HOST || '127.0.0.1',
    port: process.env.SSHPORT || 22,
    username: process.env.USERNAME || 'root',
    privateKey: process.env.SSHKEY,
    pathUrl: process.env.REMOTEPATH
}
