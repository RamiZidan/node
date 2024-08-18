const forge = require("node-forge");
const crypto = require("crypto");
const fs = require("fs");
const bigIntaseger = require("big-integer");
const BigNumber = require("bignumber.js");

function bigIntToBuffer(bigint) {
  let hexString = bigint.toString(16);

  if (hexString.length % 2) {
    hexString = "0" + hexString;
  }

  return Buffer.from(hexString, "hex");
}

function pemToPrivateKey(privateKeyPem) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  return privateKey;
}

function hashToBigInt(hashString) {
  if (!hashString.startsWith("0x")) {
    hashString = "0x" + hashString;
  }

  const bigIntValue = BigInt(hashString);

  return bigIntValue;
}

function forgeBigIntegerToBigInt(forgeBigInt) {
  return BigInt("0x" + forgeBigInt.toString(16));
}

function computeTotient(p, q) {
  return (p - 1n) * (q - 1n);
}

function computePrivateExponent_D(totient, e) {
  const eBigInt = BigInt(e);
  return modInverse(eBigInt, totient);
}

function modInverse(a, m) {
  let m0 = m;
  let y = 0n,
    x = 1n;

  if (m === 1n) return 0n;

  while (a > 1n) {
    let q = a / m;
    let t = m;

    m = a % m;
    a = t;
    t = y;

    y = x - q * y;
    x = t;
  }

  if (x < 0n) x += m0;

  return x;
}

function generatePublicKey(n, e) {
  return {
    n: n,
    e: e,
  };
}

function generatePrivateKey(n, d) {
  return {
    n: n,
    d: d,
  };
}

function stringToBigInt(str) {
  return BigInt("0x" + forge.md.sha256.create().update(str).digest().toHex());
}

function encryptionCiphertext(message, publicKey) {
  console.log("message:", message);
  console.log("n:", forgeBigIntegerToBigInt(publicKey.n));
  console.log("d:", forgeBigIntegerToBigInt(publicKey.d));
  const digest = bigIntaseger(message);
  return new Promise((resolve, reject) => {
    try {
      const result = digest.modPow(
        forgeBigIntegerToBigInt(publicKey.d),
        forgeBigIntegerToBigInt(publicKey.n)
      );
      console.log(result);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

function decryptionCiphertext(ciphertext, privateKey) {
  console.log(forge.pki.publicKeyFromPem(privateKey).e);
  console.log(forge.pki.publicKeyFromPem(privateKey).n);
  console.log(ciphertext);
  const signature = bigIntaseger(ciphertext);

  return new Promise((resolve, reject) => {
    try {
      const result = signature.modPow(
        BigInt(forge.pki.publicKeyFromPem(privateKey).e),
        BigInt(forge.pki.publicKeyFromPem(privateKey).n)
      );
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

function generateLargePrime(bits) {
  return new Promise((resolve, reject) => {
    forge.prime.generateProbablePrime(bits, (err, num) => {
      if (err) {
        reject(err);
      } else {
        resolve(num);
      }
    });
  });
}

exports.RSA = async (req, res, next) => {
  try {
    const p = await generateLargePrime(2048);
    const q = await generateLargePrime(2048);

    const pBigInt = forgeBigIntegerToBigInt(p);
    const qBigInt = forgeBigIntegerToBigInt(q);

    const n = pBigInt * qBigInt;

    const Tn = computeTotient(pBigInt, qBigInt);

    const e = 65537;

    const D = computePrivateExponent_D(Tn, e);

    const publicKey = generatePublicKey(n, e);

    const privateKey = generatePrivateKey(n, D);

    const bitLength = n.toString(2).length;

    // console.log(`Prime p: ${p}`);
    // console.log(`Prime q: ${q}`);
    // console.log(`Modulus n: ${n}`);
    // console.log(`D: ${D}`);
    // console.log(`keykey: ${publicKey.n}`);
    // console.log("Public Key:", publicKey);
    // console.log("Private Key:", privateKey);
    // console.log(`Bit length of n: ${bitLength}`);
    return { publicKey, privateKey };
  } catch (err) {
    console.error("Error generating primes:", err);
  }
};

function encryptionRSA(message, Key) {
  try {
    const ciphertext = encryptionCiphertext(message, Key);
  } catch (err) {
    console.log(err);
    res
      .json({
        message: "failed",
      })
      .status(400);
  }
}

exports.decryptionRSA = (req, res, next) => {
  const { ciphertext, Key } = req.body;
  const message = decryptionCiphertext(ciphertext, Key);
  res.send({ message: message.toString() });
};

exports.customKeyToForgeKey = (publicKey, privateKey) => {
  const pubKey = forge.pki.rsa.setPublicKey(
    new forge.jsbn.BigInteger(publicKey.n.toString()),
    new forge.jsbn.BigInteger(publicKey.e.toString())
  );

  const privKey = forge.pki.rsa.setPrivateKey(
    new forge.jsbn.BigInteger(privateKey.n.toString()),
    new forge.jsbn.BigInteger(
      privateKey.e ? privateKey.e.toString() : publicKey.e.toString()
    ),
    new forge.jsbn.BigInteger(privateKey.d.toString()),
    new forge.jsbn.BigInteger("0"),
    new forge.jsbn.BigInteger("0"),
    new forge.jsbn.BigInteger("0"),
    new forge.jsbn.BigInteger("0"),
    new forge.jsbn.BigInteger("0")
  );

  return { publicKey: pubKey, privateKey: privKey };
};

exports.digitalSigning = async (req, res, next) => {
  try {
    const { message, privateKey } = req.body;

    const hash = sha256(message);
    const privateKey2 = crypto.createPrivateKey({
      key: fs.readFileSync("user.key"),
      format: "pem",
    });
    
    const pkcs8Key = privateKey2.export({
      format: "pem",
      type: "pkcs8",
    });

    const signature = await encryptionCiphertext(
      hashToBigInt(hash),
      pemToPrivateKey(pkcs8Key)
    );

    res.status(200).json({
      message: "success",
      signature: await signature,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.verifySignature = (req, res, next) => {
  try {
    const { message, signature } = req.body;

    const hash = sha256(message);

    const privateKey2 = crypto.createPublicKey({
      key: fs.readFileSync("public.key"),

      format: "pem",
    });

    const pkcs8Key = privateKey2.export({
      format: "pem",
      type: "pkcs1",
    });

    const isValid = decryptionCiphertext(signature, pkcs8Key);

    console.log(isValid);
    console.log(hashToBigInt(hash));

    res.status(200).json({
      message: "success",
      isValid: isValid,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}
