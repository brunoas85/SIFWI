# SIFWI — Sistema de Información FWI

## Descripción del proyecto

Webapp interactiva para visualizar y explorar datos del índice FWI (Fire Weather Index) provenientes de distintas estaciones meteorológicas. El objetivo es ofrecer una interfaz cómoda que permita:

- Ver los datos actuales e históricos de cada estación
- Navegar entre estaciones
- Comparar datos entre estaciones y/o fechas distintas

## Stack

- **Framework:** React + Vite + TypeScript
- **Estilos:** Tailwind CSS

## Convenciones

- Componentes en **PascalCase**
- Todo el código, variables, comentarios y UI en **español**

## Notas

- No modificar archivos en `/public`

---

## API

- **IP pública del servidor:** `181.114.143.184`
- **Base URL:** `http://181.114.143.184:4102/api`
- **Puerto:** `4102`

### Endpoints

#### 1. Listar todas las estaciones
- **GET** `/api/estaciones`
- Retorna todas las estaciones con su último registro.

**Respuesta:**
```json
[
  {
    "id": "87761",
    "nombre": "Nombre Estación",
    "fecha": "2025-04-09",
    "hora": "12:00",
    "estado_fwi": "SEVERO",
    "fwi": "95.5",
    "temperatura": "28.5",
    "humedad": "35",
    "viento": "12",
    "ppt": "0.0",
    "api": "WU"
  }
]
```

---

#### 2. Obtener datos de una estación específica
- **GET** `/api/estacion/<estacion_id>`
- Retorna el último registro de una estación.

**Respuesta:**
```json
{
  "Date": "2025-04-09",
  "Hora": "12:00",
  "Temp": "28.5",
  "HR": "35",
  "WS": "12",
  "W 10": "10.5",
  "WD": "N",
  "PPT": "0.0",
  "Acum": "100",
  "FFMC": "85.2",
  "DMC": "125.3",
  "DC": "250.1",
  "ISI": "8.5",
  "BUI": "178.9",
  "FWI": "95.5",
  "Estado FWI": "SEVERO",
  "nombre": "Nombre Estación",
  "api": "WU"
}
```

---

#### 3. Configuración de todas las estaciones
- **GET** `/api/estaciones/config`
- Retorna la configuración de todas las estaciones activas.

**Respuesta:**
```json
{
  "87761": {
    "nombre": "La Consulta",
    "latitud": "-34.123",
    "longitud": "-68.456",
    "api": "WU",
    "calculo_viento": 1.0,
    "precipitaciones": "tipo1",
    "activa": true
  }
}
```

---

#### 4. Información completa de una estación
- **GET** `/api/estacion/<estacion_id>/info`
- Retorna config + último registro de una estación.

**Respuesta:**
```json
{
  "nombre": "La Consulta",
  "latitud": "-34.123",
  "longitud": "-68.456",
  "api": "WU",
  "calculo_viento": 1.0,
  "precipitaciones": "tipo1",
  "activa": true,
  "ultimo_registro": {
    "Date": "2025-04-09",
    "Hora": "12:00",
    "Temp": "28.5"
  }
}
```

---

#### 5. Configuración agrupada de estaciones
- **GET** `/api/configuracion/estaciones`
- Configuración agrupada por tipo de API (WU / SMN) con resumen.

**Respuesta:**
```json
{
  "status": "success",
  "data": {
    "resumen": {
      "total_estaciones": 10,
      "estaciones_activas": 9,
      "estaciones_wu": 5,
      "estaciones_smn": 4
    },
    "estaciones_wu": [],
    "estaciones_smn": [],
    "horarios": {
      "weather_underground": "12:00 (backup: 12:05)",
      "smn": "13:00 (backup: 13:10)",
      "limpieza": "00:01"
    }
  }
}
```

---

#### 6. Vista de datos meteorológicos (tabla amarilla)
- **GET** `/api/vista_datos_meteorologicos`
- Datos meteorológicos de todas las estaciones en un único reporte.

**Respuesta:**
```json
{
  "status": "success",
  "fecha_reporte": { "fecha": "2025-04-09", "hora": "12:00" },
  "data": [
    {
      "estacion": "La Consulta",
      "estacion_id": "87761",
      "temperatura": 28.5,
      "humedad": 35,
      "viento_kmh": 12,
      "viento_10m": 10,
      "direccion": "N",
      "lluvia_ayer": 0.0,
      "acumulado": 100,
      "fecha": "2025-04-09",
      "hora": "12:00"
    }
  ]
}
```

---

#### 7. Vista de índices FWI (tabla morada)
- **GET** `/api/vista_fwi`
- Índices FWI de todas las estaciones en un único reporte.

**Respuesta:**
```json
{
  "status": "success",
  "fecha_reporte": { "fecha": "2025-04-09", "hora": "12:00" },
  "data": [
    {
      "estacion": "La Consulta",
      "estacion_id": "87761",
      "ffmc": 85,
      "dmc": 125,
      "dc": 250,
      "isi": 8,
      "bui": 178,
      "fwi": 95,
      "fecha": "2025-04-09",
      "hora": "12:00"
    }
  ]
}
```

---

#### 8. Historial completo de una estación
- **GET** `/api/estacion/<estacion_id>/historial`
- Retorna todos los registros históricos de una estación.

**Respuesta:**
```json
{
  "status": "success",
  "estacion_id": "87761",
  "nombre_estacion": "La Consulta",
  "total_registros": 1250,
  "primer_registro": "2024-06-01",
  "ultimo_registro": "2025-04-09",
  "datos": []
}
```

---

#### 9. Historial por rango de fechas
- **GET** `/api/estacion/<estacion_id>/historial/rango`
- Parámetros query: `fecha_inicio` y `fecha_fin` en formato `YYYYMMDD`

**Ejemplo:**
```
/api/estacion/87761/historial/rango?fecha_inicio=20250401&fecha_fin=20250409
```

**Respuesta:**
```json
{
  "status": "success",
  "estacion_id": "87761",
  "nombre_estacion": "La Consulta",
  "fecha_inicio": "20250401",
  "fecha_fin": "20250409",
  "total_registros": 45,
  "datos": []
}
```

---

#### 10. Descargar CSV de una estación
- **GET** `/api/estacion/<estacion_id>/descargar`
- Descarga el historial completo como archivo CSV.
- Nombre del archivo: `historial_<nombre>_<id>.csv`

---

#### 11. Datos climáticos en tiempo real (estaciones WU)
- **GET** `/api/clima_actual_wu`
- Consulta en vivo la API de Weather Underground para todas las estaciones WU activas. Puede tardar unos segundos.
- Las estaciones con error aparecen en el campo `errores` sin interrumpir la respuesta.

**Respuesta:**
```json
{
  "status": "success",
  "timestamp": "2026-06-12 14:30:00",
  "total": 5,
  "errores": [],
  "data": [
    {
      "estacion": "IALUMI4",
      "nombre": "Alumine",
      "temperatura": 12.5,
      "humedad": 68,
      "velocidad_viento": 8,
      "precipitaciones_total": 1.4,
      "direccion_viento": "SO",
      "latitud": -38.9,
      "mes": 6
    }
  ]
}
```

---

#### 12. Políticas de privacidad
- **GET** `/api/politicas-privacidad`
- Retorna el texto de políticas de privacidad (texto plano).

---

## Códigos de respuesta

| Código | Significado |
|--------|-------------|
| 200 | OK — datos obtenidos exitosamente |
| 400 | Bad Request — parámetro inválido |
| 404 | Not Found — estación o datos no encontrados |
| 500 | Error interno del servidor |
