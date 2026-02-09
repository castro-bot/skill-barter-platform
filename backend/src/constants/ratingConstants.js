// backend/src/constants/ratingConstants.js
// Centralized rating configuration to keep backend and frontend in sync.

const TAGS_BY_SCORE = {
  1: ["Incumplio lo acordado", "No se presento", "Mala comunicacion", "Calidad baja", "Tiempo de entrega"],
  2: ["Incumplio lo acordado", "No se presento", "Mala comunicacion", "Calidad baja", "Tiempo de entrega"],
  3: ["Aceptable", "Retraso leve", "Comunicacion media", "Calidad regular"],
  4: ["Gran comunicacion", "Entrega puntual", "Alta calidad", "Volveria a intercambiar"],
  5: ["Gran comunicacion", "Entrega puntual", "Alta calidad", "Volveria a intercambiar"]
}

const MAX_COMMENT_LENGTH = 300
const MAX_TAGS = 5

module.exports = {
  TAGS_BY_SCORE,
  MAX_COMMENT_LENGTH,
  MAX_TAGS
}
