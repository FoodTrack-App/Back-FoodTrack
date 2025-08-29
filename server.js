
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send(`
        <h1>Hola desde Node.js + Express</h1>
        <h2>Equipo: 5</h2>
        <h3>Proyecto: Restaurante App</h3>
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
