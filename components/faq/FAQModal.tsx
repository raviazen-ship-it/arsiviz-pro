'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { ModalDialog } from '@/components/layout/ModalDialog';
import { FAQ_ITEMS } from '@/lib/i18n';
import { useUIStore } from '@/store/useUIStore';

export function FAQModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const language = useUIStore((s) => s.language);

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-viewport': true,
  });

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    FAQ_ITEMS.forEach((item) => {
      map.set(
        item.category,
        language === 'id' ? item.categoryLabelId : item.categoryLabelEn
      );
    });
    return Array.from(map.entries());
  }, [language]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (!q) return true;
      const title = (language === 'id' ? item.questionId : item.questionEn).toLowerCase();
      const body = (language === 'id' ? item.answerId : item.answerEn).toLowerCase();
      return title.includes(q) || body.includes(q);
    });
  }, [query, selectedCategory, language]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ModalDialog
      open={activeModal === 'faq'}
      onClose={closeModal}
      title={
        language === 'id'
          ? 'Pusat Bantuan & Panduan ArsiViz Pro'
          : 'ArsiViz Pro Help Center & FAQ'
      }
      subtitle={
        language === 'id'
          ? 'Penjelasan pengoperasian Studio 3D, tahapan konstruksi, metodologi RAB/KPR, dan batasan teknis simulasi.'
          : 'Guidance on 3D Studio controls, construction stages, RAB/KPR methodology, and engineering boundaries.'
      }
      maxWidthClass="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-studio-subtext" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'id'
                ? 'Cari topik (misal: cutaway, RAB, KPR, PBG, JSON)...'
                : 'Search topics (e.g., cutaway, RAB, mortgage, PBG, JSON)...'
            }
            aria-label={language === 'id' ? 'Cari pertanyaan FAQ' : 'Search FAQ questions'}
            className="w-full rounded-lg border border-studio-borderStrong bg-studio-elevated py-2 pl-9 pr-3 text-xs text-studio-text"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            aria-pressed={selectedCategory === 'all'}
            className={`min-h-[34px] rounded-md px-2.5 py-1 text-xs font-medium ${
              selectedCategory === 'all'
                ? 'bg-studio-accent text-studio-accentText'
                : 'border border-studio-border bg-studio-elevated text-studio-subtext hover:text-studio-text'
            }`}
          >
            {language === 'id' ? 'Semua Kategori' : 'All Categories'}
          </button>
          {categories.map(([catKey, catLabel]) => (
            <button
              key={catKey}
              type="button"
              onClick={() => setSelectedCategory(catKey)}
              aria-pressed={selectedCategory === catKey}
              className={`min-h-[34px] rounded-md px-2.5 py-1 text-xs font-medium ${
                selectedCategory === catKey
                  ? 'bg-studio-accent text-studio-accentText'
                  : 'border border-studio-border bg-studio-elevated text-studio-subtext hover:text-studio-text'
              }`}
            >
              {catLabel}
            </button>
          ))}
        </div>

        {/* Accordion List or Designed Empty State */}
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-studio-borderStrong p-6 text-center">
            <p className="text-xs font-semibold text-studio-text">
              {language === 'id'
                ? `Tidak ditemukan topik untuk "${query}"`
                : `No matching help articles for "${query}"`}
            </p>
            <p className="mt-1 text-xs text-studio-subtext">
              {language === 'id'
                ? 'Coba kata kunci lain atau tampilkan seluruh kategori panduan.'
                : 'Try another keyword or reset the category filter.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 rounded-md bg-studio-muted px-3 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-border"
            >
              {language === 'id' ? 'Tampilkan Semua Pertanyaan' : 'Show All Questions'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-studio-border rounded-xl border border-studio-border bg-studio-elevated">
            {filteredItems.map((item) => {
              const expanded = Boolean(openIds[item.id]);
              const panelId = `faq-panel-${item.id}`;
              const triggerId = `faq-trigger-${item.id}`;

              return (
                <div key={item.id}>
                  <h3>
                    <button
                      id={triggerId}
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => toggleItem(item.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-studio-muted/40"
                    >
                      <div>
                        <span className="inline-block rounded bg-studio-muted px-1.5 py-0.5 text-[10px] font-semibold text-studio-subtext">
                          {language === 'id' ? item.categoryLabelId : item.categoryLabelEn}
                        </span>
                        <div className="mt-1 text-xs sm:text-sm font-semibold text-studio-text">
                          {language === 'id' ? item.questionId : item.questionEn}
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-studio-subtext transition-transform ${
                          expanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </h3>

                  {expanded && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="px-4 pb-4 text-xs leading-relaxed text-studio-subtext"
                    >
                      {language === 'id' ? item.answerId : item.answerEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModalDialog>
  );
}
