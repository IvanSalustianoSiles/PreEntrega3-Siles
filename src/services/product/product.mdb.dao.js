import config from "../../config.js";
import { productsModel } from "../../models/products.model.js";

class ProductMDBClass {
  constructor(model) {
    this.products = [];
    this.model = model;
  }
  getAllProducts = async (limit, page, query, sort, available, where) => {
    let toSendObject = {};
    let prevUrl;
    let nextUrl;
    let paginateArray = [{}, { page: 1, limit: 10, sort: {} }];
    limit ? (paginateArray[1].limit = +limit) : paginateArray;
    page ? (paginateArray[1].page = +page) : paginateArray;
    sort == +sort ? (paginateArray[1].sort = { price: +sort }) : paginateArray;
    query ? (paginateArray[0] = { category: query }) : paginateArray;
    if (available == "true") {
      paginateArray[0] = { ...paginateArray[0], stock: { $gt: 0 } };
    } else if (available == "false") {
      paginateArray[0] = { ...paginateArray[0], stock: { $eq: 0 } };
    }
    this.products = await this.model.paginate(...paginateArray);
    if (query) {
      this.products.hasPrevPage
        ? (prevUrl = `${where}?query=${query}&page=${this.products.prevPage}&limit=${limit}&sort=${sort}&available=${available}`)
        : null;
      this.products.hasNextPage
        ? (nextUrl = `${where}?query=${query}&page=${this.products.nextPage}&limit=${limit}&sort=${sort}&available=${available}`)
        : null;
    } else {
      this.products.hasPrevPage
        ? (prevUrl = `${where}?page=${this.products.prevPage}&limit=${limit}&sort=${sort}&available=${available}`)
        : null;
      this.products.hasNextPage
        ? (nextUrl = `${where}?page=${this.products.nextPage}&limit=${limit}&sort=${sort}&available=${available}`)
        : null;
    }
    return (toSendObject = {
      status: "success",
      payload: this.products,
      prevLink: prevUrl,
      nextLink: nextUrl,
    });
  };
  addProducts = async (...products) => {
    try {
      let newProducts = [];

      for (let i = 0; i <= products.length; i++) {
        let product = products[i];
        let newProduct = {
          title: product.title,
          description: product.description,
          price: product.price,
          code: product.code,
          stock: product.stock,
          category: product.category,
          status: product.status,
          thumbnail: product.thumbnail,
        };
        if (
          Object.keys(newProduct).includes(undefined) ||
          Object.values(newProduct).includes(undefined)
        ) {
          return {
            origin: config.SERVER,
            error: `[ERROR]: Uno de los productos que intentaste agregar es inadmisible.`,
          };
        }
        const MDBProduct = await this.model.find({
          title: newProduct.title,
          description: newProduct.description,
          thumbnail: newProduct.thumbnail,
        });

        if (MDBProduct)
          return {
            origin: config.SERVER,
            error: `[ERROR]: Alguno de los productos que intentabas agregar ya existe.`,
          };

        newProducts.push(newProduct);
      }
      await this.model.insertMany(newProducts);

      return await this.model.find().lean();
    } catch (error) {
      return `[ERROR ${error}]: Error al agregar los productos solicitados.`;
    }
  };
  getProductById = async (pid) => {
    let productById = await this.model.findById(pid);
    try {
      return productById;
    } catch (error) {
      return `[ERROR: ${error}]: Lo sentimos, ha ocurrido un error al intentar encontrar el producto de ID '${pid}'.`;
    }
  };
  updateProductById = async (pid, latestProduct) => {
    try {
      const oldProduct = await this.model.findById(pid).lean();
      if (!oldProduct) return `[ERROR]: Producto para actualizar no encontrado.`;
      for (let i = 0; i <= 7; i++) {
        if (Object.values(latestProduct)[i] == "") {
          let oldValue = Object.values(oldProduct)[i + 1];
          let myProp = Object.keys(latestProduct)[i];
          latestProduct = { ...latestProduct, [myProp]: oldValue };
        }
      }
      const {
        title,
        description,
        price,
        code,
        stock,
        category,
        status,
        thumbnail,
      } = latestProduct;
      await this.model.findByIdAndUpdate(
        { _id: pid },
        {
          $set: {
            title: title,
            description: description,
            price: +price,
            code: +code,
            stock: +stock,
            category: category,
            status: status,
            thumbnail: thumbnail,
          },
        }
      );
      let updatedObject = await this.model.findById(pid);
      return updatedObject;
    } catch (error) {
      return `[ERROR: ${error}]: Error al intentar actualizar el producto.`;
    }
  };
  deleteProductById = async (pid) => {
    try {
      await this.model.findByIdAndDelete(pid);
      return `Producto de ID "${pid}" eliminado.`;
    } catch (error) {
      return `[ERROR ${error}]: Error al intentar eliminar el producto de ID "${pid}".`;
    }
  };
}

const ProductMDBService = new ProductMDBClass(productsModel);

export default ProductMDBService;
