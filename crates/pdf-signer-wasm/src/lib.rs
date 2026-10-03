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
    signatures: Vec<SignatureResult>,
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
    let report = verify_pdf_bytes(pdf).map_err(|error| JsValue::from_str(&error.to_string()))?;
    let result = VerificationResult {
        all_valid: report.all_valid(),
        all_trusted: report.all_trusted(),
        document_intact: report.document_intact(),
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
