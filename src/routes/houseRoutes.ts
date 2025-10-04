import express from 'express';
import { DataSource } from 'typeorm';
import { HouseController } from '../controller/houseController.js';

export const setupHouse = (datasource:DataSource) => {
    const router = express.Router();
    const houseController = new HouseController(datasource);

    router.post('/', houseController.save.bind(houseController));
    router.put('/', houseController.save.bind(houseController));
    router.get('/', houseController.getAllHouses.bind(houseController));
    router.get('/:id', houseController.getHouseById.bind(houseController));
    router.delete('/:id', houseController.deleteHouse.bind(houseController));

    return router;
}