import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const inputPath = process.argv[2];
if (!inputPath) throw new Error('Informe o caminho do XLSX.');

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const summary = await workbook.inspect({
  kind: 'workbook,sheet,table',
  maxChars: 20000,
  tableMaxRows: 15,
  tableMaxCols: 12,
  tableMaxCellChars: 160,
});
console.log(summary.ndjson);
