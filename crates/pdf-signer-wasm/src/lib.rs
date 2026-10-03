use pdf_signer::{sign_pdf_bytes, verify_pdf_bytes, SignOptions};
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SignatureResult {
    valid: bool,
    is_timestamp: bool,
    byte_range: [i64; 4],
    signed_len: usize,
    covers_whole_document: bool,
    signer: Option<String>,
    chain_trusted: Option<bool>,
    detail: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VerificationResult {
    all_valid: bool,
    all_trusted: bool,
    document_intact: bool,
    modification_kind: String,
    pades_level: String,
    timestamp_count: usize,
    has_validation_material: bool,
    signatures: Vec<SignatureResult>,
}

const MAX_PDF_BYTES: usize = 100 * 1024 * 1024;
const MAX_SIGNATURES: usize = 64;

fn contains(bytes: &[u8], needle: &[u8]) -> bool {
    bytes.windows(needle.len()).any(|part| part == needle)
}

fn modification_kind(pdf: &[u8], signed_end: usize, intact: bool) -> String {
    if signed_end >= pdf.len() { return "none".into(); }
    if intact { return "validation-material".into(); }
    let tail = &pdf[signed_end..];
    if contains(tail, b"/ByteRange") || contains(tail, b"/Type /Sig") { "signature" }
    else if contains(tail, b"/Type /Page") { "pages" }
    else if contains(tail, b"/Annots") || contains(tail, b"/Subtype /Annot") { "annotation" }
    else if contains(tail, b"/AcroForm") || contains(tail, b"/FT /") { "form" }
    else { "unknown" }.into()
}

#[wasm_bindgen]
pub fn sign_pdf(pdf: &[u8], keystore: &[u8], password: &str, signing_time: &str) -> Result<Vec<u8>, JsValue> {
    let mut options = SignOptions::default();
    options.signing_time = Some(signing_time.to_owned());
    sign_pdf_bytes(pdf, keystore, password, &options)
        .map_err(|error| JsValue::from_str(&error.to_string()))
}

#[wasm_bindgen]
pub fn verify_pdf(pdf: &[u8]) -> Result<JsValue, JsValue> {
    if pdf.len() > MAX_PDF_BYTES { return Err(JsValue::from_str("PDF exceeds the 100 MiB verification limit")); }
    let report = verify_pdf_bytes(pdf).map_err(|error| JsValue::from_str(&error.to_string()))?;
    if report.signatures.len() > MAX_SIGNATURES { return Err(JsValue::from_str("PDF exceeds the 64 signature verification limit")); }
    let timestamp_count = report.signatures.iter().filter(|signature| signature.is_timestamp).count();
    let has_validation_material = contains(pdf, b"/DSS") || contains(pdf, b"/VRI");
    // PDF /Contents is normally a hexadecimal string, so detect both raw CMS
    // and its textual hex representation.
    let has_signature_timestamp = contains(pdf, &[0x06, 0x0b, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x09, 0x10, 0x02, 0x0e])
        || contains(pdf, b"060b2a864886f70d010910020e")
        || contains(pdf, b"060B2A864886F70D010910020E");
    let pades_level = if timestamp_count > 0 { "B-LTA" } else if has_validation_material { "B-LT" } else if has_signature_timestamp { "B-T" } else { "B-B" };
    let signed_end = report.signatures.iter().filter_map(|signature| {
        let start = usize::try_from(signature.byte_range[2]).ok()?;
        let len = usize::try_from(signature.byte_range[3]).ok()?;
        start.checked_add(len)
    }).max().unwrap_or(0);
    let result = VerificationResult {
        all_valid: report.all_valid(),
        all_trusted: report.all_trusted(),
        document_intact: report.document_intact(),
        modification_kind: modification_kind(pdf, signed_end, report.document_intact()),
        pades_level: pades_level.into(),
        timestamp_count,
        has_validation_material,
        signatures: report.signatures.into_iter().map(|signature| SignatureResult {
            valid: signature.valid,
            is_timestamp: signature.is_timestamp,
            byte_range: signature.byte_range,
            signed_len: signature.signed_len,
            covers_whole_document: signature.covers_whole_document,
            signer: signature.signer,
            chain_trusted: signature.chain_trusted,
            detail: signature.detail,
        }).collect(),
    };
    serde_wasm_bindgen::to_value(&result).map_err(|error| JsValue::from_str(&error.to_string()))
}
