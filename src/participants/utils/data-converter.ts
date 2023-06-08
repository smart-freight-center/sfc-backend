import { csvToObj } from 'csv-to-js-parser';
import { EmptyFootprintData } from 'utils/error';

function isJSON(text: string) {
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
}

export function convertRawDataToJSON(rawData: string | object) {
  if (typeof rawData === 'object') return rawData;

  if (isJSON(rawData)) return JSON.parse(rawData);

  const numberOfRows = rawData.trim().split('\n').length;
  if (numberOfRows < 2) throw new EmptyFootprintData();

  const columnDelimitedData = csvToObj(rawData, ';');

  if (!columnDelimitedData.length) throw new EmptyFootprintData();
  if (Object.keys(columnDelimitedData[0]).length > 1)
    return columnDelimitedData;

  return csvToObj(rawData, ',');
}
