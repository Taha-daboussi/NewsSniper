const Kw = async (t, n, r) => {
  const i = Yw(t);
  const a = await (async (t, n) => {
    const r = await fetch(`${n}/system/meme`, {
      headers: {
        Authorization: `Bearer ${t}`
      }
    });
    return (await r.json()).publicKey;
  })(n, r);
  const o = await async function(t) {
    const n = Uw(t.replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----", "").replace(/\n/g, ""));
    return await window.crypto.subtle.importKey("spki", n, {
      name: "RSA-OAEP",
      hash: "SHA-256"
    }, !0, ["encrypt"]);
  }(a);
  return zw(await window.crypto.subtle.encrypt({
    name: "RSA-OAEP"
  }, o, i));
};

function Yw(t) {
  return (new TextEncoder()).encode(t);
}

function zw(t) {
  const n = new Uint8Array(t);
  let r = "";
  for (let i = 0; i < n.byteLength; i++)
    r += String.fromCharCode(n[i]);
  return btoa(r);
}

const Dw = async (t, n, r) => {
  const { iv: i, aesKey: a, data: o } = await (async t => {
    const n = Yw(t);
    const r = window.crypto.getRandomValues(new Uint8Array(16));
    const i = await window.crypto.subtle.generateKey({
      name: "AES-CBC",
      length: 256
    }, !0, ["encrypt", "decrypt"]);
    const a = zw(await window.crypto.subtle.encrypt({
      name: "AES-CBC",
      iv: r
    }, i, n));
    return {
      aesKey: zw(await window.crypto.subtle.exportKey("raw", i)),
      iv: zw(r),
      data: a
    };
  })(t);
  return {
    raw1: i,
    raw2: await Kw(a, n, r),
    raw3: o
  };
};

const Uw = t => {
  const n = atob(t);
  const r = n.length;
  const i = new Uint8Array(r);
  for (let a = 0; a < r; a++)
    i[a] = n.charCodeAt(a);
  return i;
};

module.exports = { Kw, Dw, Yw, zw, Uw };