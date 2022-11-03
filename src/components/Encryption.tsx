import { encrypt } from "@metamask/eth-sig-util";
import { Buffer } from "buffer";
import React, { useState } from "react";
import { useMetamask } from "../hooks/useMetamask";

// https://betterprogramming.pub/exchanging-encrypted-data-on-blockchain-using-metamask-a2e65a9a896c
function encryptData(publicKey: Buffer, data: Buffer): Buffer {
  const enc = encrypt({
    publicKey: publicKey.toString("base64"),
    data: data.toString("base64"),
    version: "x25519-xsalsa20-poly1305",
  });

  const buf = Buffer.concat([
    Buffer.from(enc.ephemPublicKey, "base64"),
    Buffer.from(enc.nonce, "base64"),
    Buffer.from(enc.ciphertext, "base64"),
  ]);

  return buf;
}

// https://betterprogramming.pub/exchanging-encrypted-data-on-blockchain-using-metamask-a2e65a9a896c
async function decryptData(account: string, data: Buffer): Promise<Buffer> {
  const structuredData = {
    version: "x25519-xsalsa20-poly1305",
    ephemPublicKey: data.slice(0, 32).toString("base64"),
    nonce: data.slice(32, 56).toString("base64"),
    ciphertext: data.slice(56).toString("base64"),
  };

  const ct = `0x${Buffer.from(JSON.stringify(structuredData), "utf8").toString("hex")}`;

  const decrypt = await (window as any).ethereum.request({
    method: "eth_decrypt",
    params: [ct, account],
  });

  return Buffer.from(decrypt, "base64");
}

// https://betterprogramming.pub/exchanging-encrypted-data-on-blockchain-using-metamask-a2e65a9a896c
async function getPublicKey(address: string): Promise<Buffer> {
  const publicKey = await (window as any).ethereum?.request({
    method: "eth_getEncryptionPublicKey",
    params: [address],
  });

  return publicKey;
}

export function Encryption() {
  const { address } = useMetamask();
  const [data, setData] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [decryptedData, setDecryptedData] = useState("");

  function handleDataChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setData(e.target.value);
  }

  async function handleClickEncrypt() {
    const publicKey = await getPublicKey(address);
    const encryptedData = encryptData(publicKey, Buffer.from(data));
    setEncryptedData(encryptedData.toString("hex"));
  }

  async function handleClickDecrypt() {
    const decrypted = await decryptData(address, Buffer.from(encryptedData, "hex"));
    setDecryptedData(decrypted.toString());
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", width: "500px" }}>
        <header>Encryption</header>
        <div style={{ textAlign: "left", fontSize: "18px", marginTop: "16px" }}>
          Data to encrypt
        </div>
        <textarea rows={4} style={{ marginTop: "16px" }} onChange={handleDataChange} value={data} />
        <button onClick={handleClickEncrypt} style={{ marginTop: "16px" }}>
          Encrypt
        </button>
        {encryptedData && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: "48px" }}>
              <header>Decryption</header>
              <div style={{ fontSize: "18px", textAlign: "left", marginTop: "24px" }}>
                Your encrypted data
              </div>
              <textarea
                rows={4}
                style={{ marginTop: "16px" }}
                onChange={handleDataChange}
                value={encryptedData}
              />
              <button onClick={handleClickDecrypt} style={{ marginTop: "16px" }}>
                Decrypt
              </button>
            </div>
          </div>
        )}
        {decryptedData && (
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column" }}>
            <div>Decrypted data</div>
            <div
              style={{
                marginTop: "24px",
                padding: "24px",
                fontSize: "24px",
                border: "1px solid green",
              }}
            >
              {decryptedData}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
