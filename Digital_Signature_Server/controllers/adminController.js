const models = require("../models/index");
const CustomError = require("../util/CustomError");
const path = require("path");

exports.getAllUsers = async (req, res, next) => {
  try {
    const userData = await models.User.findAll();
    if (userData.length > 0) {
      return res.status(200).json({ message: "Success", data: userData });
    } else {
      return res
        .status(200)
        .json({ message: "There is no users to show", data: userData });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllAdmins = async (req, res, next) => {
  try {
    const admins = await models.Admin.findAll();
    if (admins.length === 0) {
      return res.status(200).json({
        message: "There is no admins to show",
        data: admins,
      });
    } else {
      return res.status(200).json({
        message: "Success",
        data: admins,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllContracts = async (req, res, next) => {
  try {
    const contracts = await models.Contract.findAll();
    if (contracts.length === 0) {
      return res.status(200).json({
        message: "there is no contracts to show",
        data: contracts,
      });
    } else {
      return res.status(200).json({
        message: "Success",
        data: contracts,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.addContract = async (req, res, next) => {
  try {
    const { contractName, description } = req.body;
    const contract = await models.Contract.create({
      contractName: contractName,
      contract: path.relative("public", req.file.path),
      description: description,
    });
    return res.status(200).json({
      message: "contract uploaded successfully",
      data: contract,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteContract = async (req, res, next) => {
  try {
    const contract = await models.Contract.findOne({
      where: { id: req.params.contract_id },
    });
    if (!contract) {
      return res.status(400).json({
        message: "there is no contract with this id",
      });
    }
    await contract.destroy();
    return res.status(200).json({
      message: "Contract deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllDocuments = async (req, res, next) => {
  try {
    const documents = await models.Document.findAll();
    if (documents.length === 0) {
      return res.status(200).json({
        message: "there is no documents to show",
        data: documents,
      });
    } else {
      return res.status(200).json({
        message: "Success",
        data: documents,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getDocumentById = async (req, res , next)=>{
  try{
    const document = await models.Document.find({id: req.params.documentId }) ; 
    if(!document){
      return res.status(200).json({
        message:'document not found' ,
        data: {}
      })
    }
    else{
      return res.status(200).json({
        message:'success',
        data: document
      })
    }
  }catch(err){
    next(err)
    
  }
}

exports.getUserById = async (req, res, next) => {
  try {
    const userId = await req.params.userId;
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

exports.getUserDocumentsById = async (req, res, next) => {
  try {
    const userId = req.params.userId;
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

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await models.User.findOne({
      where: { id: req.params.user_id },
    });
    if (!user) {
      return res.status(400).json({
        message: "there is no user with this id",
      });
    }

    const parties = await models.VariousParties.findAll({
      where: { user_id: user.id },
    });
    for (const element of parties) {
      // if the user deleted the document before signing
      if (element.isSigned === false) {
        await models.Document.update(
          { documentStatus: "rejected" },
          { where: { id: element.document_id } }
        );
      }
    }

    await user.destroy();
    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const user = await models.User.findOne({
      where: { id: req.params.user_id },
    });
    if (!user) {
      return res.status(400).json({ message: "there is no user with this id" });
    }
    user.blocked = req.body.blocked;
    user.save();
    if (req.body.blocked == 1) {
      return res.status(200).json({
        message: "User blocked successfully",
      });
    } else {
      return res.status(200).json({
        message: "User unblocked successfully",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.search = (req, res, next) => {};
