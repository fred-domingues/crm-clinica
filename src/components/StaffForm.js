import React, { useState, useEffect } from "react";

export default function StaffForm({ staff = {}, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [registration, setRegistration] = useState("");

  useEffect(() => {
    if (staff) {
      setName(staff.name || "");
      setArea(staff.area || "");
      setSpecialty(staff.specialty || "");
      setRegistration(staff.registration || "");
    }
  }, [staff]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Nome é obrigatório");
      return;
    }
    onSave({ name, area, specialty, registration });
    setName("");
    setArea("");
    setSpecialty("");
    setRegistration("");
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
        placeholder="Área de atuação"
        value={area}
        onChange={(e) => setArea(e.target.value)}
        style={{ marginRight: "0.5rem" }}
      />
      <input
        type="text"
        placeholder="Especialidade"
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        style={{ marginRight: "0.5rem" }}
      />
      <input
        type="text"
        placeholder="Registro (CRM, CRO, etc)"
        value={registration}
        onChange={(e) => setRegistration(e.target.value)}
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
