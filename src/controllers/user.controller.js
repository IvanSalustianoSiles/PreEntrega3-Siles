import { config } from "dotenv";

// Clase para controlar los métodos referentes a los usuarios.
class UserManagerClass {
  constructor(service) {
    this.service = service;
    console.log(`[501 WARNING]: File System para usuarios aún no implementado, sólo disponible para carts y products.`);
  }
  isRegistered = async (focusRoute, returnObject, req, res) => {
    try {
      return await this.service.isRegistered(focusRoute, returnObject, req, res);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  isRegisteredwToken = async (focusRoute, returnObject, req, res) => {
    try {
      return await this.service.isRegisteredwToken(focusRoute, returnObject, req, res);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  }
  findUser = async (emailValue) => {
    try {
      return await this.service.findUser(emailValue);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  addUser = async (user) => {
    try {
      return await this.service.addUser(user);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  updateUser = async (filter, update, options) => {
    try {
      return await this.service.updateUser(filter, update, options);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  deleteUser = async (filter) => {
    try {
      return await this.service.deleteUser(filter);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  paginateUsers = async (...filters) => {
    try {
      return await this.service.paginateUsers(...filters);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  }
};

// Métodos a utilizar:
// isRegistered (focusRoute, returnObject, req, res)
// findUser (emailValue)
// addUser (user)
// updateUser (filter, update, options)
// deleteUser (filter)
// paginateUsers (...filters)


const service = await import("../services/user/user.mdb.dao.js");

const UserManager = new UserManagerClass(service);

export default UserManager;

