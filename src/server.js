require('dotenv').config({ path: 'variaveis.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes'); // Certifique-se de que o arquivo `routes/index.js` está configurado corretamente

const server = express();
server.use(cors());
server.use(bodyParser.json()); // Suporte para requisições JSON
server.use(bodyParser.urlencoded({ extended: false }));

server.use('/api', routes);

server.listen(process.env.PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${process.env.PORT}`);
});
