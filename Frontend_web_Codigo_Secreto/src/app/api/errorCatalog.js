/**
 * Catálogo de errores centralizado para el Frontend.
 * Mapea los códigos de error (error_code) enviados por el backend a mensajes 
 * amigables en español para el usuario.
 */

export const ERROR_CATALOG = {
  // 9.1. Sesión y Seguridad
  "SESSION_INVALIDATED": "Se ha iniciado sesión en otro dispositivo. Tu sesión actual ha sido cerrada por seguridad.",
  "GOOGLE_TOKEN_EXPIRED": "Tu sesión de Google ha caducado. Por favor, vuelve a entrar.",
  "INACTIVE_ACCOUNT": "Esta cuenta de agente ha sido desactivada o eliminada.",

  // 9.2. Gestión de Partidas (Lobby y Creación)
  "PLAYER_ALREADY_IN_GAME": "Ya tienes una misión activa en curso. Termínala antes de empezar otra.",
  "LOBBY_FULL": "El cuartel general está lleno. No caben más agentes en esta misión.",
  "GAME_ALREADY_STARTED": "La misión ya ha comenzado. No es posible unirse ahora.",
  "INVALID_ROOM_CODE": "El código de frecuencia de la sala no es válido o la sala ya no existe.",
  "MISSING_THEME_PACK": "No posees el equipo (pack de cartas) necesario para esta misión.",
  "TEAM_UNBALANCED": "No hay suficientes agentes asignados a cada equipo para comenzar la operación.",

  // 9.3. Gameplay (En partida)
  "NOT_YOUR_TURN": "Espera a que sea tu turno para realizar una acción.",
  "INVALID_ROLE_ACTION": "Tu rol actual no te permite realizar esta acción (ej: los líderes no votan).",
  "INVALID_PHASE_ACTION": "No es el momento adecuado para esta acción. Revisa la fase actual de la misión.",
  "WORD_ALREADY_REVEALED": "Esa información ya ha sido descubierta previamente por otro agente.",

  // 9.4. Social y Perfil
  "TAG_TAKEN": "Ese nombre clave (TAG) ya está siendo utilizado por otro agente. Elige uno diferente.",
  "PROFANITY_DETECTED": "El sistema de seguridad ha detectado lenguaje no permitido en tu mensaje o tag.",
  "ALREADY_FRIENDS": "Ya tienes una relación de amistad establecida con este agente.",

  // 9.5. Tienda e Inventario
  "INSUFFICIENT_FUNDS": "No tienes suficientes balas en tu arsenal para adquirir este equipo.",
  "ITEM_NOT_OWNED": "No posees este objeto en tu inventario para poder equiparlo.",
  "ALREADY_OWNED": "Ya tienes este objeto en tu posesión.",

  // 9.6. Errores de Sistema
  "INTERNAL_SERVER_ERROR": "Error crítico en los sistemas del Cuartel General. Inténtalo más tarde.",
  
  // Errores Genéricos / Fallbacks
  "DEFAULT": "Ha ocurrido un error inesperado en la conexión con el Cuartel General.",
  "NETWORK_ERROR": "No se ha podido contactar con el Cuartel General. Revisa tu conexión a internet."
};
