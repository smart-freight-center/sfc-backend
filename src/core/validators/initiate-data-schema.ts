import joi from 'joi';

export const initiateDataTransferByMonth = joi.object({
  month: joi.number().integer().greater(0).less(13).required(),
  year: joi.number().required(),
});
