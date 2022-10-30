import express from 'express';
import { getLaunches, createLaunch, deleteLaunch } from './launches.controller.js';

const launchesRouter = express.Router();

launchesRouter.get('/', getLaunches);
launchesRouter.post('/', createLaunch)
launchesRouter.delete('/:id', deleteLaunch)

export default launchesRouter;