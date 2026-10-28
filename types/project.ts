export type Language = 'id' | 'en';
export type ThemeMode = 'light' | 'dark';

export type HouseType =
  | 'modern-minimalist'
  | 'tropical-villa'
  | 'industrial-loft'
  | 'japandi-compact';

export type RoofMaterial = 'ceramic-tile' | 'bitumen-slate' | 'concrete-membrane';

export type AccentMaterial = 'ulin-wood' | 'andesite-stone' | 'exposed-brick' | 'matte-steel';

export type FloorMaterial = 'granite-marble' | 'oak-parquet' | 'exposed-cement';

export type ConstructionStage = 0 | 1 | 2 | 3 | 4 | 5;

export type CameraPreset = 'perspective' | 'front' | 'top' | 'interior';

export type BuildingOrientation = 0 | 90 | 180 | 270;

export interface DimensionsConfig {
  landWidth: number;
  landLength: number;
  buildingWidth: number;
  buildingLength: number;
  floors: 1 | 2;
  orientation: BuildingOrientation;
}

export interface MaterialsConfig {
  facadeColor: string;
  roofMaterial: RoofMaterial;
  accentMaterial: AccentMaterial;
  floorMaterial: FloorMaterial;
}

export interface AddonsConfig {
  livingRoomFurniture: boolean;
  kitchenSet: boolean;
  masterBedroomFurniture: boolean;
  swimmingPool: boolean;
  solarPanels: boolean;
  carport: boolean;
  landscape: boolean;
}

export interface SceneSettings {
  constructionStage: ConstructionStage;
  cutaway: boolean;
  showGrid: boolean;
  showDimensions: boolean;
  autoRotate: boolean;
  cameraPreset: CameraPreset;
  sunTime: number; // 6.0 to 21.0
}

export type EditableRateKey =
  | 'sitePrepPerM2'
  | 'foundationPerM2'
  | 'structurePerM2'
  | 'wallsPerM2'
  | 'roofBasePerM2'
  | 'openingsPerM2'
  | 'facadeBasePerM2'
  | 'floorBasePerM2'
  | 'mepPerM2';

export interface RABAssumptions {
  unitRateOverrides: Partial<Record<EditableRateKey, number>>;
  contingencyPercent: number;
  landPricePerM2: number;
}

export interface ProjectConfig {
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  houseType: HouseType;
  dimensions: DimensionsConfig;
  materials: MaterialsConfig;
  addons: AddonsConfig;
  scene: SceneSettings;
  rabAssumptions: RABAssumptions;
  thumbnailDataUrl?: string;
}

export type RABCategoryId =
  | 'site-prep'
  | 'foundation'
  | 'main-structure'
  | 'walls-plaster'
  | 'roof-structure'
  | 'openings'
  | 'facade-finish'
  | 'interior-floor'
  | 'mep'
  | 'interior-furniture'
  | 'outdoor-addons'
  | 'contingency';

export interface RABLineItem {
  id: RABCategoryId;
  rateKey?: EditableRateKey;
  titleId: string;
  titleEn: string;
  quantity: number;
  unitId: string;
  unitEn: string;
  unitPrice: number;
  defaultUnitPrice: number;
  subtotal: number;
  basisId: string;
  basisEn: string;
}

export interface RABSummary {
  items: RABLineItem[];
  physicalSubtotal: number;
  contingencyAmount: number;
  contingencyPercent: number;
  totalEstimatedCost: number;
  landArea: number;
  footprintArea: number;
  grossFloorArea: number;
  remainingYardArea: number;
  estimatedCostPerM2: number;
}

export interface KPRInput {
  projectPrice: number;
  additionalLandCost: number;
  downPaymentMode: 'percent' | 'amount';
  downPaymentValue: number;
  annualInterestRate: number;
  tenorYears: number;
  upfrontFees: number;
}

export interface KPRResult {
  isValid: boolean;
  errors: string[];
  totalPropertyBase: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  principalLoan: number;
  monthlyInstallment: number;
  totalLoanPayment: number;
  totalInterest: number;
  totalCashNeededUpfront: number;
  totalOverallOutlay: number;
}

export interface SelectedElementInfo {
  id: string;
  labelId: string;
  labelEn: string;
  stage: ConstructionStage;
  categoryId: string;
  categoryEn: string;
  materialNoteId: string;
  materialNoteEn: string;
  editTargetTab?: 'type' | 'material' | 'addons' | 'dimensions';
}

export type ConsultationType =
  | 'concept-design'
  | 'rab-review'
  | 'renovation'
  | 'initial-consultation';

export type ConsultationSlot =
  | '09:00 - 10:00'
  | '11:00 - 12:00'
  | '14:00 - 15:00'
  | '16:00 - 17:00';

export interface BookingRecord {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  consultationType: ConsultationType;
  preferredDate: string;
  preferredSlot: ConsultationSlot;
  notes: string;
  consentToContact: boolean;
  deliveryStatus: 'local-demo-saved' | 'backend-delivered';
  projectSummary: {
    projectId: string;
    projectName: string;
    houseType: HouseType;
    landAreaM2: number;
    buildingAreaM2: number;
    floors: number;
    estimatedRabIdr: number;
    snapshotDataUrl?: string;
  };
}

export interface AddonCompatibility {
  supported: boolean;
  reasonId?: string;
  reasonEn?: string;
}
