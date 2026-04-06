# 🎯 Surebet Scanner

Analizador de arbitraje deportivo con IA. Subís un screenshot de Bet365, la IA detecta automáticamente oportunidades de surebet y te dice exactamente cuánto apostar en cada resultado.

## ¿Cómo funciona?

1. Subís screenshot de los partidos con sus cuotas
2. La IA lee las cuotas automáticamente
3. Calcula si hay surebet (suma de probabilidades implícitas < 100%)
4. Te dice exactamente cuánto apostar en Local / Empate / Visitante
5. Te alerta qué eventos en vivo esperar para que aparezca la oportunidad

## Deploy en Vercel

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/TU_USUARIO/surebet-scanner.git
git push -u origin main
```

### 2. Configurar en Vercel
- Importar el repo desde vercel.com
- En **Environment Variables** agregar:
  - `ANTHROPIC_API_KEY` = tu API key de Anthropic (console.anthropic.com)

### 3. Deploy automático ✅

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local
# Editar .env.local con tu API key
npm run dev
```

## La matemática detrás

**Probabilidad implícita** = 1 / cuota

**Surebet** existe cuando:
```
(1/cuota_local) + (1/cuota_empate) + (1/cuota_visitante) < 1.00
```

**Cuánto apostar en cada resultado:**
```
apuesta_i = capital × (1/cuota_i) / suma_total
```

Esto garantiza el mismo retorno sin importar qué resultado ocurra.
