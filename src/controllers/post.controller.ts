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

const getPost = async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  try {
    const post = await postService.getPost(slug);

    res.send(post);
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  try {
    const post = await postService.deletePost(slug, req.user?.id);

    res.send(post);
  } catch (error) {
    next(error);
  }
};

const upvotePost = async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  try {
    const post = await postService.upvotePost(slug, req.user?.id);

    res.send(post);
  } catch (error) {
    next(error);
  }
};

const downvotePost = async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  try {
    const post = await postService.downvotePost(slug, req.user?.id);

    res.send(post);
  } catch (error) {
    next(error);
  }
};

const createComment = async (req: Request, res: Response, next: NextFunction) => {
  const { content } = req.body;
  const { slug } = req.params;

  try {
    const comment = await postService.createComment(content, slug, req.user?.id);

    res.send(comment);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  const { commentId } = req.params;

  try {
    const comment = await postService.deleteComment(commentId, req.user?.id);

    res.send(comment);
  } catch (error) {
    next(error);
  }
};

export { createPost, getPost, deletePost, upvotePost, downvotePost, createComment, deleteComment };
