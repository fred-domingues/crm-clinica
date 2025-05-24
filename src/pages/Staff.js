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

function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
    specialty: '',
    registration: ''
  });
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);

  const staffRef = collection(db, 'staff');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const snapshot = await getDocs(staffRef);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStaffList(list);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.role) return;

    if (editingId) {
      await updateDoc(doc(db, 'staff', editingId), form);
      setEditingId(null);
    } else {
      await addDoc(staffRef, form);
    }

    setForm({
      name: '',
      phone: '',
      email: '',
      role: '',
      specialty: '',
      registration: ''
    });
    fetchStaff();
  };

  const handleEdit = (member) => {
    setForm({
      name: member.name,
      phone: member.phone,
      email: member.email,
      role: member.role,
      specialty: member.specialty,
      registration: member.registration
    });
    setEditingId(member.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'staff', id));
    fetchStaff();
  };

  const filteredStaff = staffList.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.specialty?.toLowerCase().includes(search.toLowerCase()) ||
    m.registration?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Gerenciamento de Funcionários</h2>

      <div className="card">
        <h3>{editingId ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
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
          />

          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <label>Cargo (Ex: Médico, Dentista, Fisioterapeuta)</label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
          />

          <label>Especialidade</label>
          <input
            type="text"
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
          />

          <label>CRM/CRO/etc</label>
          <input
            type="text"
            value={form.registration}
            onChange={(e) => setForm({ ...form, registration: e.target.value })}
          />

          <button type="submit">{editingId ? 'Salvar Alterações' : 'Cadastrar'}</button>
        </form>
      </div>

      <div className="card">
        <h3>Funcionários Cadastrados</h3>

        <input
          type="text"
          placeholder="Buscar por nome, especialidade ou registro"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: '10px' }}
        />

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cargo</th>
              <th>Especialidade</th>
              <th>CRM/CRO</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.role}</td>
                <td>{m.specialty}</td>
                <td>{m.registration}</td>
                <td>{m.phone}</td>
                <td>{m.email}</td>
                <td>
                  <button onClick={() => handleEdit(m)}>Editar</button>{' '}
                  <button className="secondary" onClick={() => handleDelete(m.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan="7">Nenhum funcionário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Staff;
