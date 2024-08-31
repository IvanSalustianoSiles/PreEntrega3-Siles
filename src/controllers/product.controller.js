import config from "../config.js";
import { ProductMDBService, ProductFSService } from "../services/index.js";
class ProductDTO {
  constructor() {
  }
  parseQuerys (querys) {
    let queryObject = {};
    for (let i = 0; i < Object.keys(querys).length; i++) {
      let queryKey = Object.keys(querys)[i];
      let queryValue = Object.values(querys)[i];

      if (querys[queryKey] && queryValue != "undefined") {
        if (queryKey != "available") {
          queryObject[queryKey] = +queryValue;
        } else if (queryValue == "true") {
          queryObject[queryKey] = true;
        } else {
          queryObject[queryKey] = false;
        };
      };
    };
    return queryObject;
  };
  parseStringToNumbers (stringyNumbs) {
    let numbyStrings = {};
    for (let i = 0; i < Object.values(stringyNumbs).length; i++) {
      let myString = Object.values(stringyNumbs)[i];
      let stringKey = Object.keys(stringyNumbs)[i];
      if (myString == +myString) {
        myString = +myString;
      };
      numbyStrings[stringKey] = myString;
    };
    return numbyStrings;
  }
};
const DTO = new ProductDTO();

class ProductManagerClass {

  constructor(service) {
    this.products = [];
    this.service = service
  };
  getAllProducts = async (limit, page, query, sort, available, where) => {
    try {
      const parsed = DTO.parseQuerys({limit, page, sort, available});
      return await this.service.getAllProducts(parsed ? parsed.limit : limit, parsed ? parsed.page : page, query, parsed ? parsed.sort : sort, parsed ? parsed.available : available, where);
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
      
      const normalizedProduct = DTO.parseStringToNumbers(latestProduct);
      
      return await this.service.updateProductById(pid, normalizedProduct);
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
? ProductMDBService
: ProductFSService;

const ProductManager = new ProductManagerClass(service);

export default ProductManager;
