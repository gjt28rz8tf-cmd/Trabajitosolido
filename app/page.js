'use client'
import { useState, useRef, useCallback } from 'react'
import styles from './page.module.css'

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const STATUS_CONFIG = {
  SUREBET: { color: 'var(--green)', label: '✅ SUREBET', pulse: 'pulse-green', bg: 'rgba(0,232,122,0.06)' },
  CERCA:   { color: 'var(--yellow)', label: '⚠️ CERCA', pulse: 'pulse-yellow', bg: 'rgba(255,214,0,0.06)' },
  SIN_OPORTUNIDAD: { color: 'var(--red)', label: '❌ SIN OPT.', pulse: '', bg: 'rgba(255,58,58,0.04)' },
}

function PartidoCard({ partido, idx }) {
  const cfg = STATUS_CONFIG[partido.status] || STATUS_CONFIG.SIN_OPORTUNIDAD
  const delay = `${idx * 0.08}s`

  return (
    <div className="fade-up" style={{
      animationDelay: delay,
      background: cfg.bg,
      border: `1px solid ${cfg.color}33`,
      borderRadius: 12,
      padding: '18px 16px',
      marginBottom: 12,
      animation: `fadeUp 0.4s ease ${delay} both`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 17, fontFamily: 'var(--sans)', fontWeight: 900, letterSpacing: 1, color: '#fff', lineHeight: 1.1 }}>
            {partido.nombre}
          </div>
          {partido.estado && (
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3, fontFamily: 'var(--mono)' }}>
              {partido.estado}
            </div>
          )}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 2, color: cfg.color,
          border: `1px solid ${cfg.color}55`, borderRadius: 6,
          padding: '4px 8px', whiteSpace: 'nowrap',
          animation: cfg.pulse ? `${cfg.pulse} 2s infinite` : 'none',
        }}>
          {cfg.label}
        </div>
      </div>

      {/* Cuotas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { label: '🏠 LOCAL', cuota: partido.cuotas.local, apuesta: partido.apuestas?.local },
          { label: '🤝 EMPATE', cuota: partido.cuotas.empate, apuesta: partido.apuestas?.empate },
          { label: '✈️ VISIT.', cuota: partido.cuotas.visitante, apuesta: partido.apuestas?.visitante },
        ].map(({ label, cuota, apuesta }) => (
          <div key={label} style={{
            background: 'var(--bg3)', borderRadius: 8, padding: '10px 8px', textAlign: 'center',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'var(--sans)' }}>{cuota}</div>
            {apuesta && (
              <>
                <div style={{ fontSize: 8, color: 'var(--text-dim)', marginTop: 6, letterSpacing: 1 }}>APOSTÁ</div>
                <div style={{ fontSize: 12, color: cfg.color, fontWeight: 700 }}>{formatARS(apuesta)}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Stats */}
      {partido.status !== 'SIN_OPORTUNIDAD' && partido.ganancia_garantizada && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12,
          background: 'var(--bg)', borderRadius: 8, padding: '10px 12px',
          border: '1px solid var(--border)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 2 }}>SUMA PROB.</div>
            <div style={{ fontSize: 14, color: cfg.color, fontWeight: 700 }}>
              {(partido.suma_prob * 100).toFixed(2)}%
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 2 }}>GANANCIA</div>
            <div style={{ fontSize: 14, color: cfg.color, fontWeight: 700 }}>
              {formatARS(partido.ganancia_garantizada)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 2 }}>MARGEN</div>
            <div style={{ fontSize: 14, color: cfg.color, fontWeight: 700 }}>
              {partido.ganancia_pct?.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* Alerta */}
      {partido.alerta && (
        <div style={{
          background: 'var(--bg)', border: `1px solid ${cfg.color}33`,
          borderLeft: `3px solid ${cfg.color}`,
          borderRadius: 6, padding: '10px 12px',
          fontSize: 11, color: 'var(--text)', lineHeight: 1.6,
          fontFamily: 'var(--mono)',
        }}>
          <span style={{ color: cfg.color, fontWeight: 700, letterSpacing: 1 }}>⚡ MONITOR: </span>
          {partido.alerta}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [capital, setCapital] = useState(50000)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      setPreview(dataUrl)
      setResult(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }

  const handleAnalyze = async () => {
    if (!preview) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const base64 = preview.split(',')[1]
      const mimeType = preview.split(';')[0].split(':')[1]

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, capital, mimeType }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const surebets = result?.partidos?.filter(p => p.status === 'SUREBET') || []
  const cercas = result?.partidos?.filter(p => p.status === 'CERCA') || []
  const sinOpt = result?.partidos?.filter(p => p.status === 'SIN_OPORTUNIDAD') || []

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 60px' }}>

      {/* Scanline effect */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, var(--blue), transparent)',
        animation: 'scan 4s linear infinite', pointerEvents: 'none', zIndex: 100,
        opacity: 0.3,
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: 'var(--blue)', marginBottom: 6 }}>
          SISTEMA DE ARBITRAJE
        </div>
        <h1 style={{
          fontFamily: 'var(--sans)', fontSize: 34, fontWeight: 900, letterSpacing: 3,
          background: 'linear-gradient(135deg, #fff 40%, var(--blue))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          margin: 0,
        }}>
          SUREBET SCANNER
        </h1>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4, letterSpacing: 3 }}>
          POWERED BY IA · BET365
        </div>
      </div>

      {/* Capital */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--blue)', marginBottom: 6 }}>
          CAPITAL DISPONIBLE
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--blue)', fontSize: 18, fontWeight: 700,
          }}>$</span>
          <input
            type="number"
            value={capital}
            onChange={e => setCapital(Number(e.target.value))}
            style={{
              width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)',
              color: '#fff', fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)',
              padding: '12px 14px 12px 32px', borderRadius: 8, outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--blue)' : 'var(--border)'}`,
          borderRadius: 12, padding: '20px 16px', textAlign: 'center',
          cursor: 'pointer', marginBottom: 14, transition: 'all 0.2s',
          background: dragOver ? 'rgba(58,143,255,0.05)' : 'var(--bg2)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => processFile(e.target.files[0])}
        />

        {preview ? (
          <div>
            <img
              src={preview}
              alt="Screenshot"
              style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 8, objectFit: 'contain' }}
            />
            <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2 }}>
              TOCÁ PARA CAMBIAR IMAGEN
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--sans)', fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
              SUBÍ SCREENSHOT DE BET365
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1 }}>
              ARRASTRÁ O TOCÁ PARA SELECCIONAR
            </div>
          </div>
        )}
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!preview || loading}
        style={{
          width: '100%', padding: '14px', borderRadius: 10, border: 'none',
          background: preview && !loading
            ? 'linear-gradient(135deg, var(--blue), #1a6aff)'
            : 'var(--bg3)',
          color: preview && !loading ? '#fff' : 'var(--text-dim)',
          fontSize: 14, fontWeight: 700, fontFamily: 'var(--sans)', letterSpacing: 3,
          cursor: preview && !loading ? 'pointer' : 'not-allowed',
          marginBottom: 24, transition: 'all 0.2s',
        }}
      >
        {loading ? '⚡ ANALIZANDO...' : '🔍 ANALIZAR PARTIDOS'}
      </button>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(255,58,58,0.08)', border: '1px solid var(--red)',
          borderRadius: 8, padding: '12px 14px', marginBottom: 16,
          fontSize: 12, color: 'var(--red)',
        }}>
          ❌ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Resumen */}
          {result.resumen && (
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '12px 14px', marginBottom: 20,
              fontSize: 11, color: 'var(--text)', lineHeight: 1.6,
              fontFamily: 'var(--mono)',
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--blue)', marginBottom: 6 }}>RESUMEN IA</div>
              {result.resumen}
            </div>
          )}

          {/* Surebets */}
          {surebets.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--green)', marginBottom: 10 }}>
                ✅ SUREBETS DETECTADAS ({surebets.length})
              </div>
              {surebets.map((p, i) => <PartidoCard key={i} partido={p} idx={i} />)}
            </div>
          )}

          {/* Cerca */}
          {cercas.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--yellow)', marginBottom: 10 }}>
                ⚠️ MONITOREAR ({cercas.length})
              </div>
              {cercas.map((p, i) => <PartidoCard key={i} partido={p} idx={i} />)}
            </div>
          )}

          {/* Sin oportunidad */}
          {sinOpt.length > 0 && (
            <div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', marginBottom: 10 }}>
                ❌ SIN OPORTUNIDAD ({sinOpt.length})
              </div>
              {sinOpt.map((p, i) => <PartidoCard key={i} partido={p} idx={i} />)}
            </div>
          )}
        </div>
      )}

    </main>
  )
}
