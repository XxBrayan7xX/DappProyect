const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugador');

router.post('/jugador', async (req, res) => {
    const { nombre, edad } = req.body;

    try {
        await jugadorController.addJugador(nombre, edad);
        res.status(201).send("Jugador creado.");
    } catch (error) {
        console.error("Error al crear el jugador:", error);
        res.status(500).send("Error al crear el jugador.");
    }
});

router.get('/jugador', async (req, res) => {
    try {
        const jugadores = await jugadorController.getAllJugadores();
        res.json(jugadores);
    } catch (error) {
        console.error("Error al obtener los jugadores:", error);
        res.status(500).send("Error al obtener los jugadores.");
    }
});

module.exports = router;