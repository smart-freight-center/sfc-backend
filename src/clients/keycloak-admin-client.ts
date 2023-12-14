import {
    KEYCLOAK_HOST,
    KEYCLOAK_USERNAME,
    KEYCLOAK_PASSWORD,
    KEYCLOAK_REALM
} from 'utils/settings';
import KcAdminClient from '@keycloak/keycloak-admin-client';

export class KeycloakAdmin{
    static instance: KeycloakAdmin;
    initialized = false;
    adminClient: KcAdminClient;
    publicKey;

    static getInstance(): KeycloakAdmin  {
        if (!KeycloakAdmin.instance) {
            KeycloakAdmin.instance = new KeycloakAdmin()
        }
        return KeycloakAdmin.instance
    }

    constructor () {
        this.initKeycloakPublicKey()
    }

    async initialize() {
        if (!this.initialized) {
            this.adminClient = new KcAdminClient({
                baseUrl: `http://${KEYCLOAK_HOST}`,
                realmName: KEYCLOAK_REALM,
            });

            await this.adminClient.auth({
                username: KEYCLOAK_USERNAME,
                password: KEYCLOAK_PASSWORD,
                grantType: 'password',
                clientId: 'admin-cli'
            });

            this.initialized = true;
        }
    }

    async initKeycloakPublicKey() {
        await this.initialize();

        if (!this.publicKey) {
            const realmKeys = await this.adminClient.realms.getKeys({ realm: KEYCLOAK_REALM });
            const RS256Keys = realmKeys.keys?.find((key) => key.algorithm == "RS256");
            this.publicKey = RS256Keys?.publicKey;
        }

        return this.publicKey;
    }

    getPublicKey() {
        return this.publicKey;
    }
}
