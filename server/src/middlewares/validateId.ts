import formatResponse from '../utils/formatResponse.js';
import isInvalidId from '../utils/isInValidId.js';

export default (req: any, res: any, next: any) => {
  const { id } = req.params;

  if (isInvalidId(id)) {
    return res.status(400).json(formatResponse(400, 'Put number id'));
  }

  res.locals.id = id;
  return next();
};