const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const { db } = require('./firebase');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

app.use(cors());
app.use(bodyParser.json());

// Webhook de verificação
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook para receber mensagens
app.post('/webhook', async (req, res) => {
  const body = req.body;
  console.log('Mensagem recebida:', JSON.stringify(body, null, 2));

  if (body.object === 'whatsapp_business_account') {
    for (const entry of body.entry) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const messages = value.messages || [];
        const contacts = value.contacts || [];

        if (messages.length > 0) {
          const message = messages[0];
          const contact = contacts[0] || {};
          const sender = message.from;
          const text = message.text?.body || '';
          const timestamp = parseInt(message.timestamp) * 1000;

          try {
            await db.collection('conversas').doc(sender).collection('mensagens').add({
              nome: contact.profile?.name || sender,
              mensagem: text,
              timestamp: new Date(timestamp),
              tipo: 'recebida',
            });

            // Atualiza último contato
            await db.collection('conversas').doc(sender).set({
              nome: contact.profile?.name || sender,
              ultimaMensagem: text,
              timestamp: new Date(timestamp),
              wa_id: sender,
            }, { merge: true });

            console.log(`Mensagem de ${sender} salva no Firebase`);
          } catch (err) {
            console.error('Erro ao salvar no Firebase:', err);
          }
        }
      }
    }
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});