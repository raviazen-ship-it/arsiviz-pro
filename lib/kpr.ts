import { KPRInput, KPRResult, Language } from '@/types/project';

/**
 * Menghitung simulasi cicilan KPR menggunakan rumus anuitas bulanan:
 * r = (sukuBungaTahunan / 100) / 12
 * n = tenorTahun * 12
 * Bila bunga = 0%, cicilan = pokokPinjaman / n
 */
export function calculateKPR(input: KPRInput, lang: Language = 'id'): KPRResult {
  const errors: string[] = [];

  const projectPrice = Number.isFinite(input.projectPrice) ? input.projectPrice : 0;
  const additionalLandCost = Number.isFinite(input.additionalLandCost)
    ? input.additionalLandCost
    : 0;
  const upfrontFees = Number.isFinite(input.upfrontFees) ? input.upfrontFees : 0;

  if (projectPrice <= 0) {
    errors.push(
      lang === 'id'
        ? 'Nilai dasar bangunan harus lebih besar dari Rp 0.'
        : 'Base building cost must be greater than IDR 0.'
    );
  }
  if (additionalLandCost < 0) {
    errors.push(
      lang === 'id'
        ? 'Harga lahan tambahan tidak boleh bernilai negatif.'
        : 'Additional land cost cannot be negative.'
    );
  }
  if (upfrontFees < 0) {
    errors.push(
      lang === 'id'
        ? 'Estimasi biaya awal (provisi/notaris/pajak) tidak boleh negatif.'
        : 'Estimated upfront fees cannot be negative.'
    );
  }

  const totalPropertyBase = Math.max(0, projectPrice + Math.max(0, additionalLandCost));

  let downPaymentAmount = 0;
  let downPaymentPercent = 0;

  if (input.downPaymentMode === 'percent') {
    if (!Number.isFinite(input.downPaymentValue) || input.downPaymentValue < 0) {
      errors.push(
        lang === 'id'
          ? 'Persentase uang muka (DP) tidak boleh kurang dari 0%.'
          : 'Down payment percentage cannot be less than 0%.'
      );
    } else if (input.downPaymentValue >= 100) {
      errors.push(
        lang === 'id'
          ? 'Persentase DP harus di bawah 100% agar terdapat pokok pinjaman KPR.'
          : 'Down payment percentage must be below 100% for a mortgage loan.'
      );
    }
    downPaymentPercent = Math.max(0, Math.min(100, input.downPaymentValue || 0));
    downPaymentAmount = Math.round((totalPropertyBase * downPaymentPercent) / 100);
  } else {
    if (!Number.isFinite(input.downPaymentValue) || input.downPaymentValue < 0) {
      errors.push(
        lang === 'id'
          ? 'Nominal uang muka (DP) tidak boleh bernilai negatif.'
          : 'Down payment amount cannot be negative.'
      );
    } else if (totalPropertyBase > 0 && input.downPaymentValue >= totalPropertyBase) {
      errors.push(
        lang === 'id'
          ? 'Nominal DP tidak boleh sama atau melebihi total harga dasar proyek.'
          : 'Down payment cannot equal or exceed total property base price.'
      );
    }
    downPaymentAmount = Math.max(0, Math.round(input.downPaymentValue || 0));
    downPaymentPercent =
      totalPropertyBase > 0
        ? Math.round((downPaymentAmount / totalPropertyBase) * 10000) / 100
        : 0;
  }

  if (
    !Number.isFinite(input.annualInterestRate) ||
    input.annualInterestRate < 0 ||
    input.annualInterestRate > 30
  ) {
    errors.push(
      lang === 'id'
        ? 'Suku bunga tahunan harus berada dalam rentang wajar 0% hingga 30%.'
        : 'Annual interest rate must be within a reasonable range of 0% to 30%.'
    );
  }

  if (
    !Number.isFinite(input.tenorYears) ||
    !Number.isInteger(input.tenorYears) ||
    input.tenorYears < 1 ||
    input.tenorYears > 35
  ) {
    errors.push(
      lang === 'id'
        ? 'Tenor pinjaman harus berupa angka bulat antara 1 hingga 35 tahun.'
        : 'Loan tenor must be a whole number between 1 and 35 years.'
    );
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      totalPropertyBase,
      downPaymentAmount,
      downPaymentPercent,
      principalLoan: Math.max(0, totalPropertyBase - downPaymentAmount),
      monthlyInstallment: 0,
      totalLoanPayment: 0,
      totalInterest: 0,
      totalCashNeededUpfront: downPaymentAmount + Math.max(0, upfrontFees),
      totalOverallOutlay: 0,
    };
  }

  const principalLoan = Math.max(0, totalPropertyBase - downPaymentAmount);
  const periods = input.tenorYears * 12;
  const monthlyRate = input.annualInterestRate / 100 / 12;

  let monthlyInstallment = 0;
  if (monthlyRate === 0) {
    monthlyInstallment = principalLoan / periods;
  } else {
    const factor = Math.pow(1 + monthlyRate, periods);
    monthlyInstallment = (principalLoan * (monthlyRate * factor)) / (factor - 1);
  }

  const roundedMonthly = Math.round(monthlyInstallment);
  const totalLoanPayment = roundedMonthly * periods;
  const totalInterest = Math.max(0, totalLoanPayment - principalLoan);
  const safeUpfront = Math.max(0, Math.round(upfrontFees));

  return {
    isValid: true,
    errors: [],
    totalPropertyBase,
    downPaymentAmount,
    downPaymentPercent,
    principalLoan,
    monthlyInstallment: roundedMonthly,
    totalLoanPayment,
    totalInterest,
    totalCashNeededUpfront: downPaymentAmount + safeUpfront,
    totalOverallOutlay: downPaymentAmount + safeUpfront + totalLoanPayment,
  };
}
