import joi from 'joi';

export const unshareSchema = joi.object({
  month: joi.number().integer().greater(0).less(13).required(),
  year: joi.number().required(),
  companyId: joi.string().required(),
});
