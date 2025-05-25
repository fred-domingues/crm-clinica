const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let conversations = {}; // { contactId: { name, messages: [] } }

app.post('/webhook', (req, res) => {
  const body = req.body;
  console.log('Mensagem recebida:', JSON.stringify(body, null, 2));

  if (body.object) {
    body.entry?.forEach(entry => {
      entry.changes?.forEach(change => {
        const msg = change.value.messages?.[0];
        const contact = change.value.contacts?.[0];

        if (msg && contact) {
          const id = contact.wa_id;
          const name = contact.profile?.name || id;

          if (!conversations[id]) {
            conversations[id] = {
              name,
              messages: []
            };
          }

          conversations[id].messages.push({
            from: msg.from,
            body: msg.text?.body || '',
            timestamp: msg.timestamp
          });
        }
      });
    });
  }

  res.sendStatus(200);
});

app.get('/conversations', (req, res) => {
  const list = Object.entries(conversations).map(([id, conv]) => ({
    id,
    name: conv.name,
    lastMessage: conv.messages.at(-1)?.body || '',
    unread: true
  }));
  res.json(list);
});

app.get('/conversations/:id', (req, res) => {
  const conv = conversations[req.params.id];
  if (!conv) return res.status(404).send('Conversation not found');
  res.json(conv);
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});