import path from "path";
import process from "process";

// 当前时间
export const curTime = new Date().getTime()

// 设置本地 dist 文件路径
export const distPath = path.resolve(process.cwd(), 'dist');
export const outPutFileName = `dist${curTime}.zip`
