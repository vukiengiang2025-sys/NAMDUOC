import { differenceInDays, endOfMonth, isSameDay, isWeekend, startOfMonth, eachDayOfInterval, format } from 'date-fns';
import { KpiData, WorkingConfig } from '../types';

export const kpiService = {
  calculateStats(kpi: KpiData, config: WorkingConfig) {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);

    // Filter entries for current month
    const currentMonthEntries = kpi.entries.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });

    const totalSales = currentMonthEntries.reduce((acc, curr) => acc + curr.sales, 0);
    const totalCoverage = currentMonthEntries.reduce((acc, curr) => acc + curr.coverage, 0);

    const salesPace = kpi.targets.sales > 0 ? (totalSales / kpi.targets.sales) * 100 : 0;
    const coveragePace = kpi.targets.coverage > 0 ? (totalCoverage / kpi.targets.coverage) * 100 : 0;

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

    const timePace = (passedWorkingDays / totalWorkingDaysCount) * 100;

    const salesDiff = salesPace - timePace;
    const coverageDiff = coveragePace - timePace;

    const dailyTargetSales = remainingWorkingDaysCount > 0 
      ? Math.max(0, (kpi.targets.sales - totalSales) / remainingWorkingDaysCount)
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
      targetSales: kpi.targets.sales,
      targetCoverage: kpi.targets.coverage
    };
  }
};
