import axios from 'axios';

import launchesData from './launches.schema.js';
import planets from './planets.schema.js';

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log('Loading launch data...');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed')
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        })

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers
        }

        console.log(`${launch.flightNumber} ${launch.mission}`)

        await saveLaunch(launch);
    }
}

export async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'    
    });
    if (firstLaunch) {
        console.log('Launch data already loaded');
    } else {
        await populateLaunches();
    }
    
}

async function findLaunch(filter) {
    return await launchesData.findOne(filter);
}

export async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesData
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

export async function getAllLaunches(skip, limit) {
    return await launchesData.find({}, {
        '_id': 0,
        '__v': 0
    })
    .sort({
        flightNumber: 1
    })
    .skip(skip)
    .limit(limit)
}

export async function saveLaunch(launch) {
    await launchesData.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    });
}

export async function addNewLaunch(launch) {
    const planet = planets.findOne({
        keplerName: launch.target
    });

    if (!planet) {
        throw new Error('No matching planet found.')
    }

    const latestFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['SpaceX', 'NASA'],
        flightNumber: latestFlightNumber
    });

    await saveLaunch(newLaunch);
}

export async function abortLaunchById(launchId) {
    const aborted = await launchesData.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false
    })

    return aborted.modifiedCount === 1;
}
