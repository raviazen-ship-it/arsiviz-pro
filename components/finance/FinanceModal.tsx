'use client';

import React, { useState } from 'react';
import { AlertCircle, Calculator, Printer, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { ModalDialog } from '@/components/layout/ModalDialog';
import { formatArea, formatIDR } from '@/lib/format';
import { getCopy } from '@/lib/i18n';
import { calculateKPR } from '@/lib/kpr';
import {
  calculateRAB,
  DEFAULT_UNIT_RATES,
  EDITABLE_RATE_LABELS,
} from '@/lib/rab';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { EditableRateKey } from '@/types/project';

export function FinanceModal() {
  const project = useProjectStore((s) => s.project);
  const setUnitRateOverride = useProjectStore((s) => s.setUnitRateOverride);
  const setContingencyPercent = useProjectStore((s) => s.setContingencyPercent);
  const resetRabAssumptions = useProjectStore((s) => s.resetRabAssumptions);

  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const openModal = useUIStore((s) => s.openModal);
  const financeTab = useUIStore((s) => s.financeTab);
  const setFinanceTab = useUIStore((s) => s.setFinanceTab);
  const language = useUIStore((s) => s.language);
  const addToast = useUIStore((s) => s.addToast);

  const copy = getCopy(language);
  const rab = calculateRAB(project);

  const [showRateEditor, setShowRateEditor] = useState(false);

  // KPR Local Simulator State (synced initially with RAB total)
  const [customProjectCost, setCustomProjectCost] = useState<number>(rab.totalEstimatedCost);
  const [autoSyncRab, setAutoSyncRab] = useState(true);
  const [additionalLandCost, setAdditionalLandCost] = useState<number>(0);
  const [dpMode, setDpMode] = useState<'percent' | 'amount'>('percent');
  const [dpValue, setDpValue] = useState<number>(20);
  const [annualRate, setAnnualRate] = useState<number>(7.5);
  const [tenorYears, setTenorYears] = useState<number>(15);
  const [upfrontFees, setUpfrontFees] = useState<number>(15_000_000);

  const effectiveProjectCost = autoSyncRab ? rab.totalEstimatedCost : customProjectCost;

  const kprResult = calculateKPR(
    {
      projectPrice: effectiveProjectCost,
      additionalLandCost,
      downPaymentMode: dpMode,
      downPaymentValue: dpValue,
      annualInterestRate: annualRate,
      tenorYears,
      upfrontFees,
    },
    language
  );

  return (
    <ModalDialog
      open={activeModal === 'finance'}
      onClose={closeModal}
      title={copy.finance.modalTitle}
      subtitle={copy.finance.simulationBadge}
      maxWidthClass="max-w-5xl"
    >
      {/* Top Tab Switcher */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-studio-border pb-3">
        <div className="inline-flex rounded-lg border border-studio-border bg-studio-muted p-1">
          <button
            type="button"
            onClick={() => setFinanceTab('rab')}
            className={`min-h-[38px] rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              financeTab === 'rab'
                ? 'bg-studio-accent text-studio-accentText'
                : 'text-studio-text hover:bg-studio-elevated'
            }`}
          >
            {copy.finance.tabRab}
          </button>
          <button
            type="button"
            onClick={() => setFinanceTab('kpr')}
            className={`min-h-[38px] rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              financeTab === 'kpr'
                ? 'bg-studio-accent text-studio-accentText'
                : 'text-studio-text hover:bg-studio-elevated'
            }`}
          >
            {copy.finance.tabKpr}
          </button>
        </div>

        <button
          type="button"
          onClick={() => openModal('print-rab')}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-1.5 text-xs font-semibold text-studio-text hover:bg-studio-muted"
        >
          <Printer className="h-3.5 w-3.5" strokeWidth={1.7} />
          <span>{copy.finance.printBtn}</span>
        </button>
      </div>

      {financeTab === 'rab' ? (
        <div className="space-y-5">
          {/* Summary Metrics Row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-studio-border bg-studio-muted/50 p-3.5">
              <div className="text-xs text-studio-subtext">
                {language === 'id' ? 'Subtotal Konstruksi & Add-on' : 'Physical & Add-on Subtotal'}
              </div>
              <div className="mt-1 text-base font-bold tabular-nums text-studio-text">
                {formatIDR(rab.physicalSubtotal, language)}
              </div>
              <div className="mt-0.5 text-[11px] text-studio-subtext">
                {formatArea(rab.grossFloorArea, language)} ({project.dimensions.floors}{' '}
                {language === 'id' ? 'lantai' : 'fl'})
              </div>
            </div>

            <div className="rounded-lg border border-studio-border bg-studio-muted/50 p-3.5">
              <div className="text-xs text-studio-subtext">
                {language === 'id'
                  ? `Dana Cadangan (${rab.contingencyPercent}%)`
                  : `Contingency (${rab.contingencyPercent}%)`}
              </div>
              <div className="mt-1 text-base font-bold tabular-nums text-studio-text">
                {formatIDR(rab.contingencyAmount, language)}
              </div>
              <div className="mt-0.5 text-[11px] text-studio-subtext">
                {language === 'id' ? 'Dapat diubah 0% - 30%' : 'Adjustable 0% - 30%'}
              </div>
            </div>

            <div className="rounded-lg border border-studio-accent bg-studio-elevated p-3.5">
              <div className="text-xs font-medium text-studio-accent">
                {language === 'id' ? 'Total Estimasi Simulasi RAB' : 'Total Simulated RAB'}
              </div>
              <div className="mt-1 text-lg font-bold tabular-nums text-studio-text">
                {formatIDR(rab.totalEstimatedCost, language)}
              </div>
              <div className="mt-0.5 text-[11px] tabular-nums text-studio-subtext">
                ± {formatIDR(rab.estimatedCostPerM2, language)} / m²
              </div>
            </div>
          </div>

          {/* Unit Rate & Contingency Assumption Editor */}
          <div className="rounded-lg border border-studio-border bg-studio-elevated p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowRateEditor((v) => !v)}
                className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-studio-text hover:text-studio-accent"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-studio-accent" />
                <span>
                  {showRateEditor ? copy.finance.hideRatesBtn : copy.finance.editRatesBtn}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetRabAssumptions();
                  addToast(
                    'info',
                    language === 'id'
                      ? 'Asumsi harga satuan & contingency dikembalikan ke standar default.'
                      : 'Unit rates & contingency restored to baseline defaults.'
                  );
                }}
                className="inline-flex min-h-[34px] items-center gap-1 rounded-md border border-studio-border px-2.5 py-1 text-xs font-medium text-studio-subtext hover:bg-studio-muted hover:text-studio-text"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{copy.finance.restoreDefaultsBtn}</span>
              </button>
            </div>

            {showRateEditor && (
              <div className="mt-4 space-y-4 border-t border-studio-border pt-4">
                <div className="max-w-xs">
                  <label
                    htmlFor="rab-contingency-input"
                    className="block text-xs font-medium text-studio-text"
                  >
                    {copy.finance.contingencyLabel}
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="rab-contingency-input"
                      type="range"
                      min={0}
                      max={30}
                      step={1}
                      value={project.rabAssumptions.contingencyPercent}
                      onChange={(e) => setContingencyPercent(Number(e.target.value))}
                      className="flex-1 accent-[var(--accent-terracotta)]"
                    />
                    <span className="w-12 text-right text-xs font-semibold tabular-nums text-studio-text">
                      {project.rabAssumptions.contingencyPercent}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(Object.keys(DEFAULT_UNIT_RATES) as EditableRateKey[]).map((rateKey) => {
                    const meta = EDITABLE_RATE_LABELS[rateKey];
                    const currentVal =
                      project.rabAssumptions.unitRateOverrides[rateKey] ??
                      DEFAULT_UNIT_RATES[rateKey];
                    return (
                      <div
                        key={rateKey}
                        className="rounded-md border border-studio-border bg-studio-muted/40 p-2.5"
                      >
                        <label
                          htmlFor={`rate-${rateKey}`}
                          className="block text-[11px] font-medium text-studio-text"
                        >
                          {language === 'id' ? meta.labelId : meta.labelEn}{' '}
                          <span className="text-studio-subtext">
                            / {language === 'id' ? meta.unitId : meta.unitEn}
                          </span>
                        </label>
                        <input
                          id={`rate-${rateKey}`}
                          type="number"
                          min={0}
                          step={10000}
                          value={currentVal}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!Number.isNaN(val)) {
                              setUnitRateOverride(rateKey, val);
                            }
                          }}
                          className="mt-1 w-full rounded border border-studio-borderStrong bg-studio-elevated px-2 py-1 text-xs font-semibold tabular-nums text-studio-text"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 12-Category BoQ Breakdown Table */}
          <div className="overflow-x-auto rounded-lg border border-studio-border">
            <table className="w-full min-w-[640px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-studio-border bg-studio-muted/70 text-studio-subtext">
                  <th className="px-3 py-2.5 font-semibold">
                    {language === 'id' ? 'Komponen Pekerjaan (BoQ)' : 'Work Category (BoQ)'}
                  </th>
                  <th className="px-3 py-2.5 font-semibold text-right">
                    {language === 'id' ? 'Kuantitas' : 'Qty'}
                  </th>
                  <th className="px-3 py-2.5 font-semibold">
                    {language === 'id' ? 'Satuan' : 'Unit'}
                  </th>
                  <th className="px-3 py-2.5 font-semibold text-right">
                    {language === 'id' ? 'Harga Satuan' : 'Unit Price'}
                  </th>
                  <th className="px-3 py-2.5 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border bg-studio-elevated">
                {rab.items.map((item) => (
                  <tr key={item.id} className="hover:bg-studio-muted/40">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-studio-text">
                        {language === 'id' ? item.titleId : item.titleEn}
                      </div>
                      <div className="mt-0.5 text-[11px] text-studio-subtext">
                        {language === 'id' ? item.basisId : item.basisEn}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium tabular-nums text-studio-text">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2.5 text-studio-subtext">
                      {language === 'id' ? item.unitId : item.unitEn}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-studio-subtext">
                      {formatIDR(item.unitPrice, language)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-studio-text">
                      {formatIDR(item.subtotal, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-studio-borderStrong bg-studio-muted/70 font-bold text-studio-text">
                  <td colSpan={4} className="px-3 py-3 text-right">
                    {language === 'id' ? 'TOTAL ESTIMASI SIMULASI' : 'TOTAL SIMULATED ESTIMATE'}
                  </td>
                  <td className="px-3 py-3 text-right text-sm tabular-nums">
                    {formatIDR(rab.totalEstimatedCost, language)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="rounded-lg border border-studio-border bg-studio-muted/50 p-3 text-xs leading-relaxed text-studio-subtext">
            {copy.finance.rabDisclaimer}
          </p>
        </div>
      ) : (
        /* =========================================================
           KPR / MORTGAGE SIMULATOR TAB
           ========================================================= */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Inputs */}
          <div className="space-y-4 lg:col-span-6">
            <div className="rounded-lg border border-studio-border bg-studio-elevated p-4 space-y-3.5">
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="kpr-base-cost"
                    className="text-xs font-semibold text-studio-text"
                  >
                    {copy.finance.kprBasePrice}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomProjectCost(rab.totalEstimatedCost);
                      setAutoSyncRab(true);
                    }}
                    className="text-[11px] font-medium text-studio-accent hover:underline"
                  >
                    {copy.finance.kprUseRabBtn}
                  </button>
                </div>
                <input
                  id="kpr-base-cost"
                  type="number"
                  min={0}
                  step={5_000_000}
                  value={effectiveProjectCost}
                  onChange={(e) => {
                    setAutoSyncRab(false);
                    setCustomProjectCost(parseFloat(e.target.value) || 0);
                  }}
                  className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-2 text-xs font-semibold tabular-nums text-studio-text"
                />
              </div>

              <div>
                <label
                  htmlFor="kpr-land-cost"
                  className="block text-xs font-semibold text-studio-text"
                >
                  {copy.finance.kprLandCost}
                </label>
                <input
                  id="kpr-land-cost"
                  type="number"
                  min={0}
                  step={10_000_000}
                  value={additionalLandCost}
                  onChange={(e) => setAdditionalLandCost(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-2 text-xs font-semibold tabular-nums text-studio-text"
                />
              </div>

              {/* Down Payment Mode & Value */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="kpr-dp-input" className="text-xs font-semibold text-studio-text">
                    {copy.finance.kprDpLabel}
                  </label>
                  <div className="inline-flex rounded border border-studio-border p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setDpMode('percent');
                        setDpValue(20);
                      }}
                      className={`rounded px-2 py-0.5 font-medium ${
                        dpMode === 'percent'
                          ? 'bg-studio-accent text-studio-accentText'
                          : 'text-studio-subtext'
                      }`}
                    >
                      {copy.finance.kprDpModePct}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDpMode('amount');
                        setDpValue(Math.round((customProjectCost + additionalLandCost) * 0.2));
                      }}
                      className={`rounded px-2 py-0.5 font-medium ${
                        dpMode === 'amount'
                          ? 'bg-studio-accent text-studio-accentText'
                          : 'text-studio-subtext'
                      }`}
                    >
                      {copy.finance.kprDpModeIdr}
                    </button>
                  </div>
                </div>
                <input
                  id="kpr-dp-input"
                  type="number"
                  min={0}
                  step={dpMode === 'percent' ? 1 : 5_000_000}
                  value={dpValue}
                  onChange={(e) => setDpValue(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-2 text-xs font-semibold tabular-nums text-studio-text"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="kpr-rate" className="block text-xs font-semibold text-studio-text">
                    {copy.finance.kprInterest}
                  </label>
                  <input
                    id="kpr-rate"
                    type="number"
                    min={0}
                    max={30}
                    step={0.1}
                    value={annualRate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setAnnualRate(Number.isNaN(val) ? 0 : val);
                    }}
                    className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-2 text-xs font-semibold tabular-nums text-studio-text"
                  />
                </div>

                <div>
                  <label htmlFor="kpr-tenor" className="block text-xs font-semibold text-studio-text">
                    {copy.finance.kprTenor}
                  </label>
                  <input
                    id="kpr-tenor"
                    type="number"
                    min={1}
                    max={35}
                    step={1}
                    value={tenorYears}
                    onChange={(e) => setTenorYears(parseInt(e.target.value, 10) || 1)}
                    className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-2 text-xs font-semibold tabular-nums text-studio-text"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="kpr-fees" className="block text-xs font-semibold text-studio-text">
                  {copy.finance.kprUpfrontFees}
                </label>
                <input
                  id="kpr-fees"
                  type="number"
                  min={0}
                  step={1_000_000}
                  value={upfrontFees}
                  onChange={(e) => setUpfrontFees(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-2 text-xs font-semibold tabular-nums text-studio-text"
                />
              </div>
            </div>
          </div>

          {/* Right KPR Outputs */}
          <div className="space-y-4 lg:col-span-6">
            {!kprResult.isValid ? (
              <div
                role="alert"
                className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 space-y-1.5 text-xs text-studio-text"
              >
                <div className="flex items-center gap-1.5 font-semibold text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    {language === 'id' ? 'Periksa Input Simulasi KPR' : 'Check Mortgage Inputs'}
                  </span>
                </div>
                {kprResult.errors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-studio-border bg-studio-elevated p-4 space-y-4">
                <div className="rounded-lg border border-studio-accent bg-studio-muted/40 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-studio-accent">
                    <Calculator className="h-4 w-4" />
                    <span>{copy.finance.kprMonthly}</span>
                  </div>
                  <div className="mt-1 text-2xl font-bold tabular-nums text-studio-text">
                    {formatIDR(kprResult.monthlyInstallment, language)}
                    <span className="text-xs font-normal text-studio-subtext">
                      {' '}
                      / {language === 'id' ? 'bulan' : 'mo'}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] tabular-nums text-studio-subtext">
                    {tenorYears * 12} {language === 'id' ? 'bulan cicilan' : 'monthly periods'} ·{' '}
                    {annualRate}% p.a.
                  </div>
                </div>

                <dl className="divide-y divide-studio-border text-xs">
                  <div className="flex justify-between py-2">
                    <dt className="text-studio-subtext">
                      {language === 'id' ? 'Total Harga Dasar Properti' : 'Total Property Base'}
                    </dt>
                    <dd className="font-semibold tabular-nums text-studio-text">
                      {formatIDR(kprResult.totalPropertyBase, language)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-studio-subtext">
                      {copy.finance.kprDpRatio} ({kprResult.downPaymentPercent}%)
                    </dt>
                    <dd className="font-semibold tabular-nums text-studio-text">
                      {formatIDR(kprResult.downPaymentAmount, language)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-studio-subtext">{copy.finance.kprPrincipal}</dt>
                    <dd className="font-semibold tabular-nums text-studio-text">
                      {formatIDR(kprResult.principalLoan, language)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-studio-subtext">{copy.finance.kprTotalInterest}</dt>
                    <dd className="font-semibold tabular-nums text-studio-text">
                      {formatIDR(kprResult.totalInterest, language)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-studio-subtext">{copy.finance.kprTotalLoanPay}</dt>
                    <dd className="font-semibold tabular-nums text-studio-text">
                      {formatIDR(kprResult.totalLoanPayment, language)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-studio-subtext">{copy.finance.kprUpfrontCash}</dt>
                    <dd className="font-bold tabular-nums text-studio-text">
                      {formatIDR(kprResult.totalCashNeededUpfront, language)}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <p className="rounded-lg border border-studio-border bg-studio-muted/50 p-3 text-xs leading-relaxed text-studio-subtext">
              {copy.finance.kprDisclaimer}
            </p>
          </div>
        </div>
      )}
    </ModalDialog>
  );
}
