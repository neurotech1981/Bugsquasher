import { Request, Response, NextFunction } from 'express';

export const newIssue: (req: Request, res: Response) => void;
export const getAllIssues: (req: Request, res: Response) => Promise<void>;
export const updateIssueStatus: (req: Request, res: Response, next: NextFunction) => void;
export const updateDelegated: (req: Request, res: Response, next: NextFunction) => void;
export const updateIssue: (req: Request, res: Response) => void;
export const getIssueByID: (req: Request, res: Response) => Promise<void>;
export const deleteIssueByID: (req: Request, res: Response) => void;
export const addImage: (req: Request, res: Response) => Promise<void>;
export const deleteImage: (req: Request, res: Response) => void;