const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

// Firebase Admin init
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.FB_PHONE_NUMBER_ID;

// 🟢 Verificação do webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado com sucesso.');
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// 🟢 Webhook para mensagens recebidas
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    for (const entry of body.entry || []) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const messages = value.messages || [];
        const contacts = value.contacts || [];

        if (messages.length > 0 && contacts.length > 0) {
          const msg = messages[0];
          const contact = contacts[0];

          const wa_id = contact.wa_id;
          const nome = contact.profile?.name || wa_id;
          const texto = msg.text?.body || '';
          const timestamp = new Date(parseInt(msg.timestamp) * 1000);

          // 🔵 Salva mensagem
          await db.collection('conversas')
            .doc(wa_id)
            .collection('mensagens')
            .add({
              mensagem: texto,
              tipo: 'recebida',
              timestamp
            });

          // 🔵 Atualiza conversa principal
          await db.collection('conversas')
            .doc(wa_id)
            .set({
              wa_id,
              name: nome,
              lastMessage: texto,
              lastTimestamp: timestamp
            }, { merge: true });

          console.log(`✅ Mensagem de ${wa_id} salva`);
        }
      }
    }
  }

  res.sendStatus(200);
});

// 🟢 Listar conversas
app.get('/conversas', async (req, res) => {
  try {
    const snapshot = await db.collection('conversas')
      .orderBy('lastTimestamp', 'desc')
      .get();

    const conversas = snapshot.docs.map(doc => ({
      wa_id: doc.id,
      ...doc.data()
    }));

    res.json(conversas);
  } catch (err) {
    console.error('Erro ao buscar conversas:', err);
    res.status(500).send('Erro interno');
  }
});

// 🟢 Listar mensagens da conversa
app.get('/conversas/:wa_id/mensagens', async (req, res) => {
  const { wa_id } = req.params;

  try {
    const msgsSnap = await db.collection('conversas')
      .doc(wa_id)
      .collection('mensagens')
      .orderBy('timestamp')
      .get();

    const mensagens = msgsSnap.docs.map(doc => doc.data());
    res.json(mensagens);
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
    res.status(500).send('Erro interno');
  }
});

// 🟢 Enviar mensagem
app.post('/conversas/:wa_id/mensagens', async (req, res) => {
  const { wa_id } = req.params;
  const { mensagem } = req.body;

  if (!mensagem || mensagem.trim() === '') {
    return res.status(400).json({ error: 'Mensagem inválida' });
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: wa_id,
        text: { body: mensagem }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Falha ao enviar mensagem:', data);
      return res.status(500).json({ error: 'Erro ao enviar para WhatsApp', details: data });
    }

    const timestamp = new Date();

    // ✅ Salva no Firestore
    await db.collection('conversas').doc(wa_id).collection('mensagens').add({
      mensagem,
      tipo: 'enviada',
      timestamp
    });

    await db.collection('conversas').doc(wa_id).set({
      lastMessage: mensagem,
      lastTimestamp: timestamp
    }, { merge: true });

    res.status(200).json({ status: 'mensagem enviada e salva com sucesso' });
  } catch (err) {
    console.error('Erro interno no envio:', err);
    res.status(500).json({ error: 'Erro interno ao enviar mensagem' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔧 Backend rodando na porta ${PORT}`);
});