declare namespace NodeJS {
    interface ProcessEnv {
        HOST: 'development' | 'production';
        SSHPORT: string
        SSHUSERNAME: string
        PASSWORD: string
        SSHKEY: string
        REMOTEPATH: string
        SSH_KEYFILE: string
    }
}
