import { getAllPlanets } from "../../models/planets.model.js";

export async function getPlanets(req, res) {
    return res.status(200).json(await getAllPlanets());
}
