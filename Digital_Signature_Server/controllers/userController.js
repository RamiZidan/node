const models = require("../models/index");
const path = require("path");
const CustomError = require("../util/CustomError");

exports.uploadIdImages = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new CustomError("user is not set", 400);
    }
    let user_image = await models.UserIDImage.create({
      user_id: req.user.id,
      image_frontSide: path.relative(
        "public",
        req.files.image_frontSide[0].path
      ),
      image_backSide: path.relative("public", req.files.image_backSide[0].path),
    });
    return res.status(200).json({
      message: "images successfully uploaded",
      data: user_image,
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadDocument = async (req, res, next) => {
  const transaction = await models.sequelize.transaction();
  try {
    const emails = req.body.emails;
    const user = await models.User.findOne({
      where: { id: req.user.id },
      transaction,
    });

    const documentName = req.body.documentName || req.file.originalname;
    let doc = await models.Document.create(
      {
        documentName: documentName,
        document: path.relative("public", req.file.path),
        documentStatus: "processing",
        counter: emails.length + 1,
      },
      { transaction }
    );

    await user.addDocument(doc, { through: { isSigned: false }, transaction });

    for (const email of emails) {
      let us = await models.User.findOne({
        where: { email: email },
        transaction,
      });
      if (!us) {
        throw new CustomError(`${email} is not a user`);
        /*
        // add to the database as a guest
        us = await models.User.create({ email: email }, { transaction });
        // send a registration email to notify him that he should register
        // set a registrationExpiry for the user
        // create a scheduled job (node-cron) 
        // delete the user if the registrationExpiry is out
        */
      }
      await models.VariousParties.create(
        {
          user_id: us.id,
          document_id: doc.id,
          isSigned: false,
        },
        { transaction }
      );
    }
    await transaction.commit();
    return res.json({
      message: "Document uploaded successfully",
      data: doc,
    });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

// via token
exports.getUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await models.User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(200).json({
        message: "there is no user with this id",
        data: user,
      });
    } else {
      return res.status(200).json({
        message: "Success",
        data: user,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getUserDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await models.User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(200).json({
        message: "there is no user with this id",
        data: user,
      });
    } else {
      const userData = await models.User.findOne({
        where: { id: user.id },
        include: models.Document,
      });
      if (userData.Documents.length === 0) {
        return res.status(200).json({
          message: "there is no documents to show",
          data: userData.Documents,
        });
      }
      return res.status(200).json({
        message: "Success",
        data: userData.Documents,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getDocumentParties = async (req, res, next) => {
  try {
    const documentId = req.params.document_id;
    const document = await models.Document.findByPk(documentId);
    if (!document) {
      throw new CustomError("Document not found", 400);
    }
    const variousParties = await models.VariousParties.findAll({
      where: { document_id: documentId },
      include: [
        {
          model: models.User,
        },
      ],
    });
    if (variousParties.length == 0) {
      throw new CustomError("Document not found", 400);
    }
    const result = {
      document,
      variousParties,
    };
    return res.status(200).json({
      message: "Success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// require a doc_id and token
exports.deleteDocument = async (req, res, next) => {
  try {
    const document_id = req.params.document_id;
    const user = await models.User.findOne({ where: { id: req.user.id } });

    const a = await models.VariousParties.findOne({
      where: { user_id: user.id, document_id: document_id },
    });
    if (!a) {
      return res.status(200).json({
        message: "Document not found",
      });
    }
    a.destroy();

    const document = await models.VariousParties.findOne({
      where: { document_id: document_id },
    });
    if (!document) {
      await models.Document.destroy({ where: { id: document_id } });
    }

    // if the user deleted the document before signing
    if (user.isSigned === false) {
      await models.Document.update(
        { documentStatus: "rejected" },
        { where: { id: document_id } }
      );
    }
    res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
