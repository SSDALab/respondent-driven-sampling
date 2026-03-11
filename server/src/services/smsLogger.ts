/**
 * smsLogger.ts — CSV-based logging for SMS sends and status checks.
 *
 * Provides two logger classes:
 *   - CsvSmsLogger:        Logs initial send results (surveyCode, phone, status, etc.)
 *   - UpdatedCsvSmsLogger: Logs enriched records after fetching delivery status from Twilio
 *
 * Log files are stored in `server/src/scripts/sms-logs/` as plain CSV files.
 * Each bulk-send or status-check creates a new file (logs are never overwritten).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

// --- ESM path resolution ---
// In ES modules (ESM), `__filename` and `__dirname` are not available like they
// are in CommonJS. Instead, we derive them from `import.meta.url`, which gives
// the file:// URL of the current module (e.g. "file:///home/user/project/smsLogger.ts").
// `fileURLToPath` converts that URL to a filesystem path, and `path.dirname`
// extracts the directory portion.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Directory where all SMS CSV log files are stored. */
const SMS_LOGS_DIR = path.join(__dirname, '../scripts/sms-logs');

/**
 * Shape of a single row in the initial send-log CSV.
 * In TypeScript, `interface` defines the shape of an object — what keys it
 * must have and what types those values must be.
 */
export interface SmsRecord {
	surveyCode: string;
	phone: string;
	templateName: string;
	smsText: string;
	datetime: string;
	/** Status at send time (e.g. "queued", "failed"). */
	status: string;
	/** Twilio message SID (empty string if the send failed before reaching Twilio). */
	twilioSid: string;
	numSegments: string;
}

/**
 * Extended record with delivery details fetched after the initial send.
 * `extends SmsRecord` means this interface inherits all fields from SmsRecord
 * and adds additional ones (dateSent, price, etc.).
 */
export interface UpdatedSmsRecord extends SmsRecord {
	dateSent: string;
	price: string;
	priceUnit: string;
	errorCode: string;
	errorMessage: string;
}

/**
 * Interface (contract) that any SMS logger implementation must satisfy.
 * Currently only CsvSmsLogger implements this, but the interface makes it
 * easy to swap in alternative backends (e.g. database logging) in the future.
 */
export interface SmsLogger {
	log(record: SmsRecord): Promise<void>;
	getLogs(): Promise<SmsRecord[]>;
	getLogFilePath(): string;
}

const CSV_HEADER =
	'surveyCode,phone,templateName,smsText,datetime,status,twilioSid,numSegments';

const UPDATED_CSV_HEADER =
	'surveyCode,phone,templateName,smsText,datetime,status,twilioSid,numSegments,' +
	'dateSent,price,priceUnit,errorCode,errorMessage';

/**
 * Escape a single CSV field value per RFC 4180:
 * If the value contains commas, double quotes, or newlines, wrap it in
 * double quotes and escape any internal double quotes by doubling them.
 */
function escapeCsvField(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

/** Convert an SmsRecord to a comma-separated CSV row string. */
function recordToCsvRow(record: SmsRecord): string {
	return [
		escapeCsvField(record.surveyCode),
		escapeCsvField(record.phone),
		escapeCsvField(record.templateName),
		escapeCsvField(record.smsText),
		escapeCsvField(record.datetime),
		escapeCsvField(record.status),
		escapeCsvField(record.twilioSid),
		escapeCsvField(record.numSegments)
	].join(',');
}

/** Convert an UpdatedSmsRecord (with delivery details) to a CSV row string. */
function updatedRecordToCsvRow(record: UpdatedSmsRecord): string {
	return [
		escapeCsvField(record.surveyCode),
		escapeCsvField(record.phone),
		escapeCsvField(record.templateName),
		escapeCsvField(record.smsText),
		escapeCsvField(record.datetime),
		escapeCsvField(record.status),
		escapeCsvField(record.twilioSid),
		escapeCsvField(record.numSegments),
		escapeCsvField(record.dateSent),
		escapeCsvField(record.price),
		escapeCsvField(record.priceUnit),
		escapeCsvField(record.errorCode),
		escapeCsvField(record.errorMessage)
	].join(',');
}

/**
 * CSV-based logger for initial SMS send results.
 *
 * `implements SmsLogger` means this class must provide all methods defined
 * in the SmsLogger interface above. TypeScript will error at compile time
 * if any required method is missing or has the wrong signature.
 */
export class CsvSmsLogger implements SmsLogger {
	/** `private` means this field is only accessible within this class. */
	private filePath: string;

	/**
	 * @param filename - Name of the CSV file (e.g. "sms-log-2026-02-19-gift_card.csv").
	 *                   The file is created in the SMS_LOGS_DIR directory.
	 */
	constructor(filename: string) {
		if (!fs.existsSync(SMS_LOGS_DIR)) {
			// `recursive: true` creates parent directories if they don't exist
			fs.mkdirSync(SMS_LOGS_DIR, { recursive: true });
		}
		this.filePath = path.join(SMS_LOGS_DIR, filename);
	}

	getLogFilePath(): string {
		return this.filePath;
	}

	/** Append a single record to the CSV file. Creates the file with headers if needed. */
	async log(record: SmsRecord): Promise<void> {
		const fileExists = fs.existsSync(this.filePath);
		const row = recordToCsvRow(record);

		if (!fileExists) {
			fs.writeFileSync(this.filePath, CSV_HEADER + '\n' + row + '\n');
		} else {
			fs.appendFileSync(this.filePath, row + '\n');
		}
	}

	/** Read and parse all records from the CSV file. Returns [] if the file doesn't exist. */
	async getLogs(): Promise<SmsRecord[]> {
		if (!fs.existsSync(this.filePath)) {
			return [];
		}

		const content = fs.readFileSync(this.filePath, 'utf-8');
		// csv-parse options:
		//   columns: true      — use the first row as column headers (returns objects, not arrays)
		//   skip_empty_lines    — ignore blank lines in the CSV
		//   relax_column_count  — don't error if some rows have fewer/more columns than the header
		//   cast: false         — keep all values as strings (don't auto-convert to numbers/booleans)
		// `as SmsRecord[]` is a type assertion telling TypeScript to treat the
		// parsed result as an array of SmsRecord objects.
		return parse(content, {
			columns: true,
			skip_empty_lines: true,
			relax_column_count: true,
			cast: false
		}) as SmsRecord[];
	}
}

/**
 * CSV logger for enriched SMS records (after fetching delivery status from Twilio).
 * Similar to CsvSmsLogger but writes the extended UpdatedSmsRecord format
 * with additional columns: dateSent, price, priceUnit, errorCode, errorMessage.
 */
export class UpdatedCsvSmsLogger {
	private filePath: string;

	constructor(filename: string) {
		if (!fs.existsSync(SMS_LOGS_DIR)) {
			fs.mkdirSync(SMS_LOGS_DIR, { recursive: true });
		}
		this.filePath = path.join(SMS_LOGS_DIR, filename);
	}

	getLogFilePath(): string {
		return this.filePath;
	}

	/** Append an enriched record to the updated CSV file. Creates the file with headers if needed. */
	async log(record: UpdatedSmsRecord): Promise<void> {
		const fileExists = fs.existsSync(this.filePath);
		const row = updatedRecordToCsvRow(record);

		if (!fileExists) {
			fs.writeFileSync(
				this.filePath,
				UPDATED_CSV_HEADER + '\n' + row + '\n'
			);
		} else {
			fs.appendFileSync(this.filePath, row + '\n');
		}
	}
}

/**
 * List all CSV log files in the sms-logs directory with row counts.
 *
 * @returns Array of objects with `filename` and `rows` (number of data rows,
 *          excluding the header). Returns an empty array if the directory
 *          doesn't exist yet.
 */
export function listLogFiles(): { filename: string; rows: number }[] {
	if (!fs.existsSync(SMS_LOGS_DIR)) {
		return [];
	}

	return fs
		.readdirSync(SMS_LOGS_DIR)
		.filter(f => f.endsWith('.csv'))
		.map(filename => {
			const filePath = path.join(SMS_LOGS_DIR, filename);
			const content = fs.readFileSync(filePath, 'utf-8');
			const records = parse(content, {
				columns: true,
				skip_empty_lines: true,
				relax_column_count: true,
				cast: false
			}) as unknown[];
			return {
				filename,
				rows: records.length
			};
		});
}
