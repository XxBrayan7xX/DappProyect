const express = require('express');
const router = express.Router();
const loteriaController = require('../controllers/loteria');

router.post('/loteria', async (req, res) => {
    const { nombre, nombreCreador } = req.body;

    try {
        await loteriaController.addLoteria(nombre, nombreCreador);
        res.status(201).send("Loteria creada.");
    } catch (error) {
        console.error("Error al crear la loteria:", error);
        res.status(500).send("Error al crear la loteria.");
    }
});

router.put('/loteria', async (req, res) => {
    const { id } = req.body;
    const { nombre } = req.body;

    try {
        await loteriaController.changeNombre(id, nombre);
        res.send("Nombre de la loteria modificado.");
    } catch (error) {
        console.error("Error al modificar el nombre de la loteria:", error);
        res.status(500).send("Error al modificar el nombre de la loteria.");
    }
});

router.get('/loteria', async (req, res) => {
    try {
        const loterias = await loteriaController.getAllLoterias();
        res.json(loterias);
    } catch (error) {
        console.error("Error al obtener las loterias:", error);
        res.status(500).send("Error al obtener las loterias.");
    }
});

module.exports = router;