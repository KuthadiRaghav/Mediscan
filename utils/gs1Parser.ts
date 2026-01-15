interface ParsedGS1 {
  gtin?: string;
  expirationDate?: string;
  lot?: string;
  serial?: string;
}

/**
 * A lightweight parser for GS1 Application Identifiers (AIs).
 * Handles (01) GTIN, (17) Exp Date, (10) Lot, (21) Serial.
 * Formats: Can handle brackets (01)... or raw 01...
 * Also handles raw UPC/EAN (12-14 digits).
 */
export const parseGS1 = (code: string): ParsedGS1 => {
  const result: ParsedGS1 = {};
  
  if (!code) return result;

  // Clean the code: remove control characters if any
  let cleanCode = code.replace(/[\x1d]/g, ''); 

  // 1. Try to detect complex GS1-128 or DataMatrix patterns first
  // Extract GTIN (AI: 01) - Fixed length 14 digits
  const gtinMatch = cleanCode.match(/(?:^|\]C1|\(01\)|01)(\d{14})/);
  if (gtinMatch) {
    result.gtin = gtinMatch[1];
  }

  // Extract Expiration (AI: 17) - Fixed length 6 digits (YYMMDD)
  const expMatch = cleanCode.match(/(?:\(17\)|17)(\d{6})/);
  if (expMatch) {
    const rawDate = expMatch[1];
    // Convert YYMMDD to YYYY-MM-DD
    // Note: This assumes 20xx.
    const year = '20' + rawDate.substring(0, 2);
    const month = rawDate.substring(2, 4);
    const day = rawDate.substring(4, 6);
    result.expirationDate = `${year}-${month}-${day}`;
  }

  // Extract Lot (AI: 10) - Variable length up to 20 chars
  // Regex looks for (10) or 10, captures up to next '(' or end of string
  const lotMatch = cleanCode.match(/(?:\(10\)|10)([A-Za-z0-9\-\.]+)/);
  if (lotMatch) {
    let lot = lotMatch[1];
    // If we grabbed too much (hit the next AI), trim it
    const nextAiIndex = lot.indexOf('(');
    if (nextAiIndex > -1) {
      lot = lot.substring(0, nextAiIndex);
    }
    // Also check if we hit a known AI start pattern like "17" or "21" if brackets aren't used
    // This is naive but works for simple concatenated strings
    result.lot = lot;
  }

  // Extract Serial (AI: 21)
  const serialMatch = cleanCode.match(/(?:\(21\)|21)([A-Za-z0-9\-\.]+)/);
  if (serialMatch) {
    let serial = serialMatch[1];
    const nextAiIndex = serial.indexOf('(');
    if (nextAiIndex > -1) {
      serial = serial.substring(0, nextAiIndex);
    }
    result.serial = serial;
  }

  // 2. Fallback: If no GTIN was found via GS1 rules, check if the WHOLE string is a barcode number
  if (!result.gtin) {
      // Remove any non-alphanumeric chars just in case
      const stripped = cleanCode.replace(/[^0-9A-Za-z]/g, '');
      if (stripped.length > 0) {
          result.gtin = stripped;
      }
  }

  return result;
};