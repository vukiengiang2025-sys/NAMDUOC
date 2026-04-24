import { differenceInDays, endOfMonth, isSameDay, isWeekend, startOfMonth, eachDayOfInterval, format } from 'date-fns';
import { KpiData, WorkingConfig, KpiItem } from '../types';

export const kpiService = {
  calculateStats(kpi: KpiData, config: WorkingConfig) {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);

    // Get from kpiItems
    const salesItem = kpi.kpiItems?.find(item => item.type === 'sales') || { target: 0, actual: 0 };
    const coverageItem = kpi.kpiItems?.find(item => item.type === 'coverage') || { target: 0, actual: 0 };

    const totalSales = salesItem.actual;
    const totalCoverage = coverageItem.actual;
    const targetSales = salesItem.target;
    const targetCoverage = coverageItem.target;

    const salesPace = targetSales > 0 ? (totalSales / targetSales) * 100 : 0;
    const coveragePace = targetCoverage > 0 ? (totalCoverage / targetCoverage) * 100 : 0;

    // Working days logic
    const allDays = eachDayOfInterval({ start, end });
    const workingDays = allDays.filter(day => {
      const isOff = config.weeklyOffDays.includes(day.getDay());
      const isPublicHoliday = config.holidays.some(h => isSameDay(new Date(h), day));
      return !isOff && !isPublicHoliday;
    });

    const totalWorkingDaysCount = workingDays.length;
    const passedWorkingDays = workingDays.filter(day => day <= today).length;
    const remainingWorkingDaysCount = totalWorkingDaysCount - passedWorkingDays;

    const timePace = totalWorkingDaysCount > 0 ? (passedWorkingDays / totalWorkingDaysCount) * 100 : 0;

    const salesDiff = salesPace - timePace;
    const coverageDiff = coveragePace - timePace;

    const dailyTargetSales = remainingWorkingDaysCount > 0 
      ? Math.max(0, (targetSales - totalSales) / remainingWorkingDaysCount)
      : 0;

    return {
      totalSales,
      totalCoverage,
      salesPace,
      coveragePace,
      timePace,
      totalWorkingDaysCount,
      passedWorkingDays,
      remainingWorkingDaysCount,
      salesDiff,
      coverageDiff,
      dailyTargetSales,
      targetSales,
      targetCoverage
    };
  }
};
