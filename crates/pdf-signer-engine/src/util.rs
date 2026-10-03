//! Small byte-level helpers shared by the sign/verify paths.

/// Find the first occurrence of `needle` in `haystack`, returning its start index.
pub(crate) fn find_sub(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    if needle.is_empty() || needle.len() > haystack.len() {
        return None;
    }
    haystack
        .windows(needle.len())
        .position(|w| w == needle)
}

/// Lowercase hex-encode `bytes`.
pub(crate) fn hex_encode(bytes: &[u8]) -> Vec<u8> {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut out = Vec::with_capacity(bytes.len() * 2);
    for &b in bytes {
        out.push(HEX[(b >> 4) as usize]);
        out.push(HEX[(b & 0x0f) as usize]);
    }
    out
}

/// Decode an ASCII hex string into bytes. Ignores nothing; expects even length.
pub(crate) fn hex_decode(hex: &[u8]) -> Option<Vec<u8>> {
    #[allow(clippy::manual_is_multiple_of)] // `is_multiple_of` needs Rust 1.87; MSRV is 1.81
    if hex.len() % 2 != 0 {
        return None;
    }
    fn val(c: u8) -> Option<u8> {
        match c {
            b'0'..=b'9' => Some(c - b'0'),
            b'a'..=b'f' => Some(c - b'a' + 10),
            b'A'..=b'F' => Some(c - b'A' + 10),
            _ => None,
        }
    }
    let mut out = Vec::with_capacity(hex.len() / 2);
    for pair in hex.chunks_exact(2) {
        out.push((val(pair[0])? << 4) | val(pair[1])?);
    }
    Some(out)
}

/// Given a buffer starting with a DER element, return the total length
/// (header + content) of the outermost element. Used to slice the real CMS
/// blob out of a zero-padded `/Contents` placeholder.
pub(crate) fn der_total_len(b: &[u8]) -> Option<usize> {
    if b.len() < 2 {
        return None;
    }
    let len_byte = b[1];
    if len_byte < 0x80 {
        Some(2 + len_byte as usize)
    } else {
        let n = (len_byte & 0x7f) as usize;
        // A length-of-length wider than usize cannot describe anything we can
        // hold; reject it instead of shifting bits away (checked arithmetic
        // throughout so a crafted /Contents cannot panic the verifier).
        if n == 0 || n > std::mem::size_of::<usize>() || b.len() < 2 + n {
            return None;
        }
        let mut len = 0usize;
        for i in 0..n {
            len = len.checked_shl(8)? | b[2 + i] as usize;
        }
        len.checked_add(2 + n)
    }
}

/// Convert a BER value to definite-length DER without touching primitive
/// payload bytes. Older PDF signing products commonly wrap otherwise valid CMS
/// in indefinite-length BER (`30 80 ... 00 00`). RustCrypto's CMS decoder is
/// intentionally DER-only, so verification normalises the transport envelope
/// before decoding it. The signed attributes remain byte-for-byte payload and
/// are still authenticated by the CMS verifier.
pub(crate) fn ber_to_der(input: &[u8]) -> Option<Vec<u8>> {
    fn length(out: &mut Vec<u8>, n: usize) {
        if n < 128 {
            out.push(n as u8);
            return;
        }
        let bytes = n.to_be_bytes();
        let first = bytes.iter().position(|b| *b != 0).unwrap_or(bytes.len() - 1);
        out.push(0x80 | (bytes.len() - first) as u8);
        out.extend_from_slice(&bytes[first..]);
    }

    fn element(input: &[u8], pos: &mut usize, stop_at_eoc: bool) -> Option<Option<Vec<u8>>> {
        if stop_at_eoc && input.get(*pos..*pos + 2) == Some(&[0, 0]) {
            *pos += 2;
            return Some(None);
        }
        let start = *pos;
        let first = *input.get(*pos)?;
        *pos += 1;
        if first & 0x1f == 0x1f {
            loop {
                let b = *input.get(*pos)?;
                *pos += 1;
                if b & 0x80 == 0 { break; }
            }
        }
        let tag_end = *pos;
        let lb = *input.get(*pos)?;
        *pos += 1;
        let indefinite = lb == 0x80;
        let content_len = if lb < 0x80 {
            lb as usize
        } else if indefinite {
            0
        } else {
            let count = (lb & 0x7f) as usize;
            if count == 0 || count > std::mem::size_of::<usize>() { return None; }
            let mut n = 0usize;
            for _ in 0..count { n = n.checked_mul(256)?.checked_add(*input.get(*pos)? as usize)?; *pos += 1; }
            n
        };
        if indefinite && first & 0x20 == 0 { return None; }
        let mut body = Vec::new();
        if first & 0x20 != 0 {
            if indefinite {
                loop {
                    match element(input, pos, true)? {
                        Some(child) => body.extend(child),
                        None => break,
                    }
                }
            } else {
                let end = pos.checked_add(content_len)?;
                if end > input.len() { return None; }
                while *pos < end {
                    body.extend(element(&input[..end], pos, false)??);
                }
                if *pos != end { return None; }
            }
        } else {
            let end = pos.checked_add(content_len)?;
            body.extend_from_slice(input.get(*pos..end)?);
            *pos = end;
        }
        let mut out = input[start..tag_end].to_vec();
        length(&mut out, body.len());
        out.extend(body);
        Some(Some(out))
    }

    let mut pos = 0;
    let out = element(input, &mut pos, false)??;
    if input[pos..].iter().any(|b| *b != 0) { return None; }
    Some(out)
}

#[cfg(test)]
mod tests {
    use super::{ber_to_der, der_total_len};

    #[test]
    fn der_total_len_rejects_overflowing_lengths() {
        assert_eq!(der_total_len(&[0x30, 0x05]), Some(7));
        assert_eq!(der_total_len(&[0x30, 0x82, 0x01, 0x00]), Some(4 + 256));
        // 8 length bytes of 0xFF: 2 + 8 + usize::MAX overflows.
        let mut b = vec![0x30, 0x88];
        b.extend_from_slice(&[0xFF; 8]);
        assert_eq!(der_total_len(&b), None);
        // Length-of-length wider than usize.
        let mut b = vec![0x30, 0x89];
        b.extend_from_slice(&[0x01; 9]);
        assert_eq!(der_total_len(&b), None);
    }

    #[test]
    fn converts_nested_indefinite_ber() {
        assert_eq!(ber_to_der(&[0x30, 0x80, 0x02, 0x01, 0x01, 0, 0]), Some(vec![0x30, 3, 2, 1, 1]));
        assert_eq!(ber_to_der(&[0x30, 3, 2, 1, 1, 0, 0]), Some(vec![0x30, 3, 2, 1, 1]));
    }
}
