import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { 
  Clock, Send as SendIcon, Fingerprint, Check, 
  Vote, Skull, AlertTriangle 
} from "lucide-react";

// Componentes locales
import { ScreenFrame, ManilaFolder, DarkCard, RedStamp } from "../components/ScreenFrame";
// gameData es mockup de datos para desarrollo solo
import { boardWords, colorMap, colorStyles } from "../components/gameData";
import "../components/Partidas.css"; // Importación del css de partidas TODO: Revisar si nos renta
// Datos de prueba TODO: integrar con backend
const currentClue = { word: "NOCTURNO", number: 8 };
const chatMessages = [
  { user: "LoboÁrtico", time: "11:42", text: "La pista es NOCTURNO con 2..." },
  { user: "NightFox_99", time: "11:44", text: "Creo que NOCHE y SOMBRA encajan" },
  { user: "LoboÁrtico", time: "11:45", text: "De acuerdo, yo voto NOCHE primero" },
];

export function Pantalla04PartidaAgente() {
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(chatMessages);

  // Estados del juego
  const [selectedCard, setSelectedCard] = useState(null); // Formato "row-col"
  const [votesUsed, setVotesUsed] = useState(0);
  const [revealedCards, setRevealedCards] = useState({}); 
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const maxVotes = currentClue.number;
  const votesRemaining = maxVotes - votesUsed;

  // Cálculos de puntuación
  const redFound = useMemo(() => Object.values(revealedCards).filter(c => c === "R").length, [revealedCards]);
  const blueFound = useMemo(() => Object.values(revealedCards).filter(c => c === "B").length, [revealedCards]);
  const totalRed = colorMap.flat().filter(c => c === "R").length;

  const handleSelectCard = (ri, ci) => {
    if (gameOver) return;
    const key = `${ri}-${ci}`;
    if (revealedCards[key]) return;
    if (votesRemaining <= 0) return;
    setSelectedCard(selectedCard === key ? null : key);
  };

  const handleVote = () => {
    if (!selectedCard || votesRemaining <= 0 || gameOver) return;

    const [ri, ci] = selectedCard.split("-").map(Number);
    const trueColor = colorMap[ri][ci];

    const newRevealed = { ...revealedCards, [selectedCard]: trueColor };
    setRevealedCards(newRevealed);
    setVotesUsed(prev => prev + 1);
    setSelectedCard(null);

    // Lógica de fin de turno/juego
    if (trueColor === "A") {
      setGameOver(true);
      setGameResult("lose");
      return;
    }

    if (trueColor === "C" || trueColor === "B") {
      setVotesUsed(maxVotes); // Termina el turno
      setMessages(prev => [
        ...prev,
        { 
          user: "SISTEMA", 
          time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }), 
          text: trueColor === "C" ? "Civil descubierto. Turno terminado." : "Agente enemigo descubierto. Turno terminado." 
        }
      ]);
      return;
    }

    const newRedFound = Object.values(newRevealed).filter(c => c === "R").length;
    if (newRedFound >= totalRed) {
      setGameOver(true);
      setGameResult("win");
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [
      ...prev,
      { user: "Tú", time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }), text: chatInput }
    ]);
    setChatInput("");
  };

  const selectedWord = selectedCard 
    ? boardWords[parseInt(selectedCard.split("-")[0])][parseInt(selectedCard.split("-")[1])] 
    : null;

  return (
    <ScreenFrame title="VISTA DEL AGENTE">
      {/* Overlay de Fin de Juego */}
      {gameOver && (
        <div className="game-over-overlay" onClick={() => navigate("/mission-report")}>
          <div className="game-over-content" onClick={(e) => e.stopPropagation()}>
            <div className={`end-game-stamp ${gameResult === "win" ? "win-stamp" : "lose-stamp"}`}>
              {gameResult === "win" ? (
                <Check className="end-game-icon" />
              ) : (
                <Skull className="end-game-icon" />
              )}
              <p className="end-game-title">
                {gameResult === "win" ? "MISIÓN COMPLETADA" : "MISIÓN FALLIDA"}
              </p>
              <p className="end-game-subtitle">
                {gameResult === "win" ? "Todos los agentes rojos descubiertos" : "El Asesino ha sido revelado"}
              </p>
            </div>
            {/* Botón */}
            <button onClick={() => navigate("/mission-report")} className="view-report-btn">
              <span>VER INFORME</span>
            </button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="agent-top-bar">
        <div className="top-bar-stats-group">
          
          {/* Marcador */}
          <DarkCard className="score-counter-card">
            <div className="score-team red-team">
              <div className="team-dot" />
              <span className="score-text">{redFound}/{totalRed}</span>
            </div>
            <span className="score-separator">vs</span>
            <div className="score-team blue-team">
              <div className="team-dot" />
              <span className="score-text">{blueFound}</span>
            </div>
          </DarkCard>
          
          {/* Badge Turno */}
          <div className="current-turn-badge">
            <span>TURNO EQUIPO ROJO</span>
          </div>
        </div>

        {/* Pista */}
        <div className="clue-display-box">
          <div className="clue-item">
            <span className="clue-label">PISTA:</span>
            <p className="clue-word-value">{currentClue.word}</p>
          </div>
          <div className="clue-divider" />
          <div className="clue-item">
            <span className="clue-label">CANTIDAD:</span>
            <p className="clue-number-value">{currentClue.number}</p>
          </div>
        </div>
        
        {/* Role badge */}
        <div className="role-badge-row">
            <div className="agent-role-badge">
            <span>AGENTE DE CAMPO — EQUIPO ROJO</span>
            </div>
        </div>

        {/* Timer */}
        <DarkCard className="game-timer-card">
          <Clock className="timer-icon" />
          <span className="timer-clock-text">01:53</span>
        </DarkCard>
      </div>


      {/* Main Content Layout */}
      <div className="agent-main-layout">
        <div className="board-and-voting-area">
          {/* Tablero */}
          <ManilaFolder>
            <div className="board-container">
              <div className="board-grid-5cols">
                {boardWords.map((row, ri) =>
                  row.map((word, ci) => {
                    const key = `${ri}-${ci}`;
                    const rev = revealedCards[key];
                    const isSelected = selectedCard === key;
                    const canSelect = !rev && votesRemaining > 0 && !gameOver;

                    let cardStateClass = "card-idle";
                    if (rev) { cardStateClass = `card-revealed color-${rev}`; }
                    else if (isSelected) { cardStateClass = "card-selected"; }
                    else if (!canSelect) { cardStateClass = "card-disabled"; }

                    return (
                      <div
                        key={key}
                        className={`game-card ${cardStateClass}`}
                        onClick={() => canSelect && handleSelectCard(ri, ci)}
                      >
                        {/* Card Top */}
                        <div className="card-inner-top">
                          {rev === "A" && <Skull className="rev-icon-skull" />}
                          {rev === "R" && <div className="rev-token token-red" />}
                          {rev === "B" && <div className="rev-token token-blue" />}
                          {rev === "C" && <div className="rev-token token-neutral" />}
                          {isSelected && !rev && <Fingerprint className="selected-icon-fingerprint" />}
                        </div>
                        {/* Card Bottom */}
                        <div className="card-inner-bottom">
                          <p className="card-word-text">
                            {word}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </ManilaFolder>

        </div>

        <div className="side-panels-column">

        {/* Chat Panel */}
        <DarkCard className="chat-panel-container">
          {/* Header */}
          <div className="chat-header-border">
            <span className="chat-title-elite">CANAL ENCRIPTADO</span>
            <p className="chat-subtitle-courier">Chat de equipo — Equipo Rojo</p>
          </div>

          {/* Messages */}
          <div className="chat-messages-scroll-area">
            {messages.map((m, i) => (
              <div key={i} className={`message-row ${m.user === "Tú" ? "message-own" : ""}`}>
                {/* Bubble */}
                <div className={`message-bubble ${m.user === "SISTEMA" ? "bubble-system" : m.user === "Tú" ? "bubble-own" : "bubble-default"}`}>
                  {/* Info */}
                  <div className="message-meta-info">
                    <span className="message-username">{m.user}</span>
                    <span className="message-timestamp">{m.time}</span>
                  </div>
                  <p className="message-content-text">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input-bar">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Escribe mensaje..."
              className="chat-text-input"
            />
            {/* Botón Enviar */}
            <button onClick={handleSendMessage} className="chat-send-btn">
              <SendIcon className="send-icon-sm" />
            </button>
          </div>
        </DarkCard>
         {/* Voting Panel */}

          <DarkCard className="voting-action-panel">
            <div className="voting-panel-content">
              {/* Status */}
              <div className="voting-status-group">
                <div>
                  <span className="voting-label-xs">VOTOS DISPONIBLES</span>
                  <div className="vote-dots-container">
                    {Array.from({ length: maxVotes }).map((_, i) => (
                      <div key={i} className={`vote-dot ${i < votesUsed ? "dot-used" : "dot-empty"}`}>
                        {i < votesUsed ? (
                          <Check className="vote-check-icon" />
                        ) : (
                          <span className="vote-number">{i + 1}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedCard && (
                  /* Selección */
                  <div className="current-selection-badge">
                    <span className="voting-label-xs">SELECCIÓN:</span>
                    <p className="selected-word-display">{selectedWord}</p>
                  </div>
                )}

                {votesRemaining <= 0 && !gameOver && (
                  /* Alerta */
                  <div className="no-votes-alert">
                    <AlertTriangle className="alert-icon-sm" />
                    <span className="alert-text-xs">SIN VOTOS — TURNO TERMINADO</span>
                  </div>
                )}
              </div>

              {/* Botón Votar */}
              <button
                onClick={handleVote}
                disabled={!selectedCard || votesRemaining <= 0 || gameOver}
                className="submit-vote-btn"
              >
                <Vote className="vote-btn-icon" />
                <span>VOTAR</span>
              </button>
            </div>
          </DarkCard>

          {/* Botón Abortar */}
          <button onClick={() => navigate("/dashboard")} className="abort-mission-btn">
            <span>ABORTAR MISIÓN</span>
          </button>
            </div>
      </div>

      {/* Footer Stamp */}
      <div className="agent-footer-row">
        <RedStamp text="CLASSIFIED" className="classified-stamp-effect" />
      </div>
    </ScreenFrame>
  );
}