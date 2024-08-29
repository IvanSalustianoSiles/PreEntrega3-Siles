import config from "../config.js";

class ProductManagerClass {

  constructor(service) {
    this.products = [];
    this.service = service
  };
  getAllProducts = async (limit, page, query, sort, available, where) => {
    try {
      return await this.service.getAllProducts(limit, page, query, sort, available, where);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  addProducts = async (newData) => {
    try {
      return await this.service.addProducts(newData);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  getProductById = async (pid) => {
    try {
      return await this.service.getProductById(pid);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  updateProductById = async (pid, latestProduct) => {
    try {
      return await this.service.updateProductById(pid, latestProduct);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
  deleteProductById = async (pid) => {
    try {
      return await this.service.deleteProductById(pid);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`}
    }
  };
};

const service = config.DATA_SOURCE == "MDB" 
? await import("../services/product/product.mdb.dao.js") 
: await import("../services/product/product.fs.dao.js");

const ProductManager = new ProductManagerClass(service);

export default ProductManager;
