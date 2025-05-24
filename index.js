const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Servidor CRM Clinica rodando...');
});

// Webhook GET (validação do Meta)
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    console.log('Webhook verificado!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook POST (recebimento de mensagens)
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object) {
    console.log('Mensagem recebida:', JSON.stringify(body, null, 2));
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend escutando na porta ${PORT}`);
});
