# ssh-publish

基于ssh进行项目上传和部署的小脚本。适用于小型项目的发布，特别是一些没有CI/CD的项目，而直接部署在远程VPS上

## 安装

```bash
npm install ssh-publish -g
```

## 使用
    
```bash
s2p publish
```
**可选入参:**

`-h`: 主机地址

`-p`: ssh端口

`-u`: ssh用户名

`-w`: ssh密码

`-k`: ssh密钥内容 | ssh密钥文件路径

`-r`: 远程路径

`-l`: 本地路径

## 配置
项目首选使用`.env`文件进行配置

```.env
HOST=127.0.0.1
SSH_PORT=22
SSH_USER=root
SSH_PASSWORD=123456
SSH_KEY=/Users/xxx/.ssh/id_rsa || 密钥内容
REMOTE_PATH=/root/www
SSH_KEYFILE=/Users/xxx/.ssh/id_rsa || 密钥文件
LOCAL_PATH=/dist
PROJECT_NAME=project || 项目名称
```

亦或使用json文件进行配置
```json
{
    "HOST": "",
    "SSH_PORT": 22,
    "SSH_USERNAME": "root",
    "SSH_KEY": "",
    "REMOTE_PATH": "/home/www/wwwroot/mcnavi.cn",
    "SSH_KEYFILE": "/",
    "LOCAL_PATH": "/dist",
    "PROJECT_NAME": "project"
}
```

亦或使用cjs文件进行配置

```js
module.exports = {
    HOST: '127.0.0.1',
    SSH_PORT: 22,
    SSH_USERNAME: 'root',
    SSH_KEY: `-----BEGIN OPENSSH PRIVATE KEY-----
-----END OPENSSH PRIVATE KEY-----`,
    REMOTE_PATH: '/home/www/wwwroot/mcnavi.cn',
    SSH_KEYFILE: '/',
    LOCAL_PATH: '/dist',
    PROJECT_NAME: 'project'
};
```
