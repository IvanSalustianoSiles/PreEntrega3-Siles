import config from "../config.js";

class CartManagerClass {
  
  constructor(service) {
    this.carts = [];
    this.service = service;
  };
  createCart = async () => {
    try {
      return await this.service.createCart();
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  addProduct = async (pid, cid) => {
    try {
      return await this.service.addProduct(pid, cid);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  deleteProduct = async (pid, cid) => {
    try {
      return await this.service.deleteProduct(pid, cid);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  getCartById = async (cid) => {
    try {
      return await this.service.getCartById(cid);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  updateCartById = async (cid, preUpdatedData) => {
    try {
      return await this.service.updateCartById(cid, preUpdatedData);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  updateQuantity = async (pid, cid, objectQuantity) => {
    try {
      return await this.service.updateQuantity(pid, cid, objectQuantity);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  deleteAllProducts = async (cid) => {
    try {
      return await this.service.deleteAllProducts(cid);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  getProductsOfACart = async (cid) => {
    try {
      return await this.service.getProductsOfACart(cid);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  getAllCarts = async () => {
    try {
      return await this.service.getAllCarts();
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  }
};

const service = config.DATA_SOURCE == "MDB" 
? await import("../services/cart/cart.mdb.dao.js") 
: await import("../services/cart/cart.fs.dao.js");

const CartManager = new CartManagerClass(service);

export default CartManager;
