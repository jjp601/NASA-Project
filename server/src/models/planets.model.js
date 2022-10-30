import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { parse } from "csv-parse";

import planets from './planets.schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED' 
    && planet['koi_insol'] > 0.36 
    && planet['koi_insol'] < 1.11 
    && planet['koi_prad'] < 1.6;
}

export function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true,
        }))
        .on('data', async (data) => {
            if (isHabitablePlanet(data)) {
                savePlanet(data);
            }
            
        })
        .on('error', (error) => {
            console.log(error);
            reject(error);
        })
        .on('end', async () => {
            const numberOfPlanetsFound = (await getAllPlanets()).length;
            console.log(`${numberOfPlanetsFound} habitable planets found!`);
            resolve();
        });
    });
    
}

export async function getAllPlanets() {
    return await planets.find({}, {
        '_id': 0,
        '__v': 0
    });
}

export async function savePlanet(planetData) {
    try {
        await planets.updateOne({
            keplerName: planetData.kepler_name
        }, {
            keplerName: planetData.kepler_name
        }, {
            upsert: true
        });
    } catch (error) {
        console.error(`Could not save planet. ${error}`);
    }
    
};
