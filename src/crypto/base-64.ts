export function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(string: string): ArrayBuffer {
  string = window.atob(string);
  const buf = new ArrayBuffer(string.length); // 2 bytes for each char
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < string.length; i++) {
    bufView[i] = string.charCodeAt(i);
  }
  return buf;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function stringToArrayBuffer(string: string): ArrayBuffer {
  return encoder.encode(string);
}

export function arrayBufferToString(buffer: ArrayBuffer): string {
  return decoder.decode(buffer);
}
