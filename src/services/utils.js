import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config.js";

export const catchCall = (router, text) => {
  return router.all("*", async (req, res) => {
    res.status(404).send({ origin: config.SERVER, error: `[ERROR: 404]: No se encontró la ruta de ${text} especificada.`});
  });
};
export const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};
export const isValidPassword = (user, password) => { 
  
  return bcrypt.compareSync(password, user.password);
};
export const createToken = (payload, duration) => {
  jwt.sign(payload, config.SECRET, { expiresIn: duration });
};
export const verifyAndReturnToken = (req, res) => {
  let sendToken;
  const headerToken = req.headers.authorization
    ? req.headers.authorization.split(" ")[1]
    : undefined;
  const cookieToken =
    req.cookies && req.cookies[`${config.APP_NAME}_cookie`]
      ? req.cookies[`${config.APP_NAME}_cookie`]
      : undefined;
  const queryToken = 
    req.query.access_token 
      ? req.query.access_token 
      : undefined;
  const myToken = headerToken || cookieToken || queryToken;
  if (!myToken) return null;
  jwt.verify(myToken, config.SECRET, (err, payload) => {
    err ? sendToken = null : sendToken = payload;
  });

  return sendToken;
};
export const verifyMDBID = (ids) => {
  return (req, res, next) => {
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      if (!config.MONGODB_ID_REGEX.test(req.params[id])) return res.status(400).send({ origin: config.SERVER, error: `INVALID ID <${req.params[id]}>`}); 
    }
    next(); 
  }
};
export const verifyRequiredBody = (requiredFields) => {
   
  return (req, res, next) => {

    const allOk = requiredFields.every((field) => {

      return (
        req.body.hasOwnProperty(field) &&
        req.body[field] !== "" &&
        req.body[field] !== null &&
        req.body[field] !== undefined
      );
    });
    if (!allOk)
      return res
        .status(400)
        .send({ origin: config.SERVER, error: "Ingrese los demás campos." });
    next();
  };
};
export const generateRandomId = () => {
  const possibleChars = "abcdefABCDEF0123456789";
  const charArray = [];
  for (let i = 0; i < 24; i++) {
    let randomIndex = Math.floor(Math.random() * possibleChars.length);
    let myChar = possibleChars[randomIndex];
    charArray.push(myChar);
  }
  return charArray.join("");
};
export const handlePolicies = (policies) => {
  return (req, res, next) => {
    if (policies[0] === "PUBLIC") return next();
    // let user = verifyAndReturnToken(req, res);
    let user = req.session.user;
    if (!user) return res.status(401).send({origin: config.SERVER, error: `[ERROR 401]: Usuario no autenticado.`});
    let role = user.role.toUpperCase();
    if (!policies.includes(role)) return res.status(403).send({origin: config.SERVER, error: `[ERROR 403]: Usuario no autorizado.`});
    req.user = user;
    next();
  }
};
export const generateRandomCode = () => {
  const possibleChars = "0123456789";
  const charArray = [];
  for (let i = 0; i < 12; i++) {
    let randomIndex = Math.floor(Math.random() * possibleChars.length);
    let myChar = possibleChars[randomIndex];
    charArray.push(myChar);
  }
  return `C-${charArray.join("")}`;
};
export const generateDateAndHour = () => {
  const now = new Date;
  return now.toLocaleString();
};



