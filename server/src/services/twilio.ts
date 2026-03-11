/**
 * twilio.ts — Twilio SMS service layer.
 *
 * Wraps the Twilio Node SDK to provide simple functions for sending SMS,
 * fetching message statuses, and listing outbound messages. Also includes
 * utility helpers for phone number normalization and template interpolation.
 *
 * All Twilio API calls go through a lazily-initialized singleton client
 * (see getTwilioClient below), so credentials are only required when the
 * first API call is actually made.
 */

import twilio from 'twilio';

// `as string` is a TypeScript "type assertion" — it tells the compiler to
// treat this value as a string even though process.env values are technically
// `string | undefined`. We validate it at runtime before use (see sendSms).
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER as string;

/**
 * Lazily-initialized Twilio client instance (singleton pattern).
 *
 * `ReturnType<typeof twilio>` is a TypeScript utility type that extracts the
 * return type of the `twilio()` factory function — this avoids needing to
 * import or reference Twilio's internal Client type directly.
 */
let _client: ReturnType<typeof twilio> | null = null;

/**
 * Returns the shared Twilio client, creating it on first call.
 * Throws if TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN are not set.
 */
function getTwilioClient() {
	if (!_client) {
		const accountSid = process.env.TWILIO_ACCOUNT_SID;
		const authToken = process.env.TWILIO_AUTH_TOKEN;
		if (!accountSid || !authToken) {
			throw new Error(
				'TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in your .env file.'
			);
		}
		_client = twilio(accountSid, authToken);
	}
	return _client;
}

/** Result returned after sending a single SMS via Twilio. */
export interface SmsSendResult {
	/** Twilio's unique identifier for this message (e.g. "SM..."). */
	sid: string;
	/** Initial status at send time — typically "queued". */
	status: string;
	/** Twilio error code if the send failed immediately, otherwise null. */
	errorCode: string | null;
	errorMessage: string | null;
	/** Number of billing segments. Messages > 160 chars are split into segments. */
	numSegments: string;
}

/**
 * Send a single SMS via Twilio.
 */
export async function sendSms(
	to: string,
	body: string
): Promise<SmsSendResult> {
	if (!twilioPhoneNumber) {
		throw new Error(
			'TWILIO_PHONE_NUMBER is not configured. Set it in your .env file.'
		);
	}

	const message = await getTwilioClient().messages.create({
		to,
		from: twilioPhoneNumber,
		body
	});

	return {
		sid: message.sid,
		status: message.status,
		errorCode: message.errorCode ? String(message.errorCode) : null,
		// `??` is the "nullish coalescing" operator — returns the right-hand side
		// only if the left-hand side is null or undefined (unlike `||` which also
		// triggers on empty strings and 0).
		errorMessage: message.errorMessage ?? null,
		numSegments: message.numSegments
	};
}

/**
 * Shape of a message status response from Twilio.
 * Fields like dateSent, price, and errorCode are only populated after
 * the message leaves Twilio's network, so they may be null initially.
 */
export interface MessageStatusResult {
	sid: string;
	/** Current delivery status: "queued" → "sent" → "delivered" (or "undelivered"/"failed"). */
	status: string;
	dateUpdated: Date | null;
	dateSent: Date | null;
	errorCode: number | null;
	errorMessage: string | null;
	/** Cost of the message (e.g. "-0.00750"), null until delivery. */
	price: string | null;
	/** Currency code for the price (e.g. "USD"). */
	priceUnit: string | null;
	numSegments: string;
	/** Message direction: "outbound-api", "inbound", etc. */
	direction: string;
}

/**
 * Fetch the latest status of a previously sent message by Twilio SID.
 * Includes delivery details (dateSent, price, errorCode) that are only
 * available after the message leaves Twilio's network.
 */
export async function fetchMessageStatus(
	sid: string
): Promise<MessageStatusResult> {
	const message = await getTwilioClient().messages(sid).fetch();
	return {
		sid: message.sid,
		status: message.status,
		dateUpdated: message.dateUpdated,
		dateSent: message.dateSent ?? null,
		errorCode: message.errorCode ?? null,
		errorMessage: message.errorMessage ?? null,
		price: message.price ?? null,
		priceUnit: message.priceUnit ?? null,
		numSegments: message.numSegments,
		direction: message.direction
	};
}

/** A single outbound SMS record as returned by listOutboundMessages(). */
export interface OutboundMessageRecord {
	sid: string;
	to: string;
	body: string;
	status: string;
	dateSent: Date | null;
	dateCreated: Date | null;
	numSegments: string;
	direction: string;
	errorCode: number | null;
	errorMessage: string | null;
	price: string | null;
	priceUnit: string | null;
}

/**
 * Maximum number of messages to retrieve from the Twilio API in a single
 * listOutboundMessages() call. The SDK auto-paginates internally (fetching
 * pages of 50 records each) until this limit is reached. Set high enough
 * to cover realistic bulk-send volumes (~3,700 messages per PIT count).
 */
export const TWILIO_LIST_LIMIT = 10_000;

/**
 * List all outbound messages sent from our Twilio number.
 *
 * Applies a high `limit` to ensure the Twilio SDK fetches all pages of
 * results. Without an explicit limit the SDK defaults to ~50 records,
 * which silently truncates results after bulk sends.
 *
 * Filters to direction === 'outbound-api' to exclude inbound replies.
 *
 * @param options.dateSentAfter  - Only include messages sent after this date.
 * @param options.dateSentBefore - Only include messages sent before this date.
 * @returns Array of outbound message records.
 */
export async function listOutboundMessages(options?: {
	dateSentAfter?: Date;
	dateSentBefore?: Date;
}): Promise<OutboundMessageRecord[]> {
	if (!twilioPhoneNumber) {
		throw new Error(
			'TWILIO_PHONE_NUMBER is not configured. Set it in your .env file.'
		);
	}

	const messages = await getTwilioClient().messages.list({
		from: twilioPhoneNumber,
		limit: TWILIO_LIST_LIMIT,
		// Conditional spread pattern: only include the date filter key in the
		// object if the caller actually provided a value. If `dateSentAfter` is
		// undefined, the `&&` short-circuits and the spread (`...`) receives
		// `false`/`undefined`, which adds nothing to the object.
		...(options?.dateSentAfter && { dateSentAfter: options.dateSentAfter }),
		...(options?.dateSentBefore && {
			dateSentBefore: options.dateSentBefore
		})
	});

	return messages
		.filter(m => m.direction === 'outbound-api')
		.map(m => ({
			sid: m.sid,
			to: m.to,
			body: m.body,
			status: m.status,
			dateSent: m.dateSent ?? null,
			dateCreated: m.dateCreated ?? null,
			numSegments: m.numSegments,
			direction: m.direction,
			errorCode: m.errorCode ?? null,
			errorMessage: m.errorMessage ?? null,
			price: m.price ?? null,
			priceUnit: m.priceUnit ?? null
		}));
}

/**
 * Normalizes a US phone number from various formats to E.164 (+1XXXXXXXXXX).
 * E.164 is the international standard format required by Twilio's API.
 *
 * Handles: (555) 123-4567, 555-123-4567, 5551234567, +15551234567, etc.
 *
 * @param phone - The phone number in any common US format.
 * @returns The phone number in E.164 format (e.g. "+15551234567").
 * @throws Error if the phone number is not a valid 10-digit US number.
 */
export function normalizePhoneToE164(phone: string): string {
	// Strip all non-digit characters: parens, dashes, spaces, dots, plus sign
	// \D is a regex shorthand for "any character that is NOT a digit"
	const digits = phone.replace(/\D/g, '');

	// 11 digits starting with '1' means country code was included (e.g. "15551234567")
	if (digits.length === 11 && digits.startsWith('1')) {
		return `+${digits}`;
	}

	// 10 digits means just the local number (e.g. "5551234567") — prepend +1
	if (digits.length === 10) {
		return `+1${digits}`;
	}

	throw new Error(
		`Invalid phone number: cannot normalize "${phone}" to E.164 format`
	);
}

/**
 * Interpolate template variables. Replaces `{varName}` placeholders with values.
 *
 * Uses a regex to find all `{word}` patterns in the template string and
 * replaces each one with the corresponding value from the `variables` object.
 *
 * @param templateBody - The template string containing `{varName}` placeholders.
 * @param variables    - A key-value map of variable names to their values.
 *                       `Record<string, string>` is a TypeScript utility type
 *                       equivalent to `{ [key: string]: string }`.
 * @returns The interpolated string with all placeholders replaced.
 * @throws Error if a placeholder references a variable not in `variables`.
 */
export function interpolateTemplate(
	templateBody: string,
	variables: Record<string, string>
): string {
	// Regex breakdown: \{(\w+)\}
	//   \{      — literal opening brace
	//   (\w+)   — capture group: one or more word characters (the variable name)
	//   \}      — literal closing brace
	//   g       — global flag: replace ALL matches, not just the first
	// The callback receives the full match and the captured group(s).
	// _match is prefixed with underscore to indicate it's intentionally unused.
	return templateBody.replace(/\{(\w+)\}/g, (_match, varName) => {
		if (varName in variables) {
			return variables[varName];
		}
		throw new Error(`Missing template variable: {${varName}}`);
	});
}
