import React, { useEffect, useState } from "react";
import "../styles/Schedule.css";

const Schedule = () => {
  const [events, setEvents] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initClient = async () => {
      try {
        await window.gapi.client.init({
          apiKey: "AIzaSyBGOzIeQBHZ5i0wM5AzOSpL9v4VjMOMJkw",
          clientId: "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",
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
          ],
          scope: "https://www.googleapis.com/auth/calendar.events.readonly",
        });

        const authInstance = window.gapi.auth2.getAuthInstance();

        const signedIn = authInstance.isSignedIn.get();
        setIsSignedIn(signedIn);

        if (signedIn) {
          loadEvents();
        }

        authInstance.isSignedIn.listen((status) => {
          if (status) {
            window.location.reload(); // força atualização após login
          }
        });

        setLoading(false);
      } catch (error) {
        console.error("Erro na inicialização do Google API", error);
        setLoading(false);
      }
    };

    window.gapi.load("client:auth2", initClient);
  }, []);

  const handleLogin = () => {
    const authInstance = window.gapi.auth2.getAuthInstance();
    authInstance.signIn();
  };

  const loadEvents = async () => {
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 20,
        orderBy: "startTime",
      });
      setEvents(response.result.items);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    }
  };

  return (
    <div className="agenda-container">
      <h2 className="agenda-title">Agenda de Atendimentos</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : !isSignedIn ? (
        <button className="btn-google" onClick={handleLogin}>
          Conectar com Google
        </button>
      ) : events.length === 0 ? (
        <p>Nenhum evento encontrado.</p>
      ) : (
        <ul className="agenda-list">
          {events.map((event) => (
            <li key={event.id} className="agenda-item">
              <strong>{event.summary}</strong> <br />
              {new Date(
                event.start.dateTime || event.start.date
              ).toLocaleString("pt-BR")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Schedule;
