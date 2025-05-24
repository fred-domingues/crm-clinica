import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);

  const patientsRef = collection(db, 'patients');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const snapshot = await getDocs(patientsRef);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPatients(list);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    if (editingId) {
      await updateDoc(doc(db, 'patients', editingId), form);
      setEditingId(null);
    } else {
      await addDoc(patientsRef, form);
    }

    setForm({ name: '', phone: '', email: '' });
    fetchPatients();
  };

  const handleEdit = (patient) => {
    setForm({ name: patient.name, phone: patient.phone, email: patient.email });
    setEditingId(patient.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'patients', id));
    fetchPatients();
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  return (
    <div>
      <h2>Gerenciamento de Pacientes</h2>

      <div className="card">
        <h3>{editingId ? 'Editar Paciente' : 'Novo Paciente'}</h3>
        <form onSubmit={handleSubmit}>
          <label>Nome</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <label>Telefone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />

          <label>Email (opcional)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <button type="submit">{editingId ? 'Salvar Alterações' : 'Cadastrar'}</button>
        </form>
      </div>

      <div className="card">
        <h3>Pacientes Cadastrados</h3>

        <input
          type="text"
          placeholder="Buscar por nome ou telefone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: '10px' }}
        />

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.phone}</td>
                <td>{p.email}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>Editar</button>{' '}
                  <button className="secondary" onClick={() => handleDelete(p.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan="4">Nenhum paciente encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Patients;
