import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import '../styles/Procedures.css';

export default function Procedures() {
  const [procedures, setProcedures] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [name, setName] = useState('');
  const [selectedPros, setSelectedPros] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('');

  // Buscar profissionais cadastrados
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'staff'), (snapshot) => {
      const pros = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProfessionals(pros);
    });
    return () => unsubscribe();
  }, []);

  // Buscar procedimentos com realtime update
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'procedures'), (snapshot) => {
      const procs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProcedures(procs);
    });
    return () => unsubscribe();
  }, []);

  function toggleProfessional(proId) {
    if (selectedPros.includes(proId)) {
      setSelectedPros(selectedPros.filter(id => id !== proId));
    } else {
      setSelectedPros([...selectedPros, proId]);
    }
  }

  function clearForm() {
    setName('');
    setSelectedPros([]);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return alert('Preencha o nome do procedimento');

    const data = { name, professionals: selectedPros };
    try {
      if (editingId) {
        // update
        const docRef = doc(db, 'procedures', editingId);
        await updateDoc(docRef, data);
      } else {
        // create
        await addDoc(collection(db, 'procedures'), data);
      }
      clearForm();
    } catch (err) {
      console.error('Erro ao salvar procedimento', err);
    }
  }

  function handleEdit(proc) {
    setName(proc.name);
    setSelectedPros(proc.professionals || []);
    setEditingId(proc.id);
  }

  async function handleDelete(id) {
    if (!window.confirm('Deseja realmente excluir este procedimento?')) return;
    try {
      await deleteDoc(doc(db, 'procedures', id));
    } catch (err) {
      console.error('Erro ao excluir procedimento', err);
    }
  }

  // Filtrar procedimentos pela busca
  const filteredProcedures = procedures.filter(proc => {
    const procName = proc.name.toLowerCase();
    const filterLower = filter.toLowerCase();

    // Profissionais vinculados
    const prosLinked = professionals.filter(p => proc.professionals?.includes(p.id));

    // Verifica se filtro bate no nome do procedimento
    if (procName.includes(filterLower)) return true;

    // Verifica se filtro bate no nome ou profissão dos profissionais vinculados
    for (const pro of prosLinked) {
      const proName = pro.name.toLowerCase();
      const proRole = pro.specialty?.toLowerCase() || '';
      if (proName.includes(filterLower) || proRole.includes(filterLower)) return true;
    }

    return false;
  });

  return (
    <div className="procedures-container">
      <h2>Procedimentos</h2>
      <form onSubmit={handleSubmit} className="procedure-form">
        <div>
          <label>Nome do Procedimento:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Limpeza Dental"
          />
        </div>

        <div>
          <label>Profissionais que fazem este procedimento:</label>
          <div className="multi-select-box">
            {professionals.length === 0 && <p>Nenhum profissional cadastrado.</p>}
            {professionals.map(pro => (
              <label key={pro.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedPros.includes(pro.id)}
                  onChange={() => toggleProfessional(pro.id)}
                />
                 {pro.name} - {pro.specialty}
              </label>
            ))}
          </div>
        </div>

        <button type="submit">{editingId ? 'Atualizar' : 'Cadastrar'}</button>
        {editingId && <button type="button" onClick={clearForm} className="btn-cancel">Cancelar</button>}
      </form>

      <hr />

      <input
        type="text"
        className="filter-input"
        placeholder="Buscar por nome, procedimento ou profissão..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />

      <table className="procedures-table">
        <thead>
          <tr>
            <th>Procedimento</th>
            <th>Profissionais</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredProcedures.length === 0 && (
            <tr><td colSpan="3">Nenhum procedimento encontrado.</td></tr>
          )}
          {filteredProcedures.map(proc => (
            <tr key={proc.id}>
              <td>{proc.name}</td>
              <td>
                <div className="tags-container">
                  {professionals
                    .filter(pro => proc.professionals?.includes(pro.id))
                    .map(pro => (
                      <span key={pro.id} className="tag">
                        {pro.name} - {pro.specialty}
                      </span>
                    ))}
                </div>
              </td>
              <td>
                <button onClick={() => handleEdit(proc)} className="btn-edit">Editar</button>
                <button onClick={() => handleDelete(proc.id)} className="btn-delete">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
