import React, { useState, useEffect } from "react";

export default function PatientForm({ patient = {}, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (patient) {
      setName(patient.name || "");
      setPhone(patient.phone || "");
    }
  }, [patient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Nome é obrigatório");
      return;
    }
    onSave({ name, phone });
    setName("");
    setPhone("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginRight: "0.5rem" }}
      />
      <input
        type="text"
        placeholder="Telefone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ marginRight: "0.5rem" }}
      />
      <button type="submit">Salvar</button>
      {onCancel && (
        <button type="button" onClick={onCancel} style={{ marginLeft: "0.5rem" }}>
          Cancelar
        </button>
      )}
    </form>
  );
}
