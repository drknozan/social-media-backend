import { NextFunction, Request, Response } from 'express';
import * as postService from '../services/post.service';

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  const { communityName, title, content } = req.body;

  try {
    const post = await postService.createPost(communityName, title, content, req.user?.id);

    res.send(post);
  } catch (error) {
    next(error);
  }
};

export { createPost };
