import fs from 'fs';
import { NodeSSH } from 'node-ssh';
import process from 'process';
import archiver from 'archiver';
import { distPath, outPutFileName } from './config.ts';
import { error, success } from './log.ts';
import ora from 'ora';

export const removeFile = (path: string) => {
    fs.unlink(path, (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
};

/**
 * 检查远程服务器上的目录是否存在
 */
export const checkIsFileExist = async (ssh: NodeSSH, path: string) => {
    const result = await ssh.execCommand(
        `if [ ! -d "${path}" ]; then echo "not exists"; fi`,
    );
    if (result.stdout.trim() === 'not exists') {
        // 在远程服务器上创建目录
        console.log('在远程服务器上创建目录...');
        return await ssh.execCommand(`mkdir -p ${path}`);
    } else {
        console.log('目标目录已存在');
    }
};

// 文件压缩
export const zipDirector = async (callback: any) => {
    const spinner = ora('Loading').start();
    spinner.color = 'yellow';
    spinner.text = '正在压缩文件...\n';
    const output = fs.createWriteStream(`${process.cwd()}/${outPutFileName}`);
    const archive = archiver('zip', {
        zlib: { level: 9 },
    }).on('error', (err: any) => {
        throw err;
    });
    output.on('close', (err: any) => {
        if (err) {
            console.log(error('出了点问题'), err);
            return;
        }
        callback();
        console.log(`${(archive.pointer() / 1024).toFixed(2)} KB`);
        console.log(success(`${'='.repeat(10)}压缩完成${'='.repeat(10)}`));
    });
    output.on('end', () => {
        console.log('数据已完成排出');
    });
    archive.pipe(output);
    archive.directory(distPath, '/dist');
    await archive.finalize();
    spinner.stop();
};
