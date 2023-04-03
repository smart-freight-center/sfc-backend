import { KeyCloackClientType, TokenInput } from 'core/types';
import { validateSchema } from 'utils/helpers';

const generateTokenSchema = {
  grant_type: ['required', { in: ['client_credentials'] }],
  client_id: ['required'],
  client_secret: ['required'],
};

export class GenerateTokenUsecase {
  constructor(private readonly keycloakClient: KeyCloackClientType) {}

  async execute(input: TokenInput) {
    validateSchema(input, generateTokenSchema);

    const data = await this.keycloakClient.generateToken(
      input.client_id as string,
      input.grant_type as string,
      input.client_secret as string
    );

    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
    };
  }
}
