const express = require('express');
const app = express();
const path = require('path');

const jugadorRoutes = require('./routes/jugador');
const loteriaRoutes = require('./routes/loteria');
const boletosRoutes = require('./routes/boletos');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', jugadorRoutes);
app.use('/api', loteriaRoutes);
app.use('/api', boletosRoutes);

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'home.html'));
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));