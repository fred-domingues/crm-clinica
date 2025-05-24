const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(bodyParser.json());

// Configs do Meta WhatsApp
const VERIFY_TOKEN = 'seu_token_de_verificacao';
const ACCESS_TOKEN = 'EAAOZCU1hntr0BOZCxXOARdzafJEZAI5QnwBFMzSUXTjdSiLwQSmCghBlX5jGElkNcYjWvYpbPuGq2strGftLbVaKqIZCqSm3HNOx30DZCfWniuZC2zwCvLDne9WmLZCqx4Xvf65IRZA6SAjwllicQewHGyit8TcSlYzvHDiZCcASZA2Q8VIYJ4IO27F8M76tUtta0m';
const PHONE_NUMBER_ID = '642019448994099';

// Endpoint para verificação do webhook pelo Facebook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Recebendo mensagens do WhatsApp via webhook
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object) {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
        const messages = body.entry[0].changes[0].value.messages;
        const metadata = body.entry[0].changes[0].value.metadata;
        const phoneNumberId = metadata.phone_number_id;

        for (const message of messages) {
          // Exemplo para texto simples (adapte para outros tipos)
          if (message.type === 'text') {
            const from = message.from; // número do cliente
            const text = message.text.body;
            const msgId = message.id;
            const timestamp = new Date(parseInt(message.timestamp) * 1000);

            // Buscar ou criar conversa no Firestore
            let convRef = db.collection('conversations').doc(from);
            const convDoc = await convRef.get();

            if (!convDoc.exists) {
              // Cria novo contato com dados básicos
              await convRef.set({
                contactInfo: { phone: from, name: from, photoUrl: null },
                lastMessage: { text, timestamp, senderId: from },
                unreadByUser: true
              });
            } else {
              // Atualiza última mensagem
              await convRef.update({
                lastMessage: { text, timestamp, senderId: from },
                unreadByUser: true
              });
            }

            // Adiciona mensagem na subcoleção
            const messagesRef = convRef.collection('messages');
            await messagesRef.doc(msgId).set({
              text,
              timestamp,
              senderId: from,
              read: false
            });
          }
        }
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error('Erro no webhook:', err);
    res.sendStatus(500);
  }
});

// Endpoint para enviar mensagem via WhatsApp Cloud API
app.post('/send-message', async (req, res) => {
  try {
    const { to, text } = req.body;

    if (!to || !text) {
      return res.status(400).json({ error: 'Campos "to" e "text" são obrigatórios.' });
    }

    const url = `https://graph.facebook.com/v16.0/${PHONE_NUMBER_ID}/messages`;

    const body = {
      messaging_product: 'whatsapp',
      to,
      text: { body: text }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao enviar mensagem:', errorData);
      return res.status(500).json({ error: 'Falha ao enviar mensagem' });
    }

    // Atualiza Firestore: conversa e mensagens
    const convRef = db.collection('conversations').doc(to);
    const now = new Date();

    await convRef.set({
      contactInfo: { phone: to, name: to, photoUrl: null },
      lastMessage: { text, timestamp: now, senderId: 'clinic-user-1' },
      unreadByUser: false
    }, { merge: true });

    const messagesRef = convRef.collection('messages');
    await messagesRef.add({
      text,
      timestamp: now,
      senderId: 'clinic-user-1',
      read: true
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

module.exports = app;
