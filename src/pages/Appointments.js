import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import "../styles/Appointments.css";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [filters, setFilters] = useState({ professionalId: "", procedureId: "" });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, appointments]);

  const fetchData = async () => {
    const appointmentsSnap = await getDocs(collection(db, "appointments"));
    const staffSnap = await getDocs(collection(db, "staff"));
    const proceduresSnap = await getDocs(collection(db, "procedures"));

    const appts = appointmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const staff = staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const procs = proceduresSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setAppointments(appts);
    setProfessionals(staff);
    setProcedures(procs);
  };

  const applyFilters = () => {
    let results = [...appointments];

    if (filters.professionalId) {
      results = results.filter(a => a.professionalId === filters.professionalId);
    }

    if (filters.procedureId) {
      results = results.filter(a => a.procedureId === filters.procedureId);
    }

    setFilteredAppointments(results);
  };

  const getProfessionalName = (id) => {
    const p = professionals.find(p => p.id === id);
    return p ? `${p.name} - ${p.role}` : "Desconhecido";
  };

  const getProcedureName = (id) => {
    const p = procedures.find(p => p.id === id);
    return p ? p.name : "Desconhecido";
  };

  return (
    <div className="appointments-container">
      <h2>Agenda da Clínica</h2>

      <div className="filters">
        <select
          value={filters.professionalId}
          onChange={(e) => setFilters({ ...filters, professionalId: e.target.value })}
        >
          <option value="">Todos os Profissionais</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - {p.role}
            </option>
          ))}
        </select>

        <select
          value={filters.procedureId}
          onChange={(e) => setFilters({ ...filters, procedureId: e.target.value })}
        >
          <option value="">Todos os Procedimentos</option>
          {procedures.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="appointment-list">
        {filteredAppointments.map((a) => (
          <li key={a.id}>
            <strong>{a.date} às {a.time}</strong><br />
            Paciente: {a.patientName}<br />
            Profissional: {getProfessionalName(a.professionalId)}<br />
            Procedimento: {getProcedureName(a.procedureId)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Appointments;
