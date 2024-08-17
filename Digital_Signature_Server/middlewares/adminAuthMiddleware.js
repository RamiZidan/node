const jwt = require("jsonwebtoken");
const models = require("../models/index");
const CustomError = require("../util/CustomError");

module.exports = (req, res, next) => {
  try {
    let authHeader = req.get("Authorization");
    if (!authHeader) {
      throw new CustomError(
        "Authorization header is missing. Access is denied.",
        401
      );
    }
    let token = authHeader.split(" ")[1];
    if (!token) {
      throw new CustomError("Bearer token is missing. Access is denied.", 401);
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (error, admin) => {
      try {
        if (error) {
          throw new CustomError(
            "Invalid or expired token. Access is forbidden.",
            403
          );
        }
        const isAdmin = await models.Admin.findOne({
          where: { id: admin.id, firstName: admin.firstName, role: "admin" },
        });
        if (!isAdmin) {
          throw new CustomError("Invalid token. Access is forbidden.", 403);
        }
        req.admin = admin;
        next();
      } catch (err) {
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
};
