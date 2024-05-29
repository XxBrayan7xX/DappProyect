const express = require('express');
const router = express.Router();
const boletoController = require('../controllers/boletos');

router.post('/boleto', async (req, res) => {
    const { denominacion, jugadorId, loteriaId } = req.body;

    try {
        await boletoController.addBoleto(denominacion, jugadorId, loteriaId);
        res.status(201).send("Boleto generado.");
    } catch (error) {
        console.error("Error al crear el boleto:", error);
        res.status(500).send("Error al crear el boleto.");
    }
});

router.get('/boleto', async (req, res) => {
    try {
        const boletos = await boletoController.getAllBoletos();
        res.json(boletos);
    } catch (error) {
        console.error("Error al obtener los boletos:", error);
        res.status(500).send("Error al obtener los boletos.");
    }
});

module.exports = router;