const models = require("../models/index");
const forge = require("node-forge");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const RSA = require("./digitalSigningController");
const archiver = require("archiver");
const CustomError = require("../util/CustomError");

exports.uploadUserData = async (req, res, next) => {
  const { fullName, nationalNumber } = req.body;
  try {
    const existingCertificate = await models.CertificateOrders.findOne({
      where: { user_id: req.user.id },
    });
    if (existingCertificate ) {
      return res
        .status(400)
        .json({ message: "You already have a certificate." });
    }
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
      // liveImage: path.relative("public", req.files.liveImage[0].path),
      fullName: fullName,
      nationalNumber: nationalNumber,
      reqStatus: "pending",
    });
    return res.status(200).json({
      message: "images successfully uploaded",
      data: user_image,
    });
  } catch (err) {
    if (req.files) {
      if (req.files.image_frontSide && req.files.image_frontSide[0]) {
        fs.unlink(req.files.image_frontSide[0].path, (unlinkErr) => {
          if (unlinkErr)
            console.error("Failed to delete front side image:", unlinkErr);
        });
      }
      if (req.files.image_backSide && req.files.image_backSide[0]) {
        fs.unlink(req.files.image_backSide[0].path, (unlinkErr) => {
          if (unlinkErr)
            console.error("Failed to delete back side image:", unlinkErr);
        });
      }
      // if (req.files.liveImage && req.files.liveImage[0]) {
      //   fs.unlink(req.files.liveImage[0].path, (unlinkErr) => {
      //     if (unlinkErr)
      //       console.error("Failed to delete live Image:", unlinkErr);
      //   });
      // }
    }
    next(err);
  }
};

exports.changeOrderStatus = async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params ; 

  try {
    
    // let id = req.user;

    const order = await models.CertificateOrders.findOne({
      where: { id : id },
    });
    
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
  // edit to generate all

  const { organization } = req;
  try {
    const existingCertificate = await models.CertificateOrders.findOne({
      where: { userId: req.user.id },
    });

    if (existingCertificate) {
      return res
        .status(400)
        .json({ message: "You already have a certificate." });
    }

    const timestamp = Date.now().toString(16);
    const randomBytes = crypto.randomBytes(8).toString("hex");
    const serialNumber = `${timestamp}${randomBytes}`;

    const RSAR = await RSA.RSA();
    const customPublicKey = RSAR.publicKey;
    const customPrivateKey = RSAR.privateKey;

    const { publicKey, privateKey } = RSA.customKeyToForgeKey(
      customPublicKey,
      customPrivateKey
    );

    const user = await models.User.findOne({ where: { id: req.user.id } });
    // const user = await models.User.findOne({ where: { email: userEmail } });
    let currentDate = new Date();
    let validityPeriod = currentDate.setFullYear(currentDate.getFullYear() + 1);
    const certificate = await models.DigitalCertificate.create({
      user_id: user.id,
      version: "X.509",
      serialNumber: serialNumber,
      organization: organization,
      signatureAlgorithm: "RSA",
      issuer: user.firstName + " " + user.lastName,
      validatePeriod: validityPeriod,
      subject: "individual certificate",
    });

    const publicKeyPem = forge.pki.publicKeyToPem(publicKey);

    const publicK = await models.PublicKey.create({
      user_id: user.id,
      publicKey: publicKeyPem,
    });

    const csr = forge.pki.createCertificationRequest();
    if (!publicKey) {
      throw new Error("Public key is null or undefined");
    }
    csr.publicKey = publicKey;

    if (!user || !user.firstName || !user.lastName || !user.email) {
      throw new Error("Invalid user object");
    }

    csr.setSubject([
      {
        name: "commonName",
        value: `${user.firstName} ${user.lastName}`,
      },
      {
        name: "emailAddress",
        value: user.email,
      },
      {
        name: "organizationName",
        value: `${user.firstName} ${user.lastName}`,
      },
    ]);

    csr.addAttribute({
      name: "extensionRequest",
      extensions: [
        {
          name: "subjectAltName",
          altNames: [
            {
              type: 2, // DNS type
              value: "www.Dsign.com",
            },
            {
              type: 1, // Email type
              value: user.email,
            },
          ],
        },
        {
          name: "keyUsage",
          critical: true,
          usages: ["digitalSignature", "keyEncipherment"],
        },
        {
          name: "extKeyUsage",
          critical: true,
          usages: ["serverAuth", "clientAuth"],
        },
      ],
    });
    csr.sign(privateKey, forge.md.sha256.create());

    const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
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

    /////////////////////////////////////
    const zipFileName = "user_files.zip";
    const output = fs.createWriteStream(zipFileName);
    const archive = archiver("zip", { zlib: { level: 9 } });

    let responseSent = false;

    req.on("aborted", () => {
      console.log("Request aborted by the client.");
      responseSent = true;
      archive.abort();
      output.end();

      fs.unlink(zipFileName, (err) => {
        if (err) console.error("Error deleting incomplete ZIP file:", err);
      });
    });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      if (!responseSent) {
        responseSent = true;
        res.status(500).send("Error creating archive");
      }
    });

    output.on("close", () => {
      if (!responseSent) {
        responseSent = true;
        res.download(zipFileName, zipFileName, (err) => {
          if (err) {
            console.error("ZIP file download failed:", err);
            res.status(500).send("Error downloading ZIP file");
          } else {
            fs.unlink(zipFileName, (err) => {
              if (err) console.error("Error deleting ZIP file:", err);
            });
          }
        });
      }
    });

    output.on("finish", () => {
      if (!responseSent) {
        responseSent = true;
        res.end();
      }
    });

    archive.pipe(output);

    archive.file(filePathCsr, { name: "user.csr" });
    archive.file(filePathKey, { name: "user.key" });

    archive.finalize();
    ////////////////////////////////////
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
    const certificate1 = fs.readFileSync(certificate);
    const csr = forge.pki.certificationRequestFromPem(certificate1);
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
    console.log(error);
    res
      .status(500)
      .json({ error: "Invalid CSR format or verification failed." });
  }
};

exports.getCertificateOrderStatus = (req, res, next) => {
  const status = models.CertificateOrders.findOne({
    where: { user_id: req.user.id },
  });

  return res.status(200).json({
    message: success,
    status: status.reqStatus,
  });
};

exports.getAllCertificateOrders = async (req, res, next) => {
  try {
    const certificateOrders = await models.CertificateOrders.findAll();

    return res.status(200).json(certificateOrders);
  } catch (error) {
    console.error("Error fetching certificate orders:", error);
    return res.status(500).json({
      message: "Failed to retrieve certificate orders",
      error: error.message,
    });
  }
};







exports.storePublicKey  = async (req, res, next) => {
  let {publicKey } = req.body ; 
  
  try{
    const existingCertificate = await models.DigitalCertificate.count({
      where:{user_id: req.user.id }
    }); 
    console.log('req' ,req.user.id)
    console.log(existingCertificate );
    if(existingCertificate > 0){
      return res.status(422).json({
        message:'You already have a digital certificate you cannot regenreate one'
      });
    }
    const publicKey_ = await models.PublicKey.create({
      user_id: req.user.id,
      publicKey: publicKey ,
    });
    let currentDate = new Date();
    let validityPeriod = currentDate.setFullYear(currentDate.getFullYear() + 1);

    const timestamp = Date.now().toString(16);
    const randomBytes = crypto.randomBytes(8).toString("hex");
    const serialNumber = `${timestamp}${randomBytes}`;
    const certificate = await models.DigitalCertificate.create({
      user_id: req.user.id,
      version: "X.509",
      serialNumber: 1,
      organization: '--',
      signatureAlgorithm: "RSA",
      issuer: req.user.firstName + " " + req.user.lastName,
      validatePeriod: validityPeriod,
      subject: "individual certificate",
    });
    return res.status(200).json({
      message:'created certifcate succesfully',
      data: certificate
    });

  }
  catch(error){
    console.log(error);
    res.status(500).json({error:'unable to store digital certificate'})
  }
};


async function verify(signature, publicKey, document) {
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = publicKey.substring(pemHeader.length, publicKey.length - pemFooter.length);
    const binaryDerString = atob(pemContents);
    const binaryDer = Uint8Array.from(binaryDerString, char => char.charCodeAt(0));

    const key = await crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: { name: "SHA-256" },
        },
        false,
        ["verify"]
    );

    const isValid = await crypto.subtle.verify(
        "RSASSA-PKCS1-v1_5",
        key,
        Uint8Array.from(atob(signature), c => c.charCodeAt(0)),
        new TextEncoder().encode(document)
    );
    
    return isValid;
}



exports.storeDocument = async (req, res , next)=>{
  try{
    let { signature , emails , base64file } = req.body ;
    emails = emails.split(',');
    let document_path =  path.resolve(  req.files.document[0].path ) ;
    
    console.log('--------------------------------------------')
    let document_msg = base64file ;
    let publicKey = await models.PublicKey.findOne({
      where:{user_id: req.user.id} 
    });
    console.log('00000000000000000000000000000000000')
    let isValid  = await verify(signature , publicKey.publicKey , document_msg ) ; 
    console.log(isValid ,document_msg )
    if(!isValid){
      return res.status(422).json({message:'Failed to verify Identity: Signature does not match public key'}) ;
    }
    console.log('1111111111111111111111111111111111111111')
    console.log(emails );
    let document = await models.Document.create({
      document: req.files.document[0].path , 
      documentName: req.files.document[0].originalname ,
      counter: emails.length ,
      documentStatus:'processing'
    });
    console.log('2222222222222222222222222222222222222222222222222')
    let signingParty = await models.VariousParties.create({
      user_id: req.user.id , 
      document_id : document.id ,
      isSigned: true 
    });
    console.log('3333333333333333333333333333333333333333333333333')
    let variousParites = []; 
    
    for(let i = 0 ;i < emails.length ; i++){
      let user = await models.User.findOne({where:{email: emails[i]}}) ; 
      if(!user){
        return res.status(422).json({message:'user not in the system'}) ; 
      }
      variousParites.push({
        user_id: user.id ,
        document_id: document.id ,
        isSigned: false
      });
      console.log('4444444444444444444444444444444444444444444444')
      let parites = await models.VariousParties.create({user_id: user.id , document_id : document.id , isSigned: false });
      console.log('5555555555555555555555555555555555555')
    }
    return res.status(200).json({
      message:'created succesfully'
    });
  }
  catch(err){
    console.log(err);

  }
}

exports.signDocument = async (req, res , next )=>{
  let {signature , document_id } = req.body ; 
  let user = req.user ; 
  
  let publicKeyObj = await models.PublicKey.findOne({
    where:{user_id: req.user.id} 
  });
  if(!publicKeyObj){
    return res.status(422).json({
      message:'User cannot sign document because he did not generate identity'
    });
  }
  
  let publicKey = publicKeyObj.publicKey ; 

  let document = await models.Document.findOne({
    where:{id: document_id}
  });
  let file = fs.readFileSync(path.resolve( document?.document)) ;
  let base64 = Buffer.from(file).toString('base64') ;
  let isValid = verify(signature , publicKey , base64) ; 

  if(!isValid){
    return res.status(422).json({
      message:'Failed to verify signature' 
    });
  }
  console.log(models.variousParties);
  let variousParties = await models.VariousParties.findOne({
    where:{user_id: user.id , document_id: document_id }
  });
  variousParties.update({isSigned:true}) ; 
  variousParties.save();
  if(document.counter == 1){
    document.update({counter: document.counter - 1, documentStatus: 'approved'});
  }
  else{
    document.update({counter : document.counter - 1 });
  }
  return res.status(200).json({
    message:'signed succesfully'
  })
}