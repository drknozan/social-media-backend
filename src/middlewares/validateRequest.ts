import { Request, Response, NextFunction } from 'express';
import { AnySchema } from 'yup';

const validateRequest = (schema: AnySchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
};

export default validateRequest;
