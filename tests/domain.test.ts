import { beforeEach, describe, expect, it } from 'vitest';
import { calculateKPR } from '@/lib/kpr';
import { calculateRAB, DEFAULT_UNIT_RATES } from '@/lib/rab';
import {
  createDefaultProject,
  CURRENT_SCHEMA_VERSION,
  parseAndMigrateProjectJson,
  validateBookingInput,
  validateDimensionsDetailed,
} from '@/lib/validation';
import { useProjectStore } from '@/store/useProjectStore';

describe('RAB / BoQ Calculator (lib/rab.ts)', () => {
  it('computes all 12 structured categories with consistent subtotal and contingency math', () => {
    const base = createDefaultProject();
    const rab = calculateRAB(base);

    expect(rab.items).toHaveLength(12);
    const nonContingencySum = rab.items
      .slice(0, 11)
      .reduce((sum, item) => sum + item.subtotal, 0);

    expect(rab.physicalSubtotal).toBe(nonContingencySum);
    expect(rab.contingencyAmount).toBe(Math.round(rab.physicalSubtotal * 0.1));
    expect(rab.totalEstimatedCost).toBe(rab.physicalSubtotal + rab.contingencyAmount);
    expect(rab.estimatedCostPerM2).toBe(
      Math.round(rab.totalEstimatedCost / rab.grossFloorArea)
    );
  });

  it('scales gross floor area, foundation load factor, and total cost from 1 floor to 2 floors', () => {
    const oneFloor = createDefaultProject();
    oneFloor.dimensions.floors = 1;

    const twoFloors = createDefaultProject();
    twoFloors.dimensions.floors = 2;

    const rab1 = calculateRAB(oneFloor);
    const rab2 = calculateRAB(twoFloors);

    expect(rab2.grossFloorArea).toBeCloseTo(rab1.grossFloorArea * 2, 2);

    const found1 = rab1.items.find((i) => i.id === 'foundation')!;
    const found2 = rab2.items.find((i) => i.id === 'foundation')!;
    expect(found2.subtotal).toBeGreaterThan(found1.subtotal);
    expect(rab2.totalEstimatedCost).toBeGreaterThan(rab1.totalEstimatedCost);
  });

  it('updates cost lines when materials and compatible add-ons change, excluding incompatible add-ons', () => {
    const proj = createDefaultProject();
    proj.materials.floorMaterial = 'exposed-cement';
    proj.addons.swimmingPool = false;
    const rabCementNoPool = calculateRAB(proj);

    // Upgrade floor to oak parquet & enable pool on spacious plot
    proj.materials.floorMaterial = 'oak-parquet';
    proj.dimensions.landWidth = 14;
    proj.dimensions.landLength = 22;
    proj.addons.swimmingPool = true;
    const rabParquetPool = calculateRAB(proj);

    const floorBefore = rabCementNoPool.items.find((i) => i.id === 'interior-floor')!.subtotal;
    const floorAfter = rabParquetPool.items.find((i) => i.id === 'interior-floor')!.subtotal;
    expect(floorAfter).toBeGreaterThan(floorBefore);

    const outdoorBefore = rabCementNoPool.items.find((i) => i.id === 'outdoor-addons')!.subtotal;
    const outdoorAfter = rabParquetPool.items.find((i) => i.id === 'outdoor-addons')!.subtotal;
    expect(outdoorAfter).toBeGreaterThan(outdoorBefore);

    // Shrink plot so swimming pool becomes spatially incompatible -> must not charge for pool
    proj.dimensions.landWidth = 6;
    proj.dimensions.landLength = 8;
    proj.dimensions.buildingWidth = 5.5;
    proj.dimensions.buildingLength = 7.5;
    const rabTinyPlot = calculateRAB(proj);
    const outdoorTiny = rabTinyPlot.items.find((i) => i.id === 'outdoor-addons')!;
    expect(outdoorTiny.basisEn).not.toContain('Pool');
  });

  it('applies custom unit rate overrides and contingency percentage accurately', () => {
    const proj = createDefaultProject();
    const customStructureRate = DEFAULT_UNIT_RATES.structurePerM2 + 500_000;
    proj.rabAssumptions.unitRateOverrides = {
      structurePerM2: customStructureRate,
    };
    proj.rabAssumptions.contingencyPercent = 15;

    const rabCustom = calculateRAB(proj);
    const defaultRab = calculateRAB(createDefaultProject());

    expect(rabCustom.contingencyPercent).toBe(15);
    expect(rabCustom.totalEstimatedCost).toBeGreaterThan(defaultRab.totalEstimatedCost);
  });
});

describe('KPR Mortgage Simulator (lib/kpr.ts)', () => {
  it('calculates standard monthly annuity accurately for positive interest rate', () => {
    const res = calculateKPR({
      projectPrice: 1_000_000_000,
      additionalLandCost: 0,
      downPaymentMode: 'percent',
      downPaymentValue: 20,
      annualInterestRate: 7.5,
      tenorYears: 15,
      upfrontFees: 25_000_000,
    });

    expect(res.isValid).toBe(true);
    expect(res.downPaymentAmount).toBe(200_000_000);
    expect(res.principalLoan).toBe(800_000_000);
    // 800M at 7.5% p.a. over 180 months = ~7,416,099 IDR/month
    expect(res.monthlyInstallment).toBeGreaterThan(7_415_000);
    expect(res.monthlyInstallment).toBeLessThan(7_418_000);
    expect(res.totalCashNeededUpfront).toBe(225_000_000);
  });

  it('handles 0% zero-interest edge case cleanly without NaN or division by zero', () => {
    const res = calculateKPR({
      projectPrice: 600_000_000,
      additionalLandCost: 0,
      downPaymentMode: 'amount',
      downPaymentValue: 120_000_000,
      annualInterestRate: 0,
      tenorYears: 10,
      upfrontFees: 0,
    });

    expect(res.isValid).toBe(true);
    expect(res.principalLoan).toBe(480_000_000);
    expect(res.monthlyInstallment).toBe(4_000_000);
    expect(res.totalInterest).toBe(0);
    expect(res.downPaymentPercent).toBe(20);
  });

  it('rejects invalid DP, negative or excessive interest rates, and invalid tenors', () => {
    const dpTooHigh = calculateKPR({
      projectPrice: 500_000_000,
      additionalLandCost: 0,
      downPaymentMode: 'percent',
      downPaymentValue: 100,
      annualInterestRate: 8,
      tenorYears: 15,
      upfrontFees: 0,
    });
    expect(dpTooHigh.isValid).toBe(false);
    expect(dpTooHigh.errors.length).toBeGreaterThan(0);

    const badRateAndTenor = calculateKPR({
      projectPrice: 500_000_000,
      additionalLandCost: 0,
      downPaymentMode: 'percent',
      downPaymentValue: 20,
      annualInterestRate: -2,
      tenorYears: 0,
      upfrontFees: 0,
    });
    expect(badRateAndTenor.isValid).toBe(false);
    expect(badRateAndTenor.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Schema Validation, Import Migration & Dimension Rules (lib/validation.ts)', () => {
  it('validates wrapped and direct v2 project exports', () => {
    const sample = createDefaultProject('Villa Uji');
    const wrappedJson = JSON.stringify({
      app: 'arsiviz-pro',
      exportedAt: new Date().toISOString(),
      project: sample,
    });

    const parsed = parseAndMigrateProjectJson(wrappedJson, 'id');
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.migrated).toBe(false);
      expect(parsed.project.name).toBe('Villa Uji');
      expect(parsed.project.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    }
  });

  it('migrates schemaVersion 1 payloads safely to schemaVersion 2', () => {
    const base = createDefaultProject('Legacy V1 Project');
    const v1Payload = {
      ...base,
      schemaVersion: 1,
      materials: {
        facadeColor: '#EFECE6',
        roofMaterial: 'invalid-old-roof',
      },
      rabAssumptions: undefined,
    };

    const parsed = parseAndMigrateProjectJson(JSON.stringify(v1Payload), 'en');
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.migrated).toBe(true);
      expect(parsed.project.schemaVersion).toBe(2);
      expect(parsed.project.rabAssumptions.contingencyPercent).toBe(10);
    }
  });

  it('rejects malformed JSON, non-object structures, and footprints larger than plot', () => {
    expect(parseAndMigrateProjectJson('{broken-json', 'en').success).toBe(false);
    expect(parseAndMigrateProjectJson('["not-an-object"]', 'id').success).toBe(false);

    const invalidFootprint = createDefaultProject();
    invalidFootprint.dimensions.landWidth = 8;
    invalidFootprint.dimensions.buildingWidth = 10;
    const res = parseAndMigrateProjectJson(JSON.stringify(invalidFootprint), 'id');
    expect(res.success).toBe(false);

    const dimCheck = validateDimensionsDetailed(invalidFootprint.dimensions, 'id');
    expect(dimCheck.valid).toBe(false);
    expect(dimCheck.errors.length).toBeGreaterThan(0);
  });

  it('validates booking consultation form inputs strictly', () => {
    const invalidBooking = validateBookingInput(
      {
        name: 'A',
        email: '',
        phone: '',
        consultationType: 'concept-design',
        preferredDate: '',
        preferredSlot: '09:00 - 10:00',
        notes: '',
        consentToContact: false,
      },
      'en'
    );
    expect(invalidBooking.valid).toBe(false);
    expect(invalidBooking.fieldErrors.name).toBeDefined();
    expect(invalidBooking.fieldErrors.email).toBeDefined();
    expect(invalidBooking.fieldErrors.preferredDate).toBeDefined();
    expect(invalidBooking.fieldErrors.consentToContact).toBeDefined();

    const validBooking = validateBookingInput(
      {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        phone: '',
        consultationType: 'rab-review',
        preferredDate: '2026-11-15',
        preferredSlot: '14:00 - 15:00',
        notes: 'Lahan sudut di Bandung Utara.',
        consentToContact: true,
      },
      'id'
    );
    expect(validBooking.valid).toBe(true);
  });
});

describe('Project Store Undo/Redo & Typology Adaptation (store/useProjectStore.ts)', () => {
  beforeEach(() => {
    useProjectStore.getState().createNewProject('Store Test');
  });

  it('supports Undo and Redo across configuration mutations', () => {
    const store = useProjectStore.getState();
    expect(store.project.dimensions.floors).toBe(1);

    store.updateDimensions({ floors: 2 });
    expect(useProjectStore.getState().project.dimensions.floors).toBe(2);
    expect(useProjectStore.getState().past.length).toBe(1);

    const undone = useProjectStore.getState().undo();
    expect(undone).toBe(true);
    expect(useProjectStore.getState().project.dimensions.floors).toBe(1);

    const redone = useProjectStore.getState().redo();
    expect(redone).toBe(true);
    expect(useProjectStore.getState().project.dimensions.floors).toBe(2);
  });

  it('preserves compatible materials while adapting flat vs pitched roof when switching house types', () => {
    const store = useProjectStore.getState();
    store.updateMaterials({
      facadeColor: '#DDE2DC',
      floorMaterial: 'oak-parquet',
      roofMaterial: 'ceramic-tile',
    });

    const notice = useProjectStore.getState().setHouseType('modern-minimalist');
    const afterMinimalist = useProjectStore.getState().project;

    // Compatible custom facade color & parquet floor preserved
    expect(afterMinimalist.materials.facadeColor).toBe('#DDE2DC');
    expect(afterMinimalist.materials.floorMaterial).toBe('oak-parquet');
    // Ceramic tile adapted to flat parapet concrete membrane
    expect(afterMinimalist.materials.roofMaterial).toBe('concrete-membrane');
    expect(notice.adjustedNotesId.length).toBeGreaterThan(0);
  });
});
