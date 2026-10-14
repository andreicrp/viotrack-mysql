const EXCEL_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export const createXlsxBlob = async (headers, rows) => {
  if (!Array.isArray(headers) || !Array.isArray(rows)) {
    throw new Error('Spreadsheet headers and rows must be arrays.');
  }

  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'VioTrack';
  const worksheet = workbook.addWorksheet('VioTrack Export');
  worksheet.addRow(headers);
  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  rows.forEach((row) => {
    const values = Array.isArray(row) ? row : Object.values(row || {});
    worksheet.addRow(values.map(value => value ?? ''));
  });

  worksheet.columns.forEach((column, index) => {
    const headerLength = String(headers[index] ?? '').length;
    const contentLength = worksheet.getColumn(index + 1).values
      .slice(1)
      .reduce((max, value) => Math.max(max, String(value ?? '').length), 0);
    column.width = Math.min(60, Math.max(12, headerLength + 2, contentLength + 2));
  });

  const content = await workbook.xlsx.writeBuffer();
  return new Blob([content], { type: EXCEL_MIME_TYPE });
};
