const models = require("../models/index");
const forge = require("node-forge");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const RSA = require("./digitalSigningController");
// exports.sendPersonalInfo = async (req, res, next) => {
//   const { imageFront, imageBack } = req.body;
// };

exports.uploadUserData = async (req, res, next) => {
  const { fullName, nationalNumber } = req.body;
  try {
    if (!req.user) {
      throw new CustomError("user is not set", 400);
    }
    let user_image = await models.CertificateOrders.create({
      user_id: req.user.id,
      image_frontSide: path.relative(
        "public",
        req.files.image_frontSide[0].path
      ),
      image_backSide: path.relative("public", req.files.image_backSide[0].path),
      fullName: fullName,
      nationalNumber: nationalNumber,
      reqStatus: "pending",
    });
    return res.status(200).json({
      message: "images successfully uploaded",
      data: user_image,
    });
  } catch (err) {
    next(err);
  }
};

exports.changeOrderStatus = async (req, res, next) => {
  const { status } = req.body;
  try {
    if (!req.user) {
      throw new CustomError("user is not set", 400);
    }
    let id = req.user.id;

    const order = await models.CertificateOrders.findOne({
      where: { user_id: id },
    });
    console.log(order);
    await order.update({ reqStatus: status });
    await order.save();
    res.status(200).json({
      message: "order status updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.createDigitalCertificate = async (req, res, next) => {
  const {
    serialNum,
    subject,
    validityPeriod,
    userEmail,
    organization,
    CAprivateKey,
    version,
    country,
  } = req;
  try {
    if (!req.admin) {
      throw new CustomError("user is not set", 400);
    }
    const RSAR = await RSA.RSA();
    const customPublicKey = RSAR.publicKey;
    const customPrivateKey = RSAR.privateKey;

    const { publicKey, privateKey } = RSA.customKeyToForgeKey(
      customPublicKey,
      customPrivateKey
    );

    const user = await models.User.findOne({ where: { email: userEmail } });

    if (user) {
      const certificate = await models.DigitalCertificates.create({
        user_id: user.id,
        version: version,
        serialNumber: serialNum,
        organization: organization,
        signatureAlgorithm: "RSA",
        issuer: req.admin.firstName + " " + req.admin.lastName,
        validatePeriod: validityPeriod,
        subject: subject,
      });
    }

    const publicK = await models.PublicKeys.create({
      user_id: user.id,
      publicKey: publicKey,
    });
    const csr = forge.pki.createCertificationRequest();
    csr.publicKey = publicKey;
    csr.setSubject([
      { name: "full Name", value: fullName },
      { name: "version", value: version },
      { name: "Serial number", value: serialNum },
      { name: "Subject", value: subject },
      { name: "Issuer", value: req.admin.firstName + " " + req.admin.lastName },
      { name: "Validity period", value: validityPeriod },
      { name: "Public key", value: publicKey },
      { name: "countryName", value: country },
      { name: "emailAddress", value: userEmail },
    ]);
    csr.addAttribute({
      name: "extensionRequest",
      extensions: [
        {
          name: "subjectAltName",
          altNames: [
            {
              type: 2,
              value: "www.example.com",
            },
            {
              type: 1,
              value: "john.doe@example.com",
            },
          ],
        },
        {
          name: "keyUsage",
          critical: true,
          ivalues: ["digitalSignature", "keyEncipherment"],
        },
        {
          name: "extendedKeyUsage",
          critical: true,

          value: ["serverAuth", "clientAuth"],
        },
      ],
    });

    csr.sign(CAprivateKey);

    const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
    // const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
    const csrPem = forge.pki.certificationRequestToPem(csr);

    const platform = os.platform();

    let filePathKey;
    let filePathCsr;

    if (platform === "win32" || platform === "darwin" || platform === "linux") {
      const desktopDir = path.join(os.homedir(), "Desktop");
      filePathKey = path.join(desktopDir, "user.key");
      filePathCsr = path.join(desktopDir, "user.csr");
    } else if (platform === "android" || platform === "ios") {
      const downloadsDir = path.join(os.homedir(), "Downloads", "CustomFolder");
      fs.mkdirSync(downloadsDir, { recursive: true });
      filePathKey = path.join(downloadsDir, "user.key");
      filePathCsr = path.join(downloadsDir, "user.csr");
    } else {
      throw new Error("Unsupported platform");
    }

    fs.writeFileSync(filePathKey, privateKeyPem);
    fs.writeFileSync(filePathCsr, csrPem);

    // const filePathKey = path.join(__dirname, "user.key");
    // const filePathKey2 = path.join(__dirname, "public.key");
    // fs.writeFileSync(filePathKey, privateKeyPem);
    // fs.writeFileSync(filePathKey2, publicKeyPem);

    console.log("CSR is now ready to be sent to the CA.");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }

  return res.status(200).json({
    message: "the certificate order was sent to the CA",
  });
};

exports.verifyCertificate = (req, res, next) => {
  const { certificate } = req.body;
  try {
    const csr = forge.pki.certificationRequestFromPem(certificate);

    const subject = csr.subject.attributes.map((attr) => {
      return {
        type: attr.name,
        value: attr.value,
      };
    });

    res.json({
      message: "CSR verified successfully!",
      subject: subject,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Invalid CSR format or verification failed." });
  }
};
