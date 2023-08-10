import fs from "fs";
import {NodeSSH} from "node-ssh";
import process from "process";
import archiver from "archiver";
import {distPath,outPutFileName} from './config.ts'
export const removeFile = (path: string) => {
    fs.unlink(path, (err) => {
        console.log(path)
        if (err) {
            console.error(err)
            return
        }
    })
    console.log('临时文件已删除')
}

/**
 *
 */
export const checkIsFileExist = async (ssh: NodeSSH, path: string) => {
    const result = await ssh.execCommand(`if [ ! -d "${path}" ]; then echo "not exists"; fi`)
    if (result.stdout.trim() === 'not exists') {
        // 在远程服务器上创建目录
        console.log('在远程服务器上创建目录...')
        return await ssh.execCommand(`mkdir -p ${path}`);
    } else {
        console.log('目标目录已存在');
    }
}


// 文件压缩
export const zipDirector = async (callback : Function) => {
    const output = fs.createWriteStream(`${process.cwd()}/${outPutFileName}`);
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
        callback();
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
    await archive.finalize();
}
