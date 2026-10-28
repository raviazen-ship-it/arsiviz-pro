'use client';

import React, { useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FilePlus2,
  FolderOpen,
  GitCompare,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { HOUSE_SPECS } from '@/lib/catalog';
import { formatArea, formatCompactIDR, formatDateTime } from '@/lib/format';
import { getCopy } from '@/lib/i18n';
import { calculateRAB } from '@/lib/rab';
import { createProjectExportPayload, getBackendStatus } from '@/lib/storage';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';

export function ProjectManagerPanel() {
  const project = useProjectStore((s) => s.project);
  const savedProjects = useProjectStore((s) => s.savedProjects);
  const hasUnsavedChanges = useProjectStore((s) => s.hasUnsavedChanges);
  const lastSavedAt = useProjectStore((s) => s.lastSavedAt);
  const storageWarning = useProjectStore((s) => s.storageWarning);

  const setProjectName = useProjectStore((s) => s.setProjectName);
  const saveCurrentProject = useProjectStore((s) => s.saveCurrentProject);
  const loadSavedProject = useProjectStore((s) => s.loadSavedProject);
  const duplicateSavedProject = useProjectStore((s) => s.duplicateSavedProject);
  const renameSavedProject = useProjectStore((s) => s.renameSavedProject);
  const deleteSavedProject = useProjectStore((s) => s.deleteSavedProject);
  const createNewProject = useProjectStore((s) => s.createNewProject);
  const resetConfiguration = useProjectStore((s) => s.resetConfiguration);
  const importProjectJson = useProjectStore((s) => s.importProjectJson);

  const language = useUIStore((s) => s.language);
  const snapshotProvider = useUIStore((s) => s.snapshotProvider);
  const addToast = useUIStore((s) => s.addToast);
  const openConfirm = useUIStore((s) => s.openConfirm);
  const openModal = useUIStore((s) => s.openModal);
  const setCompareIds = useUIStore((s) => s.setCompareIds);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const copy = getCopy(language);
  const backendStatus = getBackendStatus();

  const handleSave = () => {
    const thumb = snapshotProvider ? snapshotProvider() : undefined;
    const res = saveCurrentProject(language, thumb);
    if (res.ok) {
      addToast(
        'success',
        language === 'id'
          ? `Proyek "${project.name}" disimpan.`
          : `Project "${project.name}" saved.`
      );
    } else {
      addToast('error', res.error || 'Error');
    }
  };

  const handleExport = () => {
    const payload = createProjectExportPayload(project);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeSlug = project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    link.href = url;
    link.download = `${safeSlug || 'arsiviz-project'}-v${project.schemaVersion}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast(
      'success',
      language === 'id'
        ? 'File JSON konfigurasi berhasil diunduh.'
        : 'Project JSON exported cleanly.'
    );
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const res = importProjectJson(text, language);
      if (!res.ok) {
        setImportError(res.error || 'Invalid JSON');
        addToast(
          'error',
          res.error ||
            (language === 'id' ? 'File impor tidak valid.' : 'Imported JSON is invalid.')
        );
        return;
      }
      addToast(
        'success',
        res.migrated
          ? language === 'id'
            ? `Proyek "${res.project?.name}" diimpor & dimigrasikan ke skema terbaru.`
            : `Project "${res.project?.name}" imported and migrated to current schema.`
          : language === 'id'
          ? `Proyek "${res.project?.name}" berhasil dimuat.`
          : `Project "${res.project?.name}" imported cleanly.`
      );
    } catch {
      const msg =
        language === 'id'
          ? 'Gagal membaca file JSON. Pastikan file tidak rusak.'
          : 'Failed to read JSON file. Please verify file integrity.';
      setImportError(msg);
      addToast('error', msg);
    }
  };

  const handleOpenCompare = () => {
    if (savedProjects.length >= 2) {
      setCompareIds([savedProjects[0].projectId, savedProjects[1].projectId]);
    }
    openModal('compare');
  };

  return (
    <div className="space-y-4">
      {/* Demo Mode Transparency Banner */}
      <div className="rounded-lg border border-studio-border bg-studio-muted/70 px-3 py-2 text-[11px] leading-relaxed text-studio-subtext">
        <span className="font-semibold text-studio-text">
          {language === 'id' ? backendStatus.modeLabelId : backendStatus.modeLabelEn}:{' '}
        </span>
        {language === 'id' ? backendStatus.detailId : backendStatus.detailEn}
      </div>

      {storageWarning && (
        <div
          role="alert"
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-studio-text"
        >
          {storageWarning}
        </div>
      )}

      {/* Active Project Editor */}
      <div className="rounded-lg border border-studio-border bg-studio-elevated p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-studio-text">
            {copy.projectPanel.activeProject}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
              hasUnsavedChanges
                ? 'bg-amber-500/15 text-studio-text'
                : 'bg-studio-sageBg text-studio-sage'
            }`}
          >
            {hasUnsavedChanges ? copy.header.unsaved : copy.header.saved}
          </span>
        </div>

        <div>
          <label
            htmlFor="active-project-name"
            className="block text-[11px] font-medium text-studio-subtext"
          >
            {copy.projectPanel.projectNameLabel}
          </label>
          <input
            id="active-project-name"
            type="text"
            maxLength={80}
            value={project.name}
            onChange={(e) => setProjectName(e.target.value)}
            className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-2.5 py-1.5 text-xs font-medium text-studio-text"
          />
          {lastSavedAt && (
            <p className="mt-1 text-[11px] text-studio-subtext">
              {copy.projectPanel.lastSaved}: {formatDateTime(lastSavedAt, language)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={handleSave}
            className="col-span-2 inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-md bg-studio-accent px-3 py-1.5 text-xs font-semibold text-studio-accentText hover:bg-studio-accentHover"
          >
            <Save className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span>{copy.projectPanel.saveNow}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              createNewProject(
                language === 'id'
                  ? `Alternatif Desain ${savedProjects.length + 1}`
                  : `Design Option ${savedProjects.length + 1}`
              );
              addToast(
                'info',
                language === 'id'
                  ? 'Kanvas proyek baru dibuat.'
                  : 'Created a fresh project workspace.'
              );
            }}
            className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-md border border-studio-border bg-studio-elevated px-2.5 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
          >
            <FilePlus2 className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{copy.projectPanel.newProject}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const res = duplicateSavedProject(project.projectId, language);
              if (res.ok) {
                addToast(
                  'success',
                  language === 'id'
                    ? `Salinan "${res.newProject?.name}" dibuat.`
                    : `Duplicated as "${res.newProject?.name}".`
                );
              } else {
                addToast('error', res.error || 'Error');
              }
            }}
            className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-md border border-studio-border bg-studio-elevated px-2.5 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
          >
            <Copy className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{copy.projectPanel.duplicate}</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-md border border-studio-border bg-studio-elevated px-2.5 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{copy.projectPanel.exportJson}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-md border border-studio-border bg-studio-elevated px-2.5 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
          >
            <Upload className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{copy.projectPanel.importJson}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleOpenCompare}
            className="col-span-2 inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-md border border-studio-borderStrong bg-studio-elevated px-2.5 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
          >
            <GitCompare className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{copy.projectPanel.compareBtn}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              openConfirm({
                title:
                  language === 'id'
                    ? 'Reset Konfigurasi ke Default?'
                    : 'Reset Configuration to Default?',
                description:
                  language === 'id'
                    ? 'Seluruh pilihan tipe rumah, material, add-on, dan ukuran pada proyek aktif akan dikembalikan ke standar awal. Anda masih dapat menekan Undo setelahnya.'
                    : 'All house type, material, add-on, and plot settings on the active project will revert to defaults. You can still Undo afterward.',
                confirmLabel: language === 'id' ? 'Ya, Reset Default' : 'Reset to Default',
                cancelLabel: language === 'id' ? 'Batal' : 'Cancel',
                destructive: true,
                onConfirm: () => {
                  resetConfiguration();
                  addToast(
                    'info',
                    language === 'id'
                      ? 'Konfigurasi dikembalikan ke pengaturan awal.'
                      : 'Configuration reset to default.'
                  );
                },
              })
            }
            className="col-span-2 inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-studio-subtext hover:bg-studio-muted hover:text-studio-text"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{copy.projectPanel.resetConfig}</span>
          </button>
        </div>

        {importError && (
          <div
            role="alert"
            className="rounded-md border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-studio-text"
          >
            {importError}
          </div>
        )}
      </div>

      {/* Saved Projects List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-studio-text">
            {copy.projectPanel.savedListTitle} ({savedProjects.length})
          </h4>
        </div>

        {savedProjects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-studio-borderStrong bg-studio-elevated p-4 text-center">
            <p className="text-xs font-semibold text-studio-text">
              {copy.projectPanel.emptySavedTitle}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-studio-subtext">
              {copy.projectPanel.emptySavedAction}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedProjects.map((saved) => {
              const spec = HOUSE_SPECS[saved.houseType];
              const rab = calculateRAB(saved);
              const isCurrent = saved.projectId === project.projectId;
              const isRenaming = renamingId === saved.projectId;

              return (
                <div
                  key={saved.projectId}
                  className={`rounded-lg border p-2.5 transition-colors ${
                    isCurrent
                      ? 'border-studio-accent bg-studio-elevated'
                      : 'border-studio-border bg-studio-elevated'
                  }`}
                >
                  <div className="flex gap-2.5">
                    {/* Thumbnail or Clean Architectural Swatch Fallback */}
                    <div className="h-14 w-16 shrink-0 overflow-hidden rounded border border-studio-border bg-studio-muted flex items-center justify-center">
                      {saved.thumbnailDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={saved.thumbnailDataUrl}
                          alt={saved.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="h-8 w-8 rounded border border-studio-borderStrong"
                          style={{ backgroundColor: saved.materials.facadeColor }}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {isRenaming ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={renameDraft}
                            onChange={(e) => setRenameDraft(e.target.value)}
                            aria-label={copy.projectPanel.renameBtn}
                            className="w-full rounded border border-studio-borderStrong bg-studio-elevated px-2 py-0.5 text-xs text-studio-text"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const res = renameSavedProject(
                                saved.projectId,
                                renameDraft,
                                language
                              );
                              if (res.ok) {
                                setRenamingId(null);
                                addToast(
                                  'success',
                                  language === 'id' ? 'Nama diperbarui.' : 'Project renamed.'
                                );
                              } else {
                                addToast('error', res.error || 'Error');
                              }
                            }}
                            aria-label="Save name"
                            className="rounded p-1 text-studio-sage hover:bg-studio-muted"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRenamingId(null)}
                            aria-label="Cancel rename"
                            className="rounded p-1 text-studio-subtext hover:bg-studio-muted"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="truncate text-xs font-semibold text-studio-text">
                          {saved.name}
                        </div>
                      )}

                      <div className="mt-0.5 truncate text-[11px] text-studio-subtext">
                        {language === 'id' ? spec.nameId : spec.nameEn} ·{' '}
                        {formatArea(rab.grossFloorArea, language)} ({saved.dimensions.floors}F)
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium tabular-nums text-studio-text">
                        {formatCompactIDR(rab.totalEstimatedCost, language)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-1 border-t border-studio-border pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (loadSavedProject(saved.projectId)) {
                          addToast(
                            'info',
                            language === 'id'
                              ? `Membuka "${saved.name}".`
                              : `Loaded "${saved.name}".`
                          );
                        }
                      }}
                      className="inline-flex min-h-[32px] items-center gap-1 rounded px-2 py-1 text-xs font-medium text-studio-text hover:bg-studio-muted"
                    >
                      <FolderOpen className="h-3.5 w-3.5" strokeWidth={1.6} />
                      <span>{copy.projectPanel.loadBtn}</span>
                    </button>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingId(saved.projectId);
                          setRenameDraft(saved.name);
                        }}
                        title={copy.projectPanel.renameBtn}
                        aria-label={copy.projectPanel.renameBtn}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-studio-subtext hover:bg-studio-muted hover:text-studio-text"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.6} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const res = duplicateSavedProject(saved.projectId, language);
                          if (res.ok) {
                            addToast(
                              'success',
                              language === 'id' ? 'Proyek diduplikasi.' : 'Project duplicated.'
                            );
                          }
                        }}
                        title={copy.projectPanel.duplicate}
                        aria-label={copy.projectPanel.duplicate}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-studio-subtext hover:bg-studio-muted hover:text-studio-text"
                      >
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.6} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openConfirm({
                            title:
                              language === 'id'
                                ? `Hapus "${saved.name}"?`
                                : `Delete "${saved.name}"?`,
                            description:
                              language === 'id'
                                ? 'Proyek tersimpan ini akan dihapus permanen dari penyimpanan browser perangkat ini.'
                                : 'This saved project will be permanently removed from local browser storage.',
                            confirmLabel: language === 'id' ? 'Hapus Proyek' : 'Delete Project',
                            cancelLabel: language === 'id' ? 'Batal' : 'Cancel',
                            destructive: true,
                            onConfirm: () => {
                              const res = deleteSavedProject(saved.projectId, language);
                              if (res.ok) {
                                addToast(
                                  'info',
                                  language === 'id' ? 'Proyek dihapus.' : 'Project deleted.'
                                );
                              }
                            },
                          })
                        }
                        title={copy.projectPanel.deleteBtn}
                        aria-label={copy.projectPanel.deleteBtn}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-studio-subtext hover:bg-red-500/15 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.6} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
