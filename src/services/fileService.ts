import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';
import { KpiEntry } from '../types';

export const fileService = {
  async parseKpiExcelRawAsCsv(file: File, sheetIndex: number = 0): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          if (sheetIndex >= workbook.SheetNames.length) {
            return resolve(''); // return empty if sheet doesn't exist
          }
          const sheetName = workbook.SheetNames[sheetIndex];
          const worksheet = workbook.Sheets[sheetName];
          const csvData = XLSX.utils.sheet_to_csv(worksheet);
          resolve(csvData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },

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

  async extractFileText(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    
    if (ext === 'xlsx' || ext === 'xls') {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      let allCsv = '';
      for (const sheetName of workbook.SheetNames) {
        allCsv += `--- Sheet: ${sheetName} ---\n`;
        allCsv += XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]) + '\n\n';
      }
      return allCsv;
    }

    if (ext === 'csv' || ext === 'txt' || ext === 'md') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }

    throw new Error('Chỉ hỗ trợ file DOCX, XLSX, TXT, CSV, MD');
  }
};
