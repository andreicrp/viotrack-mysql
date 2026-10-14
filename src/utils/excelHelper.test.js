import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { createXlsxBlob } from './excelHelper';

describe('XLSX export', () => {
  it('creates a real workbook and preserves values as cells', async () => {
    const blob = await createXlsxBlob(
      ['Student ID', 'Name', 'Email', 'Address', 'Notes'],
      [['001234', 'Doe, Jane', 'jane@example.edu', 'Line 1\nLine 2', '=SUM(1,1)']]
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(await blob.arrayBuffer()));

    const sheet = workbook.getWorksheet('VioTrack Export');
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(sheet.getRow(1).values.slice(1)).toEqual(['Student ID', 'Name', 'Email', 'Address', 'Notes']);
    expect(sheet.getRow(2).values.slice(1)).toEqual([
      '001234', 'Doe, Jane', 'jane@example.edu', 'Line 1\nLine 2', '=SUM(1,1)'
    ]);
    expect(sheet.getCell('E2').formula).toBeUndefined();
  });
});
