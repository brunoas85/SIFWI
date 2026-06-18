// MOCK TEMPORAL: la API todavía no expone latitud/longitud en /api/estaciones/config.
// Estas coordenadas son aproximadas y solo sirven para probar el mapa interactivo
// mientras se desarrolla el resto de la app. Eliminar cuando el backend devuelva
// las coordenadas reales.
export const COORDENADAS_MOCK: Record<string, { lat: number; lng: number }> = {
  '87761': { lat: -40.1614, lng: -71.3551 },   // Chapelco (San Martín de los Andes)
  '87765': { lat: -41.1335, lng: -71.3103 },   // Bariloche
  IALUMI4: { lat: -39.2333, lng: -70.9333 },   // Alumine (Junín de los Andes, zona norte del PNL)
  IALUMI6: { lat: -39.5167, lng: -71.3167 },   // Quillen
  IHUILI4: { lat: -39.6667, lng: -71.2333 },   // Tromen
  IJUNND6: { lat: -39.6167, lng: -71.4500 },   // Paimun
  ILASCO33: { lat: -39.1667, lng: -71.1667 },  // Rucachoroi
  ISANMA169: { lat: -40.0167, lng: -71.7167 }, // Hua Hum (San Martín de los Andes)
}
