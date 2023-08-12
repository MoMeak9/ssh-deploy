declare namespace NodeJS {
    interface ProcessEnv {
        HOST: 'development' | 'production';
        SSHPORT: string
        USERNAME: string
        PASSWORD: string
        SSHKEY: string
        REMOTEPATH: string
        SSH_KEYFILE: string
    }
}
