'use client';

import React, { useState } from 'react';
import { CalendarCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ModalDialog } from '@/components/layout/ModalDialog';
import { HOUSE_SPECS } from '@/lib/catalog';
import { formatArea, formatDateTime, formatIDR } from '@/lib/format';
import { calculateRAB } from '@/lib/rab';
import { getBackendStatus, loadDemoBookings, saveDemoBooking } from '@/lib/storage';
import { BookingInputDraft, validateBookingInput } from '@/lib/validation';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import {
  BookingRecord,
  ConsultationSlot,
  ConsultationType,
  ProjectConfig,
  RABSummary,
} from '@/types/project';

const SLOTS: ConsultationSlot[] = [
  '09:00 - 10:00',
  '11:00 - 12:00',
  '14:00 - 15:00',
  '16:00 - 17:00',
];

function createBookingRecord(
  draft: BookingInputDraft,
  project: ProjectConfig,
  rab: RABSummary,
  isCloudConfigured: boolean,
  snapshot?: string
): BookingRecord {
  const now = new Date();
  return {
    id: `bk_${now.getTime().toString(36)}`,
    createdAt: now.toISOString(),
    name: draft.name.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim(),
    consultationType: draft.consultationType,
    preferredDate: draft.preferredDate,
    preferredSlot: draft.preferredSlot,
    notes: draft.notes.trim(),
    consentToContact: draft.consentToContact,
    deliveryStatus: isCloudConfigured ? 'backend-delivered' : 'local-demo-saved',
    projectSummary: {
      projectId: project.projectId,
      projectName: project.name,
      houseType: project.houseType,
      landAreaM2: rab.landArea,
      buildingAreaM2: rab.grossFloorArea,
      floors: project.dimensions.floors,
      estimatedRabIdr: rab.totalEstimatedCost,
      snapshotDataUrl: snapshot,
    },
  };
}

export function BookingModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  if (activeModal !== 'booking') return null;
  return <BookingModalForm />;
}

function BookingModalForm() {
  const project = useProjectStore((s) => s.project);
  const closeModal = useUIStore((s) => s.closeModal);
  const language = useUIStore((s) => s.language);
  const snapshotProvider = useUIStore((s) => s.snapshotProvider);
  const addToast = useUIStore((s) => s.addToast);

  const backend = getBackendStatus();
  const rab = calculateRAB(project);
  const spec = HOUSE_SPECS[project.houseType];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consultationType, setConsultationType] =
    useState<ConsultationType>('concept-design');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredSlot, setPreferredSlot] = useState<ConsultationSlot>('11:00 - 12:00');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof BookingInputDraft, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [savedBookings, setSavedBookings] = useState<BookingRecord[]>(() =>
    loadDemoBookings()
  );
  const [lastSubmitted, setLastSubmitted] = useState<BookingRecord | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const draft: BookingInputDraft = {
      name,
      email,
      phone,
      consultationType,
      preferredDate,
      preferredSlot,
      notes,
      consentToContact: consent,
    };

    const validation = validateBookingInput(draft, language);
    if (!validation.valid) {
      setErrors(validation.fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const snapshot = snapshotProvider ? snapshotProvider() : project.thumbnailDataUrl;
    const record = createBookingRecord(
      draft,
      project,
      rab,
      backend.isCloudConfigured,
      snapshot
    );

    const saveRes = saveDemoBooking(record, language);
    setSubmitting(false);

    if (!saveRes.ok) {
      addToast('error', saveRes.error || 'Failed to store consultation draft');
      return;
    }

    setLastSubmitted(record);
    setSavedBookings(loadDemoBookings());
    addToast(
      'info',
      language === 'id'
        ? 'Draf permintaan konsultasi disimpan di browser lokal (Demo Mode).'
        : 'Consultation request saved locally in this browser (Demo Mode).'
    );
  };

  return (
    <ModalDialog
      open={true}
      onClose={closeModal}
      title={
        language === 'id'
          ? 'Permintaan Konsultasi Arsitek'
          : 'Request Architect Studio Consultation'
      }
      subtitle={
        language === 'id'
          ? 'Lampirkan ringkasan proyek 3D dan RAB simulasi Anda untuk diskusi teknis awal.'
          : 'Attach your 3D concept and simulated RAB summary for an initial architectural review.'
      }
      maxWidthClass="max-w-3xl"
    >
      {/* Honest Demo Mode Notice */}
      <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-studio-text">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <span className="font-semibold">
            {language === 'id' ? 'Status Demo Mode Lokal: ' : 'Local Demo Mode Notice: '}
          </span>
          {language === 'id'
            ? 'Kalender real-time dan server email arsitek belum dihubungkan. Pengisian formulir ini akan menyimpan permintaan sebagai draf lokal di perangkat Anda dan belum mengirim jadwal ke biro arsitek.'
            : 'Live calendar booking and studio backend delivery are not connected. Submitting this form records a local demo request in this browser without transmitting data to an external architect.'}
        </div>
      </div>

      {lastSubmitted && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-studio-sage bg-studio-sageBg p-4 text-xs text-studio-text"
        >
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-studio-sage" />
            <span>
              {language === 'id'
                ? 'Tersimpan sebagai Permintaan Demo Lokal (Belum Dikirim ke Arsitek)'
                : 'Recorded as Local Demo Request (Not Sent Externally)'}
            </span>
          </div>
          <p className="mt-1 text-studio-subtext">
            {language === 'id'
              ? `Jadwal preferensi ${lastSubmitted.preferredDate} (${lastSubmitted.preferredSlot}) untuk proyek "${lastSubmitted.projectSummary.projectName}" telah dicatat di browser ini.`
              : `Preferred slot ${lastSubmitted.preferredDate} (${lastSubmitted.preferredSlot}) for "${lastSubmitted.projectSummary.projectName}" has been saved locally.`}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Attached Project Summary Card */}
        <div className="rounded-lg border border-studio-border bg-studio-muted/50 p-3.5 text-xs">
          <div className="font-semibold text-studio-text">
            {language === 'id'
              ? 'Lampiran Ringkasan Konfigurasi Aktif'
              : 'Attached Active Configuration Summary'}
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4 text-[11px]">
            <div>
              <span className="text-studio-subtext">
                {language === 'id' ? 'Proyek: ' : 'Project: '}
              </span>
              <strong className="text-studio-text">{project.name}</strong>
            </div>
            <div>
              <span className="text-studio-subtext">
                {language === 'id' ? 'Tipe: ' : 'Type: '}
              </span>
              <strong className="text-studio-text">
                {language === 'id' ? spec.nameId : spec.nameEn}
              </strong>
            </div>
            <div>
              <span className="text-studio-subtext">
                {language === 'id' ? 'Bangunan: ' : 'GFA: '}
              </span>
              <strong className="tabular-nums text-studio-text">
                {formatArea(rab.grossFloorArea, language)} ({project.dimensions.floors}F)
              </strong>
            </div>
            <div>
              <span className="text-studio-subtext">RAB: </span>
              <strong className="tabular-nums text-studio-text">
                {formatIDR(rab.totalEstimatedCost, language)}
              </strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bk-name" className="block text-xs font-semibold text-studio-text">
              {language === 'id' ? 'Nama Lengkap *' : 'Full Name *'}
            </label>
            <input
              id="bk-name"
              type="text"
              placeholder={language === 'id' ? 'Nama Anda' : 'Your Name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-2 text-xs text-studio-text"
            />
            {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="bk-type" className="block text-xs font-semibold text-studio-text">
              {language === 'id' ? 'Topik Konsultasi' : 'Consultation Topic'}
            </label>
            <select
              id="bk-type"
              value={consultationType}
              onChange={(e) => setConsultationType(e.target.value as ConsultationType)}
              className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-2 text-xs text-studio-text"
            >
              <option value="concept-design">
                {language === 'id' ? 'Konsep & Desain Arsitektur' : 'Concept & Architectural Design'}
              </option>
              <option value="rab-review">
                {language === 'id' ? 'Evaluasi Anggaran & RAB' : 'Budget & BoQ Review'}
              </option>
              <option value="renovation">
                {language === 'id' ? 'Pengembangan / Renovasi' : 'Renovation & Extension'}
              </option>
              <option value="initial-consultation">
                {language === 'id' ? 'Konsultasi Awal Lahan & PBG' : 'Initial Site & Permit Check'}
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="bk-email" className="block text-xs font-semibold text-studio-text">
              {language === 'id'
                ? 'Alamat Email (isi email atau nomor kontak)'
                : 'Email Address (email or phone required)'}
            </label>
            <input
              id="bk-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-2 text-xs text-studio-text"
            />
            {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="bk-phone" className="block text-xs font-semibold text-studio-text">
              {language === 'id' ? 'Nomor Telepon / WhatsApp' : 'Phone / WhatsApp Number'}
            </label>
            <input
              id="bk-phone"
              type="tel"
              placeholder="+62 812..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-2 text-xs text-studio-text"
            />
            {errors.phone && !errors.email && (
              <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="bk-date" className="block text-xs font-semibold text-studio-text">
              {language === 'id'
                ? 'Preferensi Tanggal (Ilustrasi Slot) *'
                : 'Preferred Date (Illustrative) *'}
            </label>
            <input
              id="bk-date"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-2 text-xs text-studio-text"
            />
            {errors.preferredDate && (
              <p className="mt-1 text-[11px] text-red-500">{errors.preferredDate}</p>
            )}
          </div>

          <div>
            <span className="block text-xs font-semibold text-studio-text">
              {language === 'id' ? 'Preferensi Jam (WIB)' : 'Preferred Time Window'}
            </span>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setPreferredSlot(slot)}
                  aria-pressed={preferredSlot === slot}
                  className={`min-h-[36px] rounded-md border text-xs font-medium tabular-nums ${
                    preferredSlot === slot
                      ? 'border-studio-accent bg-studio-accent text-studio-accentText'
                      : 'border-studio-border bg-studio-elevated text-studio-text hover:bg-studio-muted'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="bk-notes" className="block text-xs font-semibold text-studio-text">
            {language === 'id'
              ? 'Catatan Kebutuhan Ruang / Lokasi Kavling'
              : 'Spatial Needs & Site Location Notes'}
          </label>
          <textarea
            id="bk-notes"
            rows={3}
            placeholder={
              language === 'id'
                ? 'Tuliskan kota lokasi lahan, jumlah kamar tidur yang dibutuhkan, atau pertanyaan khusus...'
                : 'Describe your plot city, bedroom requirements, or specific questions...'
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-2 text-xs text-studio-text"
          />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-xs text-studio-text">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-[var(--accent-terracotta)]"
            />
            <span>
              {language === 'id'
                ? 'Saya menyetujui data kontak dan ringkasan konfigurasi proyek ini dicatat untuk keperluan tindak lanjut konsultasi (dalam mode demo, data hanya disimpan lokal di perangkat ini).'
                : 'I consent to recording these contact details and project specifications for consultation follow-up (stored locally only while in Demo Mode).'}
            </span>
          </label>
          {errors.consentToContact && (
            <p className="mt-1 text-[11px] text-red-500">{errors.consentToContact}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={closeModal}
            className="min-h-[42px] rounded-md border border-studio-border px-4 py-2 text-xs font-medium text-studio-text hover:bg-studio-muted"
          >
            {language === 'id' ? 'Tutup' : 'Close'}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-md bg-studio-accent px-4 py-2 text-xs font-semibold text-studio-accentText hover:bg-studio-accentHover disabled:opacity-50"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>
              {language === 'id'
                ? 'Simpan Permintaan Demo Lokal'
                : 'Save Local Demo Request'}
            </span>
          </button>
        </div>
      </form>

      {/* Saved Local Demo Requests History */}
      {savedBookings.length > 0 && (
        <div className="mt-6 border-t border-studio-border pt-4">
          <h3 className="text-xs font-semibold text-studio-text">
            {language === 'id'
              ? `Riwayat Draf Permintaan di Browser Ini (${savedBookings.length})`
              : `Local Demo Requests Recorded in This Browser (${savedBookings.length})`}
          </h3>
          <div className="mt-2 space-y-2">
            {savedBookings.slice(0, 4).map((bk) => (
              <div
                key={bk.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-studio-border bg-studio-muted/40 px-3 py-2 text-xs"
              >
                <div>
                  <span className="font-semibold text-studio-text">{bk.name}</span> ·{' '}
                  <span className="text-studio-subtext">{bk.projectSummary.projectName}</span>
                </div>
                <div className="tabular-nums text-[11px] text-studio-subtext">
                  {bk.preferredDate} ({bk.preferredSlot}) ·{' '}
                  {formatDateTime(bk.createdAt, language)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ModalDialog>
  );
}
