const models = require("../models/index");
const CustomError = require("../util/CustomError");

module.exports = async (req, res, next) => {
  try {
    const email = req.body.email;

    const user = await models.User.findOne({ where: { email: email } });
    if (!user) {
      throw new CustomError("user not found !", 400);
    }
    const CertificateOrder = await models.CertificateOrders.findOne({
      where: { user_id: user.id },
    });
    if (CertificateOrder.reqStatus == "pending" || "processing") {
      throw new CustomError(
        `the status of the order is ${CertificateOrder.reqStatus}`
      );
    } else if (CertificateOrder.reqStatus == "rejected") {
      return res.json({
        message: `the status of the order is ${CertificateOrder.reqStatus}`,
      });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};
