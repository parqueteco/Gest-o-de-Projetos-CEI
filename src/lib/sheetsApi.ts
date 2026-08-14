import Papa from 'papaparse';

export const fetchSheetData = async (spreadsheetId: string, sheetName: string, accessToken: string) => {
  const range = `${sheetName}!A:Z`;
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet ${sheetName}`);
  }
  
  const data = await res.json();
  const rows = data.values || [];
  
  if (rows.length === 0) return { items: [], headers: [] };
  
  const headers = rows[0] as string[];
  const items = rows.slice(1).map((row: string[], index: number) => {
    const item: Record<string, string | number> = { _rowIndex: index + 2 }; // +2 because 1-based and headers is row 1
    headers.forEach((header, colIndex) => {
      item[header] = row[colIndex] || '';
    });
    return item;
  });
  
  return { items, headers };
};

export const updateSheetCell = async (
  spreadsheetId: string, 
  sheetName: string, 
  rowIndex: number, 
  colName: string, 
  headers: string[], 
  value: string, 
  accessToken: string
) => {
  const colIndex = headers.indexOf(colName);
  if (colIndex === -1) throw new Error(`Column ${colName} not found`);
  
  // Convert colIndex to letter (A, B, C...)
  let colLetter = '';
  let temp = colIndex;
  while (temp >= 0) {
    colLetter = String.fromCharCode(65 + (temp % 26)) + colLetter;
    temp = Math.floor(temp / 26) - 1;
  }
  
  const range = `${sheetName}!${colLetter}${rowIndex}`;
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [[value]]
    })
  });
  
  if (!res.ok) throw new Error(`Failed to update cell`);
};

export const appendSheetRow = async (
  spreadsheetId: string,
  sheetName: string,
  headers: string[],
  newItem: Record<string, string>,
  accessToken: string
) => {
  const rowData = headers.map(header => newItem[header] || '');
  const range = `${sheetName}!A:Z`;
  
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [rowData]
    })
  });
  
  if (!res.ok) throw new Error(`Failed to append row`);
};
