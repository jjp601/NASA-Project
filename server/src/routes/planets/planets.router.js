import express from 'express';

import { getPlanets } from './planets.controller.js';

const planetsRouter = express.Router();

planetsRouter.get('/', getPlanets);

export default planetsRouter;