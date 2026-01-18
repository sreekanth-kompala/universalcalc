import { UnitDefinition } from '../types';

export const convertUnit = (
  value: number,
  from: UnitDefinition,
  to: UnitDefinition,
  category: string
): number => {
  if (category === 'temperature') {
    // Normalize to Celsius (Base)
    let inCelsius = value;
    if (from.symbol === '°F') {
      inCelsius = (value - 32) * (5 / 9);
    } else if (from.symbol === 'K') {
      inCelsius = value - 273.15;
    }

    // Convert to target
    if (to.symbol === '°C') return inCelsius;
    if (to.symbol === '°F') return inCelsius * (9 / 5) + 32;
    if (to.symbol === 'K') return inCelsius + 273.15;
    return inCelsius;
  }

  // Standard factor-based conversion
  // Convert to base unit
  const baseValue = value * from.factor;
  // Convert to target unit
  return baseValue / to.factor;
};
