'use client';
// components/WebVitals.tsx — real-visit speed (PRF-1): LCP, CLS, INP, FCP and TTFB measured on the person's own device by Next.js
// (next/web-vitals — no extra library), sent as allow-listed telemetry: the metric, its number and its rating — nothing personal.
import { useReportWebVitals } from 'next/web-vitals';
import { telemetry } from '@/lib/telemetry/client';

type Metric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];
const send = (m: Metric) => { telemetry.report({ event: 'web_vital', metric: m.name, value: m.value, rating: m.rating }); };   // stable: defined once

export function WebVitals() {
  useReportWebVitals(send);
  return null;
}
