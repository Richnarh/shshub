import { createReadStream } from 'fs';
import { parse, isValid } from 'date-fns';
import { parse as csvParse, Parser } from 'csv-parse';
import xlsx from 'xlsx';

interface FieldTypeConfig {
    [key: string]: 'string' | 'number' | 'boolean' | 'date';
}

function toCamelCase(header: string): string {
    return header
        .replace(/\s+/g, '')
        .replace(/^"|"$/g, '')
        .replace(/(^|\W)(\w)/g, (_, separator, letter) => letter.toUpperCase());
}

async function parseCSV<T extends Record<string, any>>(filePath: string,fieldTypes?: FieldTypeConfig): Promise<T[]> {
    const typeConfig = fieldTypes ?? {};

    return new Promise<T[]>((resolve, reject) => {
        const results: T[] = [];
        const parser: Parser = csvParse({ columns: true, trim: true, skip_empty_lines: true });

        let headersTransformed = false;
        let headerMap: Record<string, string> = {};

        createReadStream(filePath)
            .pipe(parser)
            .on('data', (row: Record<string, string>) => {
                try {
                    if (!headersTransformed) {
                        headerMap = Object.keys(row).reduce((map, header) => {
                            map[header] = toCamelCase(header);
                            return map;
                        }, {} as Record<string, string>);
                        headersTransformed = true;
                    }
                    const convertedRow: Record<string, any> = {};
                    for (const [originalHeader, value] of Object.entries(row)) {
                        const transformedHeader = headerMap[originalHeader] || originalHeader;
                        convertedRow[transformedHeader] = value?.trim() ?? '';
                    }

                    for (const [field, type] of Object.entries(typeConfig)) {
                        if (!(field in convertedRow)) continue;
                        const value = convertedRow[field];
                        switch (type) {
                        case 'number':
                            const numValue = parseFloat(value);
                            if (isNaN(numValue)) {
                            throw new Error(`Invalid number format for ${field}: ${value}`);
                            }
                            convertedRow[field] = numValue;
                            break;
                        case 'boolean':
                            const boolValue = value?.toLowerCase();
                            if (boolValue !== 'true' && boolValue !== 'false') {
                            throw new Error(`Invalid boolean format for ${field}: ${value}`);
                            }
                            convertedRow[field] = boolValue === 'true';
                            break;
                        case 'date':
                            if (!value || value.trim() === '') {
                                convertedRow[field] = null;
                            break;
                            }
                            const dateFormats = [
                                'dd/MM/yyyy HH:mm', 
                                'yyyy-MM-dd HH:mm:ss',
                                'MM/dd/yyyy',
                                'yyyy-MM-dd',
                                'dd-MM-yyyy',
                            ];
                            let dateValue: Date | null = null;
                            for (const format of dateFormats) {
                            const parsed = parse(value, format, new Date());
                            if (isValid(parsed)) {
                                dateValue = parsed;
                                break;
                            }
                            }
                            if (!dateValue || isNaN(dateValue.getTime())) {
                                throw new Error(`Invalid date format for ${field}: ${value}`);
                            }
                                convertedRow[field] = dateValue;
                            break;
                        case 'string':
                        default:
                            convertedRow[field] = value ?? '';
                            break;
                        }
                    }
          results.push(convertedRow as T);
        } catch (error) {
          reject(new Error(`Invalid row data: ${(error as Error).message}`));
          return;
        }
      })
      .on('end', () => resolve(results))
      .on('error', (error: Error) => reject(error));
  });
}
async function parseExcel<T extends Record<string, any>>(filePath: string,fieldTypes?: FieldTypeConfig): Promise<T[]> {
    const typeConfig = fieldTypes ?? {};

    try {
        const workbook: xlsx.WorkBook = xlsx.readFile(filePath);
        const sheetName: string = workbook.SheetNames[0];
        const sheet: xlsx.WorkSheet = workbook.Sheets[sheetName];
        const data: unknown[][] = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
        const headers: string[] = (data[0] as string[]).map((header: string) => toCamelCase(header));
        const records: T[] = data.slice(1).map((row: unknown[], rowIndex: number) => {
            const record: Record<string, string> = {};
            headers.forEach((header: string, index: number) => {
                record[header] = row[index]?.toString()?.trim() ?? '';
            });

            const convertedRow: Record<string, any> = { ...record };
            for (const [field, type] of Object.entries(typeConfig)) {
                if (!(field in record)) continue;
                const value = record[field];
                try {
                    switch (type) {
                        case 'number':
                            const numValue = parseFloat(value);
                            if (isNaN(numValue)) {
                                throw new Error(`Invalid number format for ${field}: ${value}`);
                            }
                            convertedRow[field] = numValue;
                            break;
                        case 'boolean':
                            const boolValue = value.toLowerCase();
                            if (boolValue !== 'true' && boolValue !== 'false') {
                                throw new Error(`Invalid boolean format for ${field}: ${value}`);
                            }
                            convertedRow[field] = boolValue === 'true';
                            break;
                        case 'date':
                            if (!value || value.trim() === '') {
                                convertedRow[field] = null;
                            break;
                            }
                            const dateFormats = [
                                'dd/MM/yyyy HH:mm', 
                                'yyyy-MM-dd HH:mm:ss',
                                'MM/dd/yyyy',
                                'yyyy-MM-dd',
                                'dd-MM-yyyy',
                            ];
                            let dateValue: Date | null = null;
                            for (const format of dateFormats) {
                            const parsed = parse(value, format, new Date());
                            if (isValid(parsed)) {
                                dateValue = parsed;
                                break;
                            }
                            }
                            if (!dateValue || isNaN(dateValue.getTime())) {
                                throw new Error(`Invalid date format for ${field}: ${value}`);
                            }
                                convertedRow[field] = dateValue;
                            break;
                        case 'string':
                        default:
                            convertedRow[field] = value ?? '';
                            break;
                    }
                } catch (error) {
                    throw new Error(`Invalid data in row ${rowIndex + 2}: ${(error as Error).message}`);
                }
            }
            return convertedRow as T;
        });
        return records;
    } catch (error) {
        throw new Error(`Error parsing Excel file: ${(error as Error).message}`);
    }
}

export { parseCSV, parseExcel };