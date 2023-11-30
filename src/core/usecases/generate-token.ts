import { KeyCloackClientType, TokenInput } from 'clients/interfaces';
import Joi from 'joi';
import { validateData } from 'utils/helpers';

const generateTokenSchema = Joi.object({
  grant_type: Joi.string().valid('password').required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export class GenerateTokenUsecase {
  constructor(private readonly keycloakClient: KeyCloackClientType) {}

  async execute(input: TokenInput) {
    const { username, password } = validateData(generateTokenSchema, input);

    const data = await this.keycloakClient.generateTokenWithPassword(
      username,
      password
    );

    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
    };
  }
}
