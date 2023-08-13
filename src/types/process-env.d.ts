declare namespace NodeJS {
    interface ProcessEnv {
        HOST: 'development' | 'production';
        SSH_PORT: string;
        SSH_USERNAME: string;
        SSH_PASSWORD: string;
        SSH_KEY: string;
        REMOTE_PATH: string;
        SSH_KEYFILE: string;
    }
}
