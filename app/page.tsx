'use client';

import { useState } from 'react';

type Period = 'all' | 'last30';

type CampaignMetrics = {
  views: number;
  uniqueViews: number;
  clicks: number;
  merchants: number;
  conversions: number;
};

type Campaign = {
  id: 'mp' | 'pp' | 'cpt';
  tag: string;
  name: string;
  url: string;
  color: string;
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
    all: { views: 9114, uniqueViews: 9017, clicks: 3832, merchants: 8966, conversions: 1552 },
    last30: { views: 3717, uniqueViews: 3710, clicks: 1553, merchants: 3699, conversions: 443 },
  },
  {
    id: 'pp',
    tag: 'Trigger PP',
    name: 'Configuración Pagos Personalizados',
    url: '/admin/settings/payments · evento PN_Trigger_PP',
    color: '#00b4e6',
    all: { views: 4069, uniqueViews: 3988, clicks: 1019, merchants: 3972, conversions: 967 },
    last30: { views: 1656, uniqueViews: 1653, clicks: 412, merchants: 1649, conversions: 348 },
  },
  {
    id: 'cpt',
    tag: 'Trigger CPT',
    name: 'Costos por Transacción',
    url: '/admin/account/transaction-fees/ · evento PN_Trigger_CPT',
    color: '#953e91',
    all: { views: 12181, uniqueViews: 11229, clicks: 1867, merchants: 11057, conversions: 1179 },
    last30: { views: 4813, uniqueViews: 4769, clicks: 755, merchants: 4722, conversions: 327 },
  },
];

function sum(period: Period, key: keyof CampaignMetrics) {
  return CAMPAIGNS.reduce((acc, c) => acc + c[period][key], 0);
}

function pct(numerator: number, denominator: number) {
  if (!denominator) return '0%';
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function fmt(n: number) {
  return n.toLocaleString('es-AR');
}
// Merchants únicos reales (deduplicados) entre las 3 campañas, calculado por fuera de
// Userflow cruzando los exports crudos de sesiones (Company: ID) de cada trigger.
// A diferencia del resto de las métricas generales, este valor NO es una suma de las
// 3 campañas — ya contempla el overlap de merchants que vieron más de un trigger.
const GENERAL_MERCHANTS_DEDUP: Record<Period, number> = {
  all: 20489,
  last30: 8835,
};

export default function Page() {
  const [period, setPeriod] = useState<Period>('all');

  const totals = {
    views: sum(period, 'views'),
    uniqueViews: sum(period, 'uniqueViews'),
    clicks: sum(period, 'clicks'),
    merchants: GENERAL_MERCHANTS_DEDUP[period],
    conversions: sum(period, 'conversions'),
  };

  const ctr = pct(totals.clicks, totals.uniqueViews);
  const cvr = pct(totals.conversions, totals.merchants);

  const periodLabel = period === 'all' ? 'All time (9 jun – 28 ago 2026)' : 'Últimos 30 días';

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
                  <div className="cc-metric-row highlight">
                    <span className="m-label">CVR</span>
                    <span className="m-value">{cCvr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="block container">
          <div className="section-title">
            <h2>Insights & highlights</h2>
          </div>
          <div className="insights-panel">
            <div className="insight-item">
              <span className="bullet">1</span>
              <span className="txt">
                <strong>MP es el trigger con mayor engagement (CTR 42,5% all time)</strong>: al
                interceptar al merchant justo cuando está a punto de activar Mercado Pago, genera
                casi 2,5x más clicks proporcionales que CPT. Es el momento de mayor tensión
                competitiva del funnel.
              </span>
            </div>
            <div className="insight-item">
              <span className="bullet">2</span>
              <span className="txt">
                <strong>PP convierte mejor que los otros dos triggers (CVR 24,3% all time)</strong>,
                pese a tener el reach más chico (3.972 merchants). El argumento de transferencias
                automáticas vs. verificación manual parece resolver una fricción real y concreta,
                lo que se traduce en mayor conversión efectiva.
              </span>
            </div>
            <div className="insight-item">
              <span className="bullet">3</span>
              <span className="txt">
                <strong>CPT tiene el mayor alcance (11.057 merchants impactados, ~46% del total)</strong>
                {' '}pero la conversión más baja (10,7%). El merchant que revisa costos por transacción
                está en modo comparativo, no necesariamente en modo de decisión inmediata — más
                awareness, menos acción directa.
              </span>
            </div>
            <div className="insight-item">
              <span className="bullet">4</span>
              <span className="txt">
                <strong>El CVR de últimos 30 días es más bajo que el CVR all time en las 3 comms</strong>
                {' '}(general: 11,1% vs 15,4%). Esto es esperable dado que la conversión se mide sobre el
                estado actual de activación: los merchants expuestos hace más tiempo tuvieron más
                días para convertir. No es una caída de performance de la comunicación.
              </span>
            </div>
            <div className="insight-item">
              <span className="bullet">5</span>
              <span className="txt">
                <strong>El CTR general se mantiene estable entre ventanas (27,7% all time vs 26,9% últimos 30 días)</strong>,
                lo que indica que el copy y el timing de los triggers siguen siendo relevantes para
                la audiencia sin señales de fatiga.
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
              (Company: ID). Hay overlap real entre campañas: 3.559 merchants vieron más de un
              trigger, por lo que el total único (20.489 all time) es menor que la suma simple de
              los 3 campañas (24.048).
            </li>
            <li>
              Conversiones: cruce de merchants impactados por cada trigger contra el estado actual
              de activación de Pago Nube (NuvemLens / atributo sincronizado de Fintech). Es un
              snapshot del estado vigente, no una fecha exacta de activación post-exposición.
              El total general de conversiones sí es una <strong>suma simple</strong> de las 3
              campañas (no deduplicada como los merchants impactados): no existe hoy una tabla de
              activación de Pago Nube AR en el warehouse que permita cruzar la lista completa de
              merchants únicos contra su estado de activación, así que puede sobreestimar
              levemente la conversión real si un mismo merchant convertido vio más de un trigger.
            </li>
            <li>
              Views y views únicos generales sí son la suma directa de las 3 comms.
            </li>
            <li>Ventana "All time": 9 jun 2026 (activación) – 28 ago 2026.</li>
          </ul>
        </div>
      </footer>
    </>
  );
}
