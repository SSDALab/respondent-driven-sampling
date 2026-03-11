#!/usr/bin/env tsx

/**
 * Script to send automated SMS messages via Twilio
 * Usage: npm run sms -- <operation> [args]
 *
 * Operations:
 *   list-recipients [--location <locationId>]
 *     List all survey respondents who provided a phone number.
 *     Example: npm run sms -- list-recipients
 *     Example: npm run sms -- list-recipients --location 507f1f77bcf86cd799439011
 *
 *   send <phone> --template <name> [--var key=value ...]
 *     Send a single SMS using a YAML template with variable substitution.
 *     Example: npm run sms -- send "(206) 555-1234" --template gift_card --var surveyCode=ABC123
 *
 *   send <phone> --body "raw message text"
 *     Send a single SMS with a raw message body (no template).
 *     Example: npm run sms -- send "+15551234567" --body "Hello from the PIT Count team!"
 *
 *   send-bulk --template <name> [--location <locationId>] [--dry-run]
 *     Send SMS to all respondents who provided a phone number, using a template.
 *     Variables (surveyCode, etc.) are auto-populated from survey data.
 *     Example: npm run sms -- send-bulk --template gift_card
 *     Example: npm run sms -- send-bulk --template gift_card --dry-run
 *     Example: npm run sms -- send-bulk --template gift_card --location 507f1f77bcf86cd799439011
 *
 *   send-csv --file <path> --template <name> [--dry-run]
 *     Send SMS to recipients listed in an external CSV file.
 *     CSV must have columns: surveyCode, phone, amount, Reward Code.
 *     Deduplicates rows, skips rows with amount=0 or empty Reward Code.
 *     Does NOT require a database connection.
 *     Example: npm run sms -- send-csv --file ~/data/recipients.csv --template gift_card_redeem
 *     Example: npm run sms -- send-csv --file ~/data/recipients.csv --template gift_card_redeem --dry-run
 *
 *   logs
 *     List all CSV log files in sms-logs/ directory with row counts.
 *     Example: npm run sms -- logs
 *
 *   fetch-logs [--date YYYY-MM-DD]
 *     Recover a send log by fetching all outbound messages from Twilio API.
 *     Filters out inbound replies (direction === outbound-api only).
 *     Writes sms-log-recovered-DATE.csv. Use --date to limit to a single day.
 *     Example: npm run sms -- fetch-logs --date 2026-02-19
 *
 *   check-status [--log-file <filename>]
 *     Fetch the latest delivery status from Twilio for every record in log files.
 *     Creates an enriched CSV per source log with updated status + dateSent, price,
 *     priceUnit, errorCode, errorMessage columns. Original log is preserved.
 *     Prints a delivery stats summary per file.
 *     --log-file limits the check to a single file.
 *     Example: npm run sms -- check-status
 *     Example: npm run sms -- check-status --log-file sms-log-2026-02-19-gift_card_notice.csv
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import { parse as parseYaml } from 'yaml';
import { parse as parseCsv } from 'csv-parse/sync';

import connectDB from '@/database';
import Survey from '@/database/survey/mongoose/survey.model';
import {
	sendSms,
	normalizePhoneToE164,
	interpolateTemplate,
	fetchMessageStatus,
	listOutboundMessages,
	TWILIO_LIST_LIMIT
} from '@/services/twilio';
import {
	CsvSmsLogger,
	UpdatedCsvSmsLogger,
	listLogFiles
} from '@/services/smsLogger';
// `import type` is a TypeScript-only import — it imports only the type
// definitions (interfaces) for compile-time type checking. These imports are
// completely removed from the compiled JavaScript output, so they add zero
// runtime overhead.
import type { SmsRecord, UpdatedSmsRecord } from '@/services/smsLogger';

// ===== Template Loading =====

/** Shape of a YAML SMS template file (e.g. sms-templates/gift_card.yaml). */
interface SmsTemplate {
	name: string;
	description: string;
	/** Message body with {varName} placeholders for variable substitution. */
	body: string;
}

// ESM path resolution — see smsLogger.ts for detailed explanation.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Directory containing YAML SMS template files. */
const TEMPLATES_DIR = path.join(__dirname, 'sms-templates');

/**
 * Load and parse a YAML SMS template file by name.
 * @param templateName - Template name without extension (e.g. "gift_card").
 * @returns Parsed template with name, description, and body fields.
 * @throws Error if the template file doesn't exist or is missing required fields.
 */
function loadTemplate(templateName: string): SmsTemplate {
	const filePath = path.join(TEMPLATES_DIR, `${templateName}.yaml`);

	if (!fs.existsSync(filePath)) {
		const available = fs
			.readdirSync(TEMPLATES_DIR)
			.filter(f => f.endsWith('.yaml'))
			.map(f => f.replace('.yaml', ''));
		throw new Error(
			`Template "${templateName}" not found at ${filePath}\n` +
				`Available templates: ${available.length > 0 ? available.join(', ') : '(none)'}`
		);
	}

	const content = fs.readFileSync(filePath, 'utf-8');
	const parsed = parseYaml(content) as SmsTemplate;

	if (!parsed.name || !parsed.body) {
		throw new Error(
			`Template "${templateName}" is missing required fields (name, body)`
		);
	}

	return parsed;
}

// ===== Recipient Queries =====

/** A survey respondent who provided a phone number. */
interface Recipient {
	phone: string;
	surveyCode: string;
	surveyObjectId: string;
}

/**
 * Query the database for survey respondents who provided a phone number.
 * Optionally filter by location.
 *
 * @param locationObjectId - MongoDB ObjectId string to filter by location. Optional.
 * @returns Array of recipients with phone, surveyCode, and surveyObjectId.
 */
async function getRecipients(locationObjectId?: string): Promise<Recipient[]> {
	// Mongoose query object — uses MongoDB query operators:
	//   $exists: true  — the field must be present in the document
	//   $ne: ''        — the field must not equal empty string
	//   deletedAt: null — soft-delete filter (only include non-deleted surveys)
	// Record<string, unknown> is a TypeScript type meaning "object with string
	// keys and values of any type" — needed because we dynamically add keys below.
	const query: Record<string, unknown> = {
		'responses.phone': { $exists: true, $ne: '' },
		deletedAt: null
	};

	if (locationObjectId) {
		// Convert the string ID to a MongoDB ObjectId for the query
		query.locationObjectId = new mongoose.Types.ObjectId(locationObjectId);
	}

	// .select() limits which fields MongoDB returns (projection):
	//   1 means "include this field", everything else is excluded (except _id
	//   which is always included unless explicitly set to 0).
	const surveys = await Survey.find(query).select({
		'responses.phone': 1,
		surveyCode: 1,
		_id: 1
	});

	return surveys.map(s => ({
		// `as Record<string, string>` is a type assertion — tells TypeScript to
		// treat s.responses as a string-keyed object so we can access .phone
		phone: (s.responses as Record<string, string>).phone,
		surveyCode: s.surveyCode,
		surveyObjectId: s._id.toString()
	}));
}

// ===== Operations =====

async function listRecipients(locationObjectId?: string): Promise<void> {
	console.log('\n📱 Listing survey respondents with phone numbers...\n');

	const recipients = await getRecipients(locationObjectId);

	if (recipients.length === 0) {
		console.log('No respondents with phone numbers found.');
		return;
	}

	console.log(`Found ${recipients.length} respondent(s):\n`);

	for (const r of recipients) {
		console.log(`  ${r.phone}  (surveyCode: ${r.surveyCode})`);
	}
	console.log('');
}

/**
 * Send a single SMS to one phone number using either a template or raw body text.
 * Logs the result to sms-log-single.csv.
 *
 * @param phone   - Phone number in any common US format (will be normalized to E.164).
 * @param options - Must include either `templateName` or `body` (not both).
 *                  `vars` provides template variable substitutions (e.g. { surveyCode: "ABC123" }).
 */
async function sendSingle(
	phone: string,
	options: {
		templateName?: string;
		body?: string;
		vars: Record<string, string>;
	}
): Promise<void> {
	console.log('\n📤 Sending single SMS...\n');

	let messageBody: string;
	let templateName: string;

	if (options.templateName) {
		const template = loadTemplate(options.templateName);
		templateName = template.name;
		messageBody = interpolateTemplate(template.body, options.vars);
	} else if (options.body) {
		templateName = '(raw)';
		messageBody = options.body;
	} else {
		throw new Error('Either --template or --body must be provided');
	}

	const normalizedPhone = normalizePhoneToE164(phone);
	console.log(`  To: ${phone} → ${normalizedPhone}`);
	console.log(`  Template: ${templateName}`);
	console.log(`  Message: ${messageBody}`);
	console.log('');

	const result = await sendSms(normalizedPhone, messageBody);

	console.log(`  ✓ SMS sent! Twilio SID: ${result.sid}`);
	console.log(`  Status: ${result.status}`);
	if (result.errorCode) {
		console.log(`  Error: ${result.errorCode} - ${result.errorMessage}`);
	}

	// Log to CSV
	const logger = new CsvSmsLogger('sms-log-single.csv');
	const record: SmsRecord = {
		surveyCode: options.vars.surveyCode ?? '',
		phone: normalizedPhone,
		templateName,
		smsText: messageBody,
		datetime: new Date().toISOString(),
		status: result.status,
		twilioSid: result.sid,
		numSegments: result.numSegments
	};
	await logger.log(record);
	console.log(`  Logged to: ${logger.getLogFilePath()}`);
}

/**
 * Send SMS to all survey respondents who provided a phone number.
 * Supports --dry-run mode to preview messages without actually sending.
 *
 * Rate-limits sends to 1 message per 1.1 seconds because Twilio long-code
 * numbers (standard 10-digit phone numbers) are limited to 1 SMS/second.
 * Exceeding this rate causes Twilio to queue and potentially drop messages.
 *
 * @param options.templateName     - Name of the YAML template to use.
 * @param options.locationObjectId - Optional MongoDB ObjectId to filter recipients by location.
 * @param options.dryRun           - If true, preview messages without sending.
 */
async function sendBulk(options: {
	templateName: string;
	locationObjectId?: string;
	dryRun: boolean;
}): Promise<void> {
	const mode = options.dryRun ? '🔍 DRY RUN' : '📤 SENDING';
	console.log(`\n${mode} — Bulk SMS...\n`);

	const template = loadTemplate(options.templateName);
	const recipients = await getRecipients(options.locationObjectId);

	if (recipients.length === 0) {
		console.log('No respondents with phone numbers found. Nothing to send.');
		return;
	}

	console.log(`Template: ${template.name}`);
	console.log(`Recipients: ${recipients.length}`);
	console.log(`Message template: ${template.body}`);
	console.log('');

	if (options.dryRun) {
		console.log('--- Dry run preview ---\n');
		for (const r of recipients) {
			try {
				const normalizedPhone = normalizePhoneToE164(r.phone);
				const variables: Record<string, string> = {
					surveyCode: r.surveyCode
				};
				const renderedBody = interpolateTemplate(
					template.body,
					variables
				);
				console.log(
					`  ✓ ${r.phone} → ${normalizedPhone}: "${renderedBody}"`
				);
			} catch (err) {
				console.log(
					`  ✗ ${r.phone}: ${err instanceof Error ? err.message : err}`
				);
			}
		}
		console.log(
			`\n--- Dry run complete. ${recipients.length} message(s) would be sent. ---`
		);
		return;
	}

	// Actual send
	const batchId = randomBytes(8).toString('hex').toUpperCase();
	const date = new Date().toISOString().split('T')[0];
	const logFilename = `sms-log-${date}-${template.name}.csv`;
	const logger = new CsvSmsLogger(logFilename);

	let successCount = 0;
	let failCount = 0;

	for (let i = 0; i < recipients.length; i++) {
		const r = recipients[i];
		const index = i + 1;

		try {
			const normalizedPhone = normalizePhoneToE164(r.phone);
			const variables: Record<string, string> = {
				surveyCode: r.surveyCode
			};
			const renderedBody = interpolateTemplate(
				template.body,
				variables
			);

			const result = await sendSms(normalizedPhone, renderedBody);

			const record: SmsRecord = {
				surveyCode: r.surveyCode,
				phone: normalizedPhone,
				templateName: template.name,
				smsText: renderedBody,
				datetime: new Date().toISOString(),
				status: result.status,
				twilioSid: result.sid,
				numSegments: result.numSegments
			};
			await logger.log(record);

			successCount++;
			console.log(
				`  ✓ [${index}/${recipients.length}] ${r.phone} → ${normalizedPhone} (SID: ${result.sid})`
			);

			if (result.errorCode) {
				console.log(
					`    Warning: ${result.errorCode} - ${result.errorMessage}`
				);
			}
		} catch (err) {
			failCount++;
			const errorMessage =
				err instanceof Error ? err.message : String(err);
			console.log(
				`  ✗ [${index}/${recipients.length}] ${r.phone}: ${errorMessage}`
			);

			// Log failures too
			const record: SmsRecord = {
				surveyCode: r.surveyCode,
				phone: r.phone,
				templateName: template.name,
				smsText: '',
				datetime: new Date().toISOString(),
				status: 'failed',
				twilioSid: '',
				numSegments: ''
			};
			await logger.log(record);
		}

		// Rate limiting: 1.1s delay between messages (Twilio long-code limit: 1 msg/sec)
		if (i < recipients.length - 1) {
			await new Promise(resolve => setTimeout(resolve, 1100));
		}
	}

	console.log('\n' + '='.repeat(50));
	console.log('Bulk SMS Summary:');
	console.log(`  Batch ID: ${batchId}`);
	console.log(`  ✓ Sent: ${successCount}`);
	console.log(`  ✗ Failed: ${failCount}`);
	console.log(`  Log file: ${logger.getLogFilePath()}`);
}

// ===== CSV-based Sending =====
// This section handles sending SMS from an external CSV file (e.g. exported
// from a gift card vendor). Unlike send-bulk which queries the database,
// send-csv reads recipients from a CSV and does NOT require a DB connection.

/** Shape of a single row in the external recipient CSV file. */
interface CsvRecipient {
	surveyCode: string;
	phone: string;
	/** Dollar amount as a string (e.g. "25"). Rows with amount=0 are skipped. */
	amount: string;
	/** Gift card redemption code. Rows with empty codes are skipped. */
	rewardCode: string;
}

/**
 * Parse an external CSV file into CsvRecipient objects.
 * Handles BOM stripping, column mapping, deduplication, and filtering.
 *
 * @param filePath - Absolute or relative path to the CSV file.
 * @returns Deduplicated, filtered array of recipients.
 */
function parseCsvFile(filePath: string): CsvRecipient[] {
	if (!fs.existsSync(filePath)) {
		throw new Error(`CSV file not found: ${filePath}`);
	}

	let content = fs.readFileSync(filePath, 'utf-8');
	// Strip UTF-8 BOM (Byte Order Mark) if present.
	// BOM is an invisible character (U+FEFF) that Excel and some Windows tools
	// prepend to CSV files. If not stripped, it becomes part of the first column
	// header and breaks column-name lookups (e.g. "\uFEFFsurveyCode" !== "surveyCode").
	// 0xFEFF is the Unicode code point for the BOM character.
	if (content.charCodeAt(0) === 0xfeff) {
		content = content.slice(1);
	}
	// Parse the CSV content. See smsLogger.ts for explanation of csv-parse options.
	// `trim: true` strips whitespace from each field value.
	const rawRows = parseCsv(content, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		relax_column_count: true,
		cast: false
	}) as Record<string, string>[];

	// Map CSV column headers to our internal field names.
	// The `??` (nullish coalescing) chains handle varying column header names
	// across different CSV exports (e.g. "Reward Code" vs "RewardCode").
	const mapped = rawRows.map(row => ({
		surveyCode: row['surveyCode'] ?? '',
		phone: row['phone'] ?? '',
		amount: row['amount'] ?? '',
		rewardCode: row['Reward Code'] ?? row['RewardCode'] ?? row['rewardCode'] ?? ''
	}));

	// Deduplicate exact duplicate rows
	const seen = new Set<string>();
	const deduped = mapped.filter(r => {
		const key = `${r.surveyCode}|${r.phone}|${r.amount}|${r.rewardCode}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});

	// Filter out rows where amount is zero/invalid or Reward Code is empty
	return deduped.filter(r => Number(r.amount) > 0 && r.rewardCode !== '');
}

/**
 * Format a numeric amount string into a dollar display string (e.g. "25" → "$25").
 * @throws Error if the amount is not a valid integer.
 */
function formatAmount(amount: string): string {
	const num = parseInt(amount, 10);
	if (isNaN(num)) {
		throw new Error(`Invalid amount value: "${amount}"`);
	}
	return `$${num}`;
}

/**
 * Send SMS to recipients listed in an external CSV file.
 * Similar to sendBulk but reads from CSV instead of the database,
 * and supports additional template variables (amount, rewardCode).
 * Does NOT require a database connection.
 *
 * @param options.filePath     - Path to the CSV file with recipient data.
 * @param options.templateName - Name of the YAML template to use.
 * @param options.dryRun       - If true, preview messages without sending.
 */
async function sendCsv(options: {
	filePath: string;
	templateName: string;
	dryRun: boolean;
}): Promise<void> {
	const mode = options.dryRun ? '🔍 DRY RUN' : '📤 SENDING';
	console.log(`\n${mode} — CSV Bulk SMS...\n`);

	const template = loadTemplate(options.templateName);
	const recipients = parseCsvFile(options.filePath);

	if (recipients.length === 0) {
		console.log('No valid recipients found in CSV. Nothing to send.');
		return;
	}

	console.log(`Template: ${template.name}`);
	console.log(`CSV file: ${options.filePath}`);
	console.log(`Recipients: ${recipients.length} (after dedup & filtering)`);
	console.log(`Message template: ${template.body}`);
	console.log('');

	if (options.dryRun) {
		console.log('--- Dry run preview ---\n');
		for (const r of recipients) {
			try {
				const normalizedPhone = normalizePhoneToE164(r.phone);
				const variables: Record<string, string> = {
					surveyCode: r.surveyCode,
					amount: formatAmount(r.amount),
					rewardCode: r.rewardCode
				};
				const renderedBody = interpolateTemplate(
					template.body,
					variables
				);
				console.log(
					`  ✓ ${r.phone} → ${normalizedPhone}: "${renderedBody}"`
				);
			} catch (err) {
				console.log(
					`  ✗ ${r.phone}: ${err instanceof Error ? err.message : err}`
				);
			}
		}
		console.log(
			`\n--- Dry run complete. ${recipients.length} message(s) would be sent. ---`
		);
		return;
	}

	// Actual send
	const batchId = randomBytes(8).toString('hex').toUpperCase();
	const date = new Date().toISOString().split('T')[0];
	const logFilename = `sms-log-${date}-${template.name}.csv`;
	const logger = new CsvSmsLogger(logFilename);

	let successCount = 0;
	let failCount = 0;

	for (let i = 0; i < recipients.length; i++) {
		const r = recipients[i];
		const index = i + 1;

		try {
			const normalizedPhone = normalizePhoneToE164(r.phone);
			const variables: Record<string, string> = {
				surveyCode: r.surveyCode,
				amount: formatAmount(r.amount),
				rewardCode: r.rewardCode
			};
			const renderedBody = interpolateTemplate(
				template.body,
				variables
			);

			const result = await sendSms(normalizedPhone, renderedBody);

			const record: SmsRecord = {
				surveyCode: r.surveyCode,
				phone: normalizedPhone,
				templateName: template.name,
				smsText: renderedBody,
				datetime: new Date().toISOString(),
				status: result.status,
				twilioSid: result.sid,
				numSegments: result.numSegments
			};
			await logger.log(record);

			successCount++;
			console.log(
				`  ✓ [${index}/${recipients.length}] ${r.phone} → ${normalizedPhone} (SID: ${result.sid})`
			);

			if (result.errorCode) {
				console.log(
					`    Warning: ${result.errorCode} - ${result.errorMessage}`
				);
			}
		} catch (err) {
			failCount++;
			const errorMessage =
				err instanceof Error ? err.message : String(err);
			console.log(
				`  ✗ [${index}/${recipients.length}] ${r.phone}: ${errorMessage}`
			);

			// Log failures too
			const record: SmsRecord = {
				surveyCode: r.surveyCode,
				phone: r.phone,
				templateName: template.name,
				smsText: '',
				datetime: new Date().toISOString(),
				status: 'failed',
				twilioSid: '',
				numSegments: ''
			};
			await logger.log(record);
		}

		// Rate limiting: 1.1s delay between messages (Twilio long-code limit: 1 msg/sec)
		if (i < recipients.length - 1) {
			await new Promise(resolve => setTimeout(resolve, 1100));
		}
	}

	console.log('\n' + '='.repeat(50));
	console.log('CSV Bulk SMS Summary:');
	console.log(`  Batch ID: ${batchId}`);
	console.log(`  ✓ Sent: ${successCount}`);
	console.log(`  ✗ Failed: ${failCount}`);
	console.log(`  Log file: ${logger.getLogFilePath()}`);
}

function showLogs(): void {
	console.log('\n📋 SMS Log Files\n');

	const logFiles = listLogFiles();

	if (logFiles.length === 0) {
		console.log('No log files found.');
		return;
	}

	for (const { filename, rows } of logFiles) {
		console.log(`  ${filename}  (${rows} message${rows !== 1 ? 's' : ''})`);
	}
	console.log('');
}

/**
 * Recover a send log by fetching all outbound messages from the Twilio API.
 * Useful when the local CSV log was lost or incomplete. Writes a
 * "recovered" CSV file with the fetched message data.
 *
 * @param options.date - Optional date filter (YYYY-MM-DD) to limit results to a single day.
 */
async function fetchLogs(options: { date?: string }): Promise<void> {
	console.log('\n📥 Fetching outbound messages from Twilio API...\n');

	let dateSentAfter: Date | undefined;
	let dateSentBefore: Date | undefined;

	if (options.date) {
		// Treat the date as UTC to match Twilio's dateSent field
		dateSentAfter = new Date(`${options.date}T00:00:00Z`);
		dateSentBefore = new Date(`${options.date}T23:59:59Z`);
		console.log(`  Filtering to date: ${options.date} (UTC)\n`);
	}

	const messages = await listOutboundMessages({ dateSentAfter, dateSentBefore });

	if (messages.length === 0) {
		console.log('No outbound messages found.');
		return;
	}

	// Warn if the result count hit our configured limit — some messages may have
	// been truncated. Increase TWILIO_LIST_LIMIT in twilio.ts if this happens.
	if (messages.length >= TWILIO_LIST_LIMIT) {
		console.warn(
			`  ⚠ WARNING: Retrieved ${messages.length} messages, which equals the configured limit (${TWILIO_LIST_LIMIT}).` +
				'\n  Some messages may have been truncated. Consider increasing TWILIO_LIST_LIMIT in twilio.ts.\n'
		);
	}

	console.log(`  Found ${messages.length} outbound message(s).\n`);

	const date = options.date ?? new Date().toISOString().split('T')[0];
	const logFilename = `sms-log-recovered-${date}.csv`;
	const logger = new CsvSmsLogger(logFilename);

	for (let i = 0; i < messages.length; i++) {
		const m = messages[i];
		const record: SmsRecord = {
			surveyCode: '',
			phone: m.to,
			templateName: '',
			smsText: m.body,
			datetime:
				m.dateSent?.toISOString() ??
				m.dateCreated?.toISOString() ??
				'',
			status: m.status,
			twilioSid: m.sid,
			numSegments: m.numSegments
		};
		await logger.log(record);

		if ((i + 1) % 100 === 0 || i + 1 === messages.length) {
			const pct = (((i + 1) / messages.length) * 100).toFixed(1);
			console.log(`  [${i + 1}/${messages.length}] ${pct}%`);
		}
	}

	console.log(`\n  Recovered log: ${logger.getLogFilePath()}`);
	console.log(
		`  Next step: npm run sms -- check-status --log-file ${logFilename}`
	);
}

/**
 * Fetch the latest delivery status from Twilio for every record in one or
 * more log files. Creates an enriched CSV per source log with columns for
 * dateSent, price, priceUnit, errorCode, and errorMessage. The original
 * log file is preserved — a new "-updated-DATE.csv" file is written.
 *
 * @param logFilename - Optional: limit the check to a single log file.
 */
async function checkStatus(logFilename?: string): Promise<void> {
	console.log('\n🔄 Checking SMS delivery statuses via Twilio API...\n');

	const logFiles = listLogFiles();

	if (logFiles.length === 0) {
		console.log('No log files found. Send some messages first.');
		return;
	}

	const filesToCheck = logFilename
		? logFiles.filter(f => f.filename === logFilename)
		: logFiles;

	if (filesToCheck.length === 0) {
		console.log(`Log file "${logFilename}" not found.`);
		return;
	}

	const date = new Date().toISOString().split('T')[0];

	for (const { filename } of filesToCheck) {
		const sourceLogger = new CsvSmsLogger(filename);
		const records = await sourceLogger.getLogs();

		const outputFilename =
			filename.replace('.csv', '') + `-updated-${date}.csv`;
		const outputLogger = new UpdatedCsvSmsLogger(outputFilename);

		const statusCounts = new Map<string, number>();
		const total = records.length;

		console.log(`\nProcessing: ${filename} (${total} records)`);

		for (let i = 0; i < records.length; i++) {
			const record = records[i];
			let updatedRecord: UpdatedSmsRecord;

			if (!record.twilioSid) {
				statusCounts.set(
					record.status,
					(statusCounts.get(record.status) ?? 0) + 1
				);
				updatedRecord = {
					...record,
					dateSent: '',
					price: '',
					priceUnit: '',
					errorCode: '',
					errorMessage: ''
				};
			} else {
				try {
					const msg = await fetchMessageStatus(record.twilioSid);
					statusCounts.set(
						msg.status,
						(statusCounts.get(msg.status) ?? 0) + 1
					);
					updatedRecord = {
						...record,
						status: msg.status,
						dateSent: msg.dateSent?.toISOString() ?? '',
						price: msg.price ?? '',
						priceUnit: msg.priceUnit ?? '',
						errorCode:
							msg.errorCode != null ? String(msg.errorCode) : '',
						errorMessage: msg.errorMessage ?? ''
					};
				} catch (err) {
					const errorMsg =
						err instanceof Error ? err.message : String(err);
					console.warn(`  ⚠ ${record.twilioSid}: ${errorMsg}`);
					statusCounts.set(
						record.status,
						(statusCounts.get(record.status) ?? 0) + 1
					);
					updatedRecord = {
						...record,
						dateSent: '',
						price: '',
						priceUnit: '',
						errorCode: '',
						errorMessage: ''
					};
				}
			}

			await outputLogger.log(updatedRecord);

			if ((i + 1) % 100 === 0 || i + 1 === total) {
				const pct = (((i + 1) / total) * 100).toFixed(1);
				const lastSid = record.twilioSid || '(no SID)';
				console.log(
					`  [${i + 1}/${total}] ${pct}% — last: ${lastSid} → ${updatedRecord.status}`
				);
			}
		}

		console.log('\n=== Delivery Statistics ===');
		console.log(`File: ${filename} (${total} messages)`);
		for (const [status, count] of [...statusCounts.entries()].sort(
			(a, b) => b[1] - a[1]
		)) {
			const pct = ((count / total) * 100).toFixed(1);
			console.log(
				`  ${status.padEnd(14)} ${String(count).padStart(5)}  (${pct}%)`
			);
		}
		console.log(`Updated log: ${outputLogger.getLogFilePath()}`);
	}
}

// ===== Argument Parsing Helpers =====
// Simple hand-rolled argument parsing (no external library like yargs/commander).
// These helpers extract named flags and key=value pairs from process.argv.

/**
 * Get the value following a named flag (e.g. "--template gift_card" → "gift_card").
 * @returns The value string, or undefined if the flag is not present.
 */
function getFlag(args: string[], flag: string): string | undefined {
	const index = args.indexOf(flag);
	if (index === -1 || index + 1 >= args.length) return undefined;
	return args[index + 1];
}

/** Check if a boolean flag is present (e.g. "--dry-run"). */
function hasFlag(args: string[], flag: string): boolean {
	return args.includes(flag);
}

/**
 * Extract all `--var key=value` pairs from the argument list.
 * Supports multiple --var flags (e.g. `--var surveyCode=ABC --var amount=25`).
 * @returns Object mapping variable names to their values.
 */
function getVars(args: string[]): Record<string, string> {
	const vars: Record<string, string> = {};
	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--var' && i + 1 < args.length) {
			const pair = args[i + 1];
			const eqIndex = pair.indexOf('=');
			if (eqIndex === -1) {
				throw new Error(
					`Invalid --var format: "${pair}". Expected key=value`
				);
			}
			vars[pair.slice(0, eqIndex)] = pair.slice(eqIndex + 1);
			i++;
		}
	}
	return vars;
}

// ===== Main =====
// Entry point: parses CLI arguments, routes to the appropriate operation,
// and handles database connection lifecycle.

async function main(): Promise<void> {
	try {
		// process.argv is [node, script, ...userArgs]. slice(2) drops the first
		// two elements to get just the user-provided arguments.
		const args = process.argv.slice(2);

		if (args.length === 0) {
			printUsage();
			throw new Error('No operation specified');
		}

		const operation = args[0].toLowerCase();

		// 'logs', 'fetch-logs', and 'check-status' don't need a DB connection
		if (operation === 'logs') {
			showLogs();
			return;
		}

		if (operation === 'check-status') {
			const logFile = getFlag(args, '--log-file');
			await checkStatus(logFile);
			return;
		}

		if (operation === 'fetch-logs') {
			const date = getFlag(args, '--date');
			await fetchLogs({ date });
			return;
		}

		if (operation === 'send-csv') {
			const filePath = getFlag(args, '--file');
			if (!filePath) {
				throw new Error('send-csv requires --file <path>');
			}
			const templateName = getFlag(args, '--template');
			if (!templateName) {
				throw new Error('send-csv requires --template <name>');
			}
			const dryRun = hasFlag(args, '--dry-run');
			await sendCsv({ filePath, templateName, dryRun });
			return;
		}

		console.log('Connecting to database...');
		await connectDB();
		console.log('Connected to database ✓');

		switch (operation) {
			case 'list-recipients': {
				const locationId = getFlag(args, '--location');
				await listRecipients(locationId);
				break;
			}

			case 'send': {
				if (args.length < 2) {
					throw new Error('send requires a phone number argument');
				}
				const phone = args[1];
				const templateName = getFlag(args, '--template');
				const body = getFlag(args, '--body');
				const vars = getVars(args);

				await sendSingle(phone, { templateName, body, vars });
				break;
			}

			case 'send-bulk': {
				const templateName = getFlag(args, '--template');
				if (!templateName) {
					throw new Error('send-bulk requires --template <name>');
				}
				const locationObjectId = getFlag(args, '--location');
				const dryRun = hasFlag(args, '--dry-run');

				await sendBulk({ templateName, locationObjectId, dryRun });
				break;
			}

			default:
				printUsage();
				throw new Error(`Unknown operation "${operation}"`);
		}
	} catch (error) {
		console.error(
			'\n✗ Error:',
			error instanceof Error ? error.message : error
		);
		// Set process.exitCode instead of calling process.exit() directly.
		// process.exit() terminates immediately (skipping the `finally` block
		// and any pending I/O), while setting exitCode lets the event loop
		// drain naturally — so the `finally` block below still runs and the
		// database connection is properly closed.
		process.exitCode = 1;
	} finally {
		if (mongoose.connection.readyState === 1) {
			await mongoose.connection.close();
			console.log('\nDatabase connection closed.');
		}
	}
}

function printUsage(): void {
	console.log(`
Usage: npm run sms -- <operation> [args]

Operations:

  list-recipients [--location <locationId>]
    List all survey respondents who provided a phone number.
    Example: npm run sms -- list-recipients
    Example: npm run sms -- list-recipients --location 507f1f77bcf86cd799439011

  send <phone> --template <name> [--var key=value ...]
    Send a single SMS using a YAML template with variable substitution.
    Example: npm run sms -- send "(206) 555-1234" --template gift_card --var surveyCode=ABC123

  send <phone> --body "raw message text"
    Send a single SMS with a raw message body (no template).
    Example: npm run sms -- send "+15551234567" --body "Hello from the PIT Count team!"

  send-bulk --template <name> [--location <locationId>] [--dry-run]
    Send SMS to all respondents who provided a phone number, using a template.
    Variables (surveyCode, etc.) are auto-populated from survey data.
    --dry-run shows what would be sent without actually sending.
    Example: npm run sms -- send-bulk --template gift_card
    Example: npm run sms -- send-bulk --template gift_card --dry-run
    Example: npm run sms -- send-bulk --template gift_card --location 507f1f77bcf86cd799439011

  send-csv --file <path> --template <name> [--dry-run]
    Send SMS to recipients listed in an external CSV file.
    CSV must have columns: surveyCode, phone, amount, Reward Code.
    Deduplicates rows, skips rows with amount=0 or empty Reward Code.
    Does NOT require a database connection.
    --dry-run shows what would be sent without actually sending.
    Example: npm run sms -- send-csv --file ~/data/recipients.csv --template gift_card_redeem
    Example: npm run sms -- send-csv --file ~/data/recipients.csv --template gift_card_redeem --dry-run

  logs
    List all CSV log files in sms-logs/ directory with row counts.
    Example: npm run sms -- logs

  fetch-logs [--date YYYY-MM-DD]
    Recover a send log by fetching all outbound messages from Twilio API.
    Filters out inbound replies (direction === outbound-api only).
    Writes sms-log-recovered-DATE.csv. Use --date to limit to a single day.
    Example: npm run sms -- fetch-logs --date 2026-02-19

  check-status [--log-file <filename>]
    Fetch the latest delivery status from Twilio for every record in log files.
    Creates an enriched CSV per source log with updated status + dateSent, price,
    priceUnit, errorCode, errorMessage columns. Original log is preserved.
    Prints a delivery stats summary per file.
    Example: npm run sms -- check-status
    Example: npm run sms -- check-status --log-file sms-log-2026-02-19-gift_card_notice.csv
	`);
}

main();
