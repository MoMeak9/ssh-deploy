declare namespace NodeJS {
    interface ProcessEnv {
        HOST: string;
        SSH_PORT: string;
        SSH_USERNAME: string;
        SSH_PASSWORD: string;
        SSH_KEY: string;
        REMOTE_PATH: string;
        SSH_KEYFILE: string;
        LOCAL_PATH: string;
    }
}
