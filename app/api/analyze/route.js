export async function POST(req) {
  try {
    const { image, capital, mimeType } = await req.json()

    const systemPrompt = `Eres un analizador experto en arbitraje deportivo (surebets). 
Tu tarea es analizar screenshots de Bet365 u otras plataformas de apuestas y extraer las cuotas de los partidos.

Para cada partido que encuentres en la imagen:
1. Identifica Local, Empate, Visitante y sus cuotas
2. Calcula la suma de probabilidades implícitas: (1/cuota1) + (1/cuota2) + (1/cuota3)
3. Si la suma < 1.00 → SUREBET (ganancia garantizada)
4. Si la suma está entre 1.00 y 1.05 → CERCA (monitorear)
5. Si la suma > 1.05 → SIN OPORTUNIDAD

Para cada partido también analiza:
- El estado del partido (si está en vivo, minuto, marcador)
- Qué eventos en vivo podrían mover las cuotas a tu favor (un gol, tarjeta roja, etc.)
- Una recomendación concreta de qué esperar y en qué minuto actuar

Capital disponible: $${capital} ARS

Responde SOLO en JSON con este formato exacto, sin markdown ni backticks:
{
  "partidos": [
    {
      "nombre": "Local vs Visitante",
      "estado": "En vivo 67'  1-0" o "Pre-partido 20:00",
      "cuotas": {
        "local": 2.10,
        "empate": 3.40,
        "visitante": 3.20
      },
      "suma_prob": 0.9876,
      "margen": 0.0124,
      "status": "SUREBET" | "CERCA" | "SIN_OPORTUNIDAD",
      "apuestas": {
        "local": 21500,
        "empate": 14700,
        "visitante": 13800
      },
      "ganancia_garantizada": 1250,
      "ganancia_pct": 2.5,
      "alerta": "Texto explicando qué evento esperar y cuándo actuar. Ej: Si en min 75+ entra un gol, la cuota del empate subirá a ~4.0, revisá inmediatamente.",
      "prioridad": 1
    }
  ],
  "resumen": "Texto breve del análisis general de todos los partidos"
}

Ordena los partidos por prioridad (1 = mejor oportunidad primero).
Si no podés leer cuotas de algún partido, no lo incluyas.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType || 'image/jpeg',
                  data: image,
                },
              },
              {
                type: 'text',
                text: `Analizá esta screenshot de apuestas deportivas. Capital disponible: $${capital} ARS. Encontrá todas las oportunidades de arbitraje.`,
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ error: data.error?.message || 'Error de API' }, { status: 500 })
    }

    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch {
      return Response.json({ error: 'No se pudo parsear respuesta de IA', raw: text }, { status: 500 })
    }

    return Response.json(parsed)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
