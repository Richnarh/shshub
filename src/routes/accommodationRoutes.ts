import express from 'express';
import { DataSource } from 'typeorm';
import { AccommodationController } from '../controller/accommodationController.js';

export const setupAccommodation = (datasource:DataSource) => {
    const router = express.Router();
    const accommodationController = new AccommodationController(datasource);

    router.post('/', accommodationController.save.bind(accommodationController));
    router.put('/', accommodationController.save.bind(accommodationController));
    router.get('/', accommodationController.getAllAccommodations.bind(accommodationController));
    router.get('/:id', accommodationController.getAccommodationById.bind(accommodationController));
    router.delete('/:id', accommodationController.deleteAccommodation.bind(accommodationController));

    return router;
}