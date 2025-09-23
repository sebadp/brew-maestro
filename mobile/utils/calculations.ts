/**
 * Brewing calculation utilities
 * Based on standard formulas used in homebrewing
 */

// ABV Calculations
export const calculateABV = (og: number, fg: number): number => {
  if (!og || !fg || og <= fg) return 0;
  // Standard formula: ABV = (OG - FG) × 131.25
  return Math.round(((og - fg) * 131.25) * 100) / 100;
};

export const calculateABVHall = (og: number, fg: number): number => {
  if (!og || !fg || og <= fg) return 0;
  // Hall formula for high gravity beers (more accurate for >1.070 OG)
  const abv = (76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794);
  return Math.round(abv * 100) / 100;
};

// IBU Calculations
export const calculateIBUTinseth = (
  hopAmount: number, // grams
  alphaAcid: number, // percentage
  boilTime: number, // minutes
  batchSize: number, // liters
  og: number
): number => {
  if (!hopAmount || !alphaAcid || !boilTime || !batchSize || !og) return 0;

  // Tinseth formula
  const bignessFactor = 1.65 * Math.pow(0.000125, og - 1);
  const boilTimeFactor = (1 - Math.exp(-0.04 * boilTime)) / 4.15;
  const utilization = bignessFactor * boilTimeFactor;

  const ibu = (hopAmount * alphaAcid * utilization * 1000) / (batchSize * 10);
  return Math.round(ibu * 10) / 10;
};

export const calculateIBURager = (
  hopAmount: number, // grams
  alphaAcid: number, // percentage
  boilTime: number, // minutes
  batchSize: number, // liters
  og: number
): number => {
  if (!hopAmount || !alphaAcid || !boilTime || !batchSize || !og) return 0;

  // Rager formula
  let utilization: number;
  if (boilTime <= 5) utilization = 0.05;
  else if (boilTime <= 10) utilization = 0.06;
  else if (boilTime <= 15) utilization = 0.08;
  else if (boilTime <= 20) utilization = 0.101;
  else if (boilTime <= 25) utilization = 0.137;
  else if (boilTime <= 30) utilization = 0.188;
  else if (boilTime <= 35) utilization = 0.228;
  else if (boilTime <= 40) utilization = 0.269;
  else if (boilTime <= 45) utilization = 0.281;
  else utilization = 0.30;

  // Gravity adjustment
  const gravityAdjustment = og > 1.050 ? (og - 1.050) / 0.2 : 0;
  const adjustedUtilization = utilization / (1 + gravityAdjustment);

  const ibu = (hopAmount * alphaAcid * adjustedUtilization * 1000) / (batchSize * 10);
  return Math.round(ibu * 10) / 10;
};

// Color Calculations (SRM)
export const calculateSRM = (
  grainBill: Array<{ amount: number; color: number }>, // amount in kg, color in Lovibond
  batchSize: number // liters
): number => {
  if (!grainBill.length || !batchSize) return 0;

  // Morey equation
  const mcu = grainBill.reduce((total, grain) => {
    return total + (grain.amount * grain.color * 2.205) / (batchSize * 0.264172); // Convert to lbs and gallons
  }, 0);

  const srm = 1.4922 * Math.pow(mcu, 0.6859);
  return Math.round(srm * 10) / 10;
};

// Gravity Calculations
export const calculateOG = (
  grainBill: Array<{ amount: number; potential: number }>, // amount in kg, potential in points
  batchSize: number, // liters
  efficiency: number // percentage
): number => {
  if (!grainBill.length || !batchSize || !efficiency) return 1.000;

  const totalPoints = grainBill.reduce((total, grain) => {
    return total + (grain.amount * grain.potential * 2.205); // Convert to lbs
  }, 0);

  const points = (totalPoints * (efficiency / 100)) / (batchSize * 0.264172); // Convert to gallons
  return Math.round((1000 + points)) / 1000;
};

// Attenuation Calculations
export const calculateApparentAttenuation = (og: number, fg: number): number => {
  if (!og || !fg || og <= fg) return 0;
  return Math.round(((og - fg) / (og - 1)) * 100 * 100) / 100;
};

export const calculateRealAttenuation = (og: number, fg: number): number => {
  if (!og || !fg || og <= fg) return 0;
  // Real extract calculation
  const realExtract = (0.1808 * (og * 1000 - 1000)) + (0.8192 * (fg * 1000 - 1000));
  const originalExtract = og * 1000 - 1000;
  return Math.round(((originalExtract - realExtract) / originalExtract) * 100 * 100) / 100;
};

// Water Chemistry
export const calculateResidualAlkalinity = (
  totalAlkalinity: number, // mg/L as CaCO3
  calcium: number, // mg/L
  magnesium: number // mg/L
): number => {
  return totalAlkalinity - (calcium / 3.5 + magnesium / 7);
};

export const calculateMashpH = (
  grainBill: Array<{ amount: number; color: number }>,
  waterProfile: {
    calcium: number;
    magnesium: number;
    sodium: number;
    chloride: number;
    sulfate: number;
    bicarbonate: number;
  }
): number => {
  // Simplified pH prediction (Palmer's method)
  const totalGrain = grainBill.reduce((sum, grain) => sum + grain.amount, 0);
  const weightedColor = grainBill.reduce((sum, grain) =>
    sum + (grain.amount * grain.color), 0) / totalGrain;

  const ra = calculateResidualAlkalinity(
    waterProfile.bicarbonate * 1.22, // Convert HCO3 to alkalinity
    waterProfile.calcium,
    waterProfile.magnesium
  );

  // Simplified calculation - actual pH prediction is much more complex
  const baseColorpH = 5.8 - (weightedColor * 0.004);
  const waterAdjustment = ra * 0.002;

  return Math.round((baseColorpH + waterAdjustment) * 100) / 100;
};

// Priming Sugar Calculations
export const calculatePrimingSugar = (
  batchSize: number, // liters
  desiredCO2: number, // volumes
  maxTemp: number, // °C during fermentation
  sugarType: 'table' | 'corn' | 'dme' = 'table'
): number => {
  // Calculate residual CO2 based on temperature
  const residualCO2 = 3.0378 - (0.050062 * maxTemp) + (0.00026555 * maxTemp * maxTemp);

  // CO2 needed from priming
  const co2Needed = Math.max(0, desiredCO2 - residualCO2);

  // Sugar factors (grams per liter for 1 volume CO2)
  const sugarFactors = {
    table: 4.0, // sucrose
    corn: 3.7, // dextrose
    dme: 4.6   // dry malt extract
  };

  const sugarAmount = co2Needed * sugarFactors[sugarType] * batchSize;
  return Math.round(sugarAmount * 10) / 10;
};

// Strike Water Temperature
export const calculateStrikeTemp = (
  grainTemp: number, // °C
  mashTemp: number, // °C
  waterToGrainRatio: number // L/kg
): number => {
  // Infusion equation
  const strikeTemp = (0.2 / waterToGrainRatio) * (mashTemp - grainTemp) + mashTemp;
  return Math.round(strikeTemp * 10) / 10;
};

// Efficiency Calculations
export const calculateBrewhouseEfficiency = (
  actualOG: number,
  expectedOG: number
): number => {
  if (!actualOG || !expectedOG || expectedOG <= 1) return 0;

  const actualPoints = (actualOG - 1) * 1000;
  const expectedPoints = (expectedOG - 1) * 1000;

  return Math.round((actualPoints / expectedPoints) * 100 * 100) / 100;
};

// Yeast Calculations
export const calculateYeastCells = (
  og: number,
  batchSize: number, // liters
  yeastType: 'ale' | 'lager' = 'ale'
): number => {
  // Million cells per mL per degree Plato
  const cellsNeeded = yeastType === 'lager' ? 1.5 : 0.75;

  // Convert OG to Plato
  const plato = -616.868 + (1111.14 * og) - (630.272 * og * og) + (135.997 * og * og * og);

  // Total cells needed (in billions)
  const totalCells = (cellsNeeded * plato * batchSize * 1000) / 1000000;

  return Math.round(totalCells * 10) / 10;
};

// Unit Conversions
export const convertCelsiusToFahrenheit = (celsius: number): number => {
  return Math.round((celsius * 9/5 + 32) * 10) / 10;
};

export const convertFahrenheitToCelsius = (fahrenheit: number): number => {
  return Math.round(((fahrenheit - 32) * 5/9) * 10) / 10;
};

export const convertSGToPlato = (sg: number): number => {
  return Math.round((-616.868 + (1111.14 * sg) - (630.272 * sg * sg) + (135.997 * sg * sg * sg)) * 100) / 100;
};

export const convertPlatoToSG = (plato: number): number => {
  const sg = 1 + (plato / (258.6 - ((plato / 258.2) * 227.1)));
  return Math.round(sg * 1000) / 1000;
};