import { Sequelize } from 'sequelize-typescript';

import { combinedModels } from './combined-models';
import { SEQUELIZE_CONFIG } from 'utils/settings';

export const sequelize = new Sequelize({
  ...SEQUELIZE_CONFIG,
  dialect: 'postgres',
  models: combinedModels, // or [Player, Team],
});
