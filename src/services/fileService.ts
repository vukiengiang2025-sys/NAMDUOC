import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';
import { KpiEntry } from '../types';

export const fileService = {
  async parseKpiExcel(file: File): Promise<KpiEntry[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          const entries: KpiEntry[] = jsonData.map(row => ({
            date: row.Date || row.date || new Date().toISOString(),
            sales: Number(row.Sales || row.sales || 0),
            coverage: Number(row.Coverage || row.coverage || 0)
          }));

          resolve(entries);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },

  async extractDocxText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
};
