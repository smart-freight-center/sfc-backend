import { csvToObj } from 'csv-to-js-parser';
import { EmptyDataSource } from './errors';

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

  if (isJSON(rawData)) {
    const data = JSON.parse(rawData);
    if (data.length === 0) throw new EmptyDataSource();
    return data;
  }

  const numberOfRows = rawData.trim().split('\n').length;
  if (numberOfRows < 2) throw new EmptyDataSource();

  const columnDelimitedData = csvToObj(rawData, ';');

  if (!columnDelimitedData.length) throw new EmptyDataSource();
  if (Object.keys(columnDelimitedData[0]).length > 1)
    return columnDelimitedData;

  return csvToObj(rawData, ',');
}
