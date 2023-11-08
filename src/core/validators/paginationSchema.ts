import Joi from 'joi';

export const paginationSchema = Joi.object({
  page: Joi.number().integer().default(1).min(1),
  perPage: Joi.number().integer().default(10).min(1),
});
