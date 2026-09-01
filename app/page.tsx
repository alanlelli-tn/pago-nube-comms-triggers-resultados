'use client';

import { useState } from 'react';
import Image from 'next/image';

type Period = 'all' | 'last30';

type CampaignMetrics = {
  views: number;
  uniqueViews: number;
  clicks: number;
  merchants: number;
  conversions: number;
  gpvPositive: number;
};

type Campaign = {
  id: 'mp' | 'pp' | 'cpt';
  tag: string;
  name: string;
  url: string;
  color: string;
  previewSrc: string;
  all: CampaignMetrics;
  last30: CampaignMetrics;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: 'mp',
    tag: 'Trigger MP',
    name: 'Configuración Mercado Pago',
    url: '/admin/settings/payments · evento PN_Trigger_MP',
    color: '#0050c3',
    previewSrc: '/screenshots/mp.png',
    all: { views: 9480, uniqueViews: 9310, clicks: 3986, merchants: 9310, conversions: 660, gpvPositive: 643 },
    last30: { views: 3626, uniqueViews: 3605, clicks: 1537, merchants: 3605, conversions: 209, gpvPositive: 201 },
  },
  {
    id: 'pp',
    tag: 'Trigger PP',
    name: 'Configuración Pagos Personalizados',
    url: '/admin/settings/payments · evento PN_Trigger_PP',
    color: '#00b4e6',
    previewSrc: '/screenshots/pp.png',
    all: { views: 4249, uniqueViews: 4145, clicks: 1061, merchants: 4145, conversions: 255, gpvPositive: 250 },
    last30: { views: 1613, uniqueViews: 1607, clicks: 401, merchants: 1607, conversions: 79, gpvPositive: 76 },
  },
  {
    id: 'cpt',
    tag: 'Trigger CPT',
    name: 'Costos por Transacción',
    url: '/admin/account/transaction-fees/ · evento PN_Trigger_CPT',
    color: '#953e91',
    previewSrc: '/screenshots/cpt.png',
    all: { views: 12627, uniqueViews: 11426, clicks: 1945, merchants: 11426, conversions: 455, gpvPositive: 446 },
    last30: { views: 4715, uniqueViews: 4631, clicks: 745, merchants: 4631, conversions: 130, gpvPositive: 126 },
  },
];

function sum(period: Period, key: keyof CampaignMetrics) {
  return CAMPAIGNS.reduce((acc, c) => acc + c[period][key], 0);
}

// Merchants únicos reales (deduplicados) entre las 3 campañas, calculado por fuera de
// Userflow cruzando los exports crudos de sesiones (Company: ID) de cada trigger.
// A diferencia del resto de las métricas generales, este valor NO es una suma de las
// 3 campañas — ya contempla el overlap de merchants que vieron más de un trigger.
const GENERAL_MERCHANTS_DEDUP: Record<Period, number> = {
  all: 21172,
  last30: 8650,
};

// Conversiones únicas reales (deduplicadas, atribuidas last-touch a UNA sola campaña
// cada una). A diferencia de una suma ingenua por campaña, cada merchant que convirtió
// habiendo visto más de un trigger ya está asignado a una sola — por eso la suma de las
// 3 campañas coincide exactamente con este total general.
const GENERAL_CONVERSIONS_DEDUP: Record<Period, number> = {
  all: 1370,
  last30: 418,
};

function pct(numerator: number, denominator: number) {
  if (!denominator) return '0%';
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function fmt(n: number) {
  return n.toLocaleString('es-AR');
}

export default function Page() {
  const [period, setPeriod] = useState<Period>('all');
  const [openPreview, setOpenPreview] = useState<Campaign['id'] | null>(null);

  const totals = {
    views: sum(period, 'views'),
    uniqueViews: sum(period, 'uniqueViews'),
    clicks: sum(period, 'clicks'),
    merchants: GENERAL_MERCHANTS_DEDUP[period],
    conversions: GENERAL_CONVERSIONS_DEDUP[period],
    gpvPositive: sum(period, 'gpvPositive'),
  };

  const ctr = pct(totals.clicks, totals.uniqueViews);
  const cvr = pct(totals.conversions, totals.merchants);
  const gpvShare = pct(totals.gpvPositive, totals.conversions);

  const periodLabel = period === 'all' ? 'All time (9 jun – 31 ago 2026)' : 'Últimos 30 días';

  return (
    <>
      <header className="hero">
        <div className="container">
          <span className="eyebrow">Pago Nube · Lifecycle AR</span>
          <h1>Resultados: Comms por Triggers de comportamiento</h1>
          <p className="subtitle">
            Triggers in-app que interceptan al merchant en el momento exacto en que evalúa medios
            de pago — Mercado Pago, Pagos Personalizados y Costos por Transacción — para presentar
            a Pago Nube como alternativa.
            <br />
            Audiencia: merchants con Pago Nube inactivo o que nunca activaron.
          </p>
          <div className="meta-row">
            <span>
              Responsable: <strong>Alan Lelli</strong>
            </span>
            <span>
              Activación: <strong>9 jun 2026</strong>
            </span>
            <span>
              Criterio de conversión: <strong>Activación de Pago Nube</strong>
            </span>
          </div>
        </div>
      </header>

      <div className="toggle-wrap">
        <div className="toggle">
          <button className={period === 'all' ? 'active' : ''} onClick={() => setPeriod('all')}>
            All time
          </button>
          <button
            className={period === 'last30' ? 'active' : ''}
            onClick={() => setPeriod('last30')}
          >
            Últimos 30 días
          </button>
        </div>
      </div>

      <main>
        <section className="block container">
          <div className="section-title">
            <h2>Resultados generales</h2>
            <span className="period-badge">{periodLabel}</span>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="label">Views totales</div>
              <div className="value">{fmt(totals.views)}</div>
              <div className="sub">Suma de las 3 comms</div>
            </div>
            <div className="kpi-card">
              <div className="label">Views únicos</div>
              <div className="value">{fmt(totals.uniqueViews)}</div>
              <div className="sub">Merchants-sesión únicos</div>
            </div>
            <div className="kpi-card">
              <div className="label">Clicks únicos</div>
              <div className="value">{fmt(totals.clicks)}</div>
              <div className="sub">Opción "Activar Pago Nube"</div>
            </div>
            <div className="kpi-card">
              <div className="label">CTR</div>
              <div className="value accent">{ctr}</div>
              <div className="sub">Clicks únicos / Views únicos</div>
            </div>
            <div className="kpi-card">
              <div className="label">Merchants únicos impactados</div>
              <div className="value">{fmt(totals.merchants)}</div>
              <div className="sub">Store IDs únicos entre views</div>
            </div>
            <div className="kpi-card">
              <div className="label">Conversiones</div>
              <div className="value">{fmt(totals.conversions)}</div>
              <div className="sub">Merchants que activaron Pago Nube</div>
            </div>
            <div className="kpi-card">
              <div className="label">CVR</div>
              <div className="value accent">{cvr}</div>
              <div className="sub">Conversiones / Merchants impactados</div>
            </div>
            <div className="kpi-card">
              <div className="label">Conversiones con GPV &gt; 0 (30d)</div>
              <div className="value accent">{gpvShare}</div>
              <div className="sub">{fmt(totals.gpvPositive)} de {fmt(totals.conversions)} conversiones venden</div>
            </div>
            <div className="kpi-card">
              <div className="label">Comunicaciones activas</div>
              <div className="value">3</div>
              <div className="sub">MP · PP · CPT</div>
            </div>
          </div>
        </section>

        <section className="block container">
          <div className="section-title">
            <h2>Desagregado por campaña</h2>
            <span className="period-badge">{periodLabel}</span>
          </div>

          <div className="campaign-grid">
            {CAMPAIGNS.map((c) => {
              const m = c[period];
              const cCtr = pct(m.clicks, m.uniqueViews);
              const cCvr = pct(m.conversions, m.merchants);
              return (
                <div
                  key={c.id}
                  className="campaign-card"
                  style={{ '--campaign-color': c.color } as React.CSSProperties}
                >
                  <div className="cc-head">
                    <span className="cc-tag">{c.tag}</span>
                  </div>
                  <h3>{c.name}</h3>
                  <div className="cc-url">{c.url}</div>

                  <button
                    type="button"
                    className="cc-preview-cta"
                    onClick={() => setOpenPreview(c.id)}
                  >
                    👁 Ver comunicación
                  </button>

                  <div className="cc-metric-row">
                    <span className="m-label">Views totales</span>
                    <span className="m-value">{fmt(m.views)}</span>
                  </div>
                  <div className="cc-metric-row">
                    <span className="m-label">Views únicos</span>
                    <span className="m-value">{fmt(m.uniqueViews)}</span>
                  </div>
                  <div className="cc-metric-row">
                    <span className="m-label">Clicks únicos (Sí)</span>
                    <span className="m-value">{fmt(m.clicks)}</span>
                  </div>
                  <div className="cc-metric-row highlight">
                    <span className="m-label">CTR</span>
                    <span className="m-value">{cCtr}</span>
                  </div>
                  <div className="cc-metric-row">
                    <span className="m-label">Merchants impactados</span>
                    <span className="m-value">{fmt(m.merchants)}</span>
                  </div>
                  <div className="cc-metric-row">
                    <span className="m-label">Conversiones</span>
                    <span className="m-value">{fmt(m.conversions)}</span>
                  </div>
                  <div className="cc-metric-row">
                    <span className="m-label">Con GPV &gt; 0 (30d)</span>
                    <span className="m-value">
                      {fmt(m.gpvPositive)} ({pct(m.gpvPositive, m.conversions)})
                    </span>
                  </div>
                  <div className="cc-metric-row highlight">
                    <span className="m-label">CVR</span>
                    <span className="m-value">{cCvr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {openPreview && (
          <div className="preview-modal-backdrop" onClick={() => setOpenPreview(null)}>
            <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="preview-modal-close"
                onClick={() => setOpenPreview(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>
              <Image
                src={CAMPAIGNS.find((c) => c.id === openPreview)!.previewSrc}
                alt={`Vista previa del trigger in-app: ${
                  CAMPAIGNS.find((c) => c.id === openPreview)!.name
                }`}
                width={560}
                height={620}
                className="preview-modal-img"
              />
              <p className="preview-modal-caption">
                {CAMPAIGNS.find((c) => c.id === openPreview)!.name}
              </p>
            </div>
          </div>
        )}

        <section className="block container">
          <div className="section-title">
            <h2>Insights & highlights</h2>
          </div>
          <div className="insights-panel">
            <div className="insight-item">
              <span className="bullet">1</span>
              <span className="txt">
                <strong>MP lidera tanto en CTR (42,8%) como en CVR (7,1% all time, atribución last-touch)</strong>:
                al interceptar al merchant justo cuando está a punto de activar Mercado Pago,
                genera casi 2,5x más clicks proporcionales que CPT — y esa mayor intención también
                se traduce en la conversión más alta de las 3 comms.
              </span>
            </div>
            <div className="insight-item">
              <span className="bullet">2</span>
              <span className="txt">
                <strong>PP queda segundo en conversión (CVR 6,2% all time)</strong>, pese a tener el
                reach más chico (4.145 merchants). El argumento de transferencias automáticas vs.
                verificación manual parece resolver una fricción real y concreta — MP y PP
                convierten a tasas más parecidas entre sí que frente a CPT.
              </span>
            </div>
            <div className="insight-item">
              <span className="bullet">3</span>
              <span className="txt">
                <strong>CPT tiene el mayor alcance (11.426 merchants impactados, ~46% del total)</strong>
                {' '}pero la conversión más baja (4,0%). El merchant que revisa costos por transacción
                está en modo comparativo, no necesariamente en modo de decisión inmediata — más
                awareness, menos acción directa.
              </span>
            </div>
            <div className="insight-item">
              <span className="bullet">4</span>
              <span className="txt">
                <strong>El CVR de últimos 30 días es más bajo que el CVR all time en las 3 comms</strong>
                {' '}(general: 4,8% vs 6,5%). Esperable: la conversión ahora exige que el cambio de
                estado de Pago Nube sea posterior a la exposición, así que los merchants expuestos
                hace más tiempo tuvieron más días para convertir dentro de esa ventana. No es una
                caída de performance de la comunicación.
              </span>
            </div>
            <div className="insight-item">
              <span className="bullet">5</span>
              <span className="txt">
                <strong>El CTR general se mantiene estable entre ventanas (28,1% all time vs 27,3% últimos 30 días)</strong>,
                lo que indica que el copy y el timing de los triggers siguen siendo relevantes para
                la audiencia sin señales de fatiga.
              </span>
            </div>
            <div className="insight-item">
              <span className="bullet">6</span>
              <span className="txt">
                <strong>1 de cada 6,7 merchants impactados vio más de un trigger</strong> (3.709 de
                24.881, ~15%). El cruce más frecuente es MP-CPT (1.951 merchants), seguido de
                MP-PP (1.241) — coherente con que ambos comparten el flujo de configuración de
                medios de pago. El número de "merchants únicos impactados" ya está corregido por
                este overlap.
              </span>
            </div>
            <div className="insight-item">
              <span className="bullet">7</span>
              <span className="txt">
                <strong>97,7% de las conversiones tienen GPV mayor a $0 en los últimos 30 días</strong>.
                Es una señal fuerte de calidad: la gran mayoría de las activaciones no son solo un
                cambio de estado en el sistema — el merchant efectivamente está cobrando con Pago
                Nube.
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="methodology">
        <div className="container">
          <h4>Metodología</h4>
          <ul>
            <li>
              Datos de exposición y clicks: Userflow (flows MP, PP, CPT). Views y views únicos por
              sesión de flow; clicks únicos por evento de botón "Activar Pago Nube".
            </li>
            <li>
              Merchants únicos impactados (por campaña): store IDs (companies) únicos entre
              quienes vieron cada trigger.
            </li>
            <li>
              <strong>Merchants únicos impactados (general):</strong> a diferencia del resto de
              las métricas generales, este número NO es una suma de las 3 campañas — es el total
              real deduplicado, calculado cruzando los exports crudos de sesiones de las 3 comms
              (Company: ID). Hay overlap real entre campañas: 3.709 merchants vieron más de un
              trigger, por lo que el total único (21.172 all time) es menor que la suma simple de
              los 3 campañas (24.881).
            </li>
            <li>
              <strong>Conversiones (por campaña):</strong> a cada merchant convertido se le asigna
              <strong> una sola campaña por atribución last-touch</strong> — la comm que vio más
              recientemente, entre las que vio antes de que cambiara su estado de Pago Nube. Por
              eso la suma de conversiones de MP + PP + CPT coincide exactamente con el total
              general (1.370 all time): ya no hay doble conteo de merchants que vieron más de un
              trigger.
            </li>
            <li>
              <strong>Conversiones (general):</strong> merchant impactado por al menos un trigger
              cuyo estado de Pago Nube en HubSpot (Nuvem Pago Monthly Status) es{' '}
              <code>first_activation</code>, <code>comeback</code> o <code>phoenix</code>{' '}
              (fintech, sincronizado desde HubSpot), Y cuya fecha de última actualización de ese
              estado es posterior a la primera vez que vio cualquiera de los triggers.
            </li>
            <li>
              <strong>Conversiones con GPV &gt; 0:</strong> de las conversiones, cuántas tienen GPV
              (Gross Payment Volume) mayor a $0 en los últimos 30 días (<code>gpv_30d_fintech</code>,
              HubSpot). Sirve como chequeo de calidad — confirma que la activación se tradujo en uso
              real, no solo en un cambio de estado.
            </li>
            <li>
              Limitación conocida: la fecha de "última actualización de estado" no siempre refleja
              el momento exacto del evento de activación (puede quedar congelada si el pipeline
              mensual no vuelve a escribir el registro), por lo que este número es una aproximación
              conservadora — probablemente subestima la conversión real atribuible al trigger antes
              que sobreestimarla.
            </li>
            <li>
              Views y views únicos generales sí son la suma directa de las 3 comms.
            </li>
            <li>Ventana "All time": 9 jun 2026 (activación) – 31 ago 2026.</li>
          </ul>
        </div>
      </footer>
    </>
  );
}
