import fs from "fs";
import { myProducts } from "../../mocks/index.js";
import { generateRandomId } from "../utils.js";

// Clase para controlar los métodos referentes a los productos.
class ProductFSClass {
  constructor() {
    this.productsArray = [];
    this.path = `./../jsons/product.json`;
    this.getting = false;
  };
  getAllProducts = async (limit = "10", page = "1", query, sort, available, where) => {
    this.getting = true;
    this.readFileAndSave();
    this.productsArray;
    let matrixProducts = []
    let j = 0;
    matrixProducts.push([]);

    query ? this.productsArray = this.productsArray.filter(product => product.category == query) : this.productsArray;
    
    available == "true" ? this.productsArray = this.productsArray.filter(product => product.stock > 0) 
    : available == "false" ? this.productsArray = this.productsArray.filter(product => product.stock == 0)
    : this.productsArray; 
    
    sort == "1" ? this.productsArray.sort((a, b) => a.price - b.price)
    : sort == "-1" ? this.productsArray.sort((a, b) => b.price - a.price)
    : this.productsArray;

    for (let i = 0; i <= this.productsArray.length; i++) {
        if (i == 0 || !(i % limit == 0)) {
            matrixProducts[j].push(this.productsArray[i])
        } else {
            matrixProducts.push([]);
            j++;
            matrixProducts[j].push(this.productsArray[i]);
        }
    };

    const pageProducts = matrixProducts[+page - 1];
    let prevPage = (+page == 1) ? undefined : +page - 1;
    let nextPage = !matrixProducts[+page] ? undefined : +page + 1;
    let prevUrl;
    let nextUrl;

    if (query) {
        prevPage
          ? (prevUrl = `${where}?query=${query}&page=${prevPage}&limit=${limit}&sort=${sort}&available=${available}`)
          : null;
        nextPage
          ? (nextUrl = `${where}?query=${query}&page=${nextPage}&limit=${limit}&sort=${sort}&available=${available}`)
          : null;
    } else {
        prevPage
          ? (prevUrl = `${where}?page=${prevPage}&limit=${limit}&sort=${sort}&available=${available}`)
          : null;
        nextPage
          ? (nextUrl = `${where}?page=${nextPage}&limit=${limit}&sort=${sort}&available=${available}`)
          : null;
    };
    this.getting = false;
    return {
        status: "success",
        payload: pageProducts,
        prevLink: prevUrl,
        nextLink: nextUrl,
    };
  };
  addProducts = async (...products) => {
    try {
      this.readFileAndSave();
      let newProducts = [];

      for (let i = 0; i <= products.length; i++) {
        let product = products[i];
        let myId = generateRandomId();
        while (this.productsArray.some(product => product._id == myId)) {
          myId = generateRandomId();
        }
        let newProduct = {
          title: product.title,
          description: product.description,
          price: product.price,
          code: product.code,
          stock: product.stock,
          category: product.category,
          status: product.status,
          thumbnail: product.thumbnail,
          _id: myId
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
        const FSProduct = await this.productsArray.find(
          (product) => product == newProduct
        );

        if (FSProduct)
          return {
            origin: config.SERVER,
            error: `[ERROR]: Alguno de los productos que intentabas agregar ya existe.`,
          };

        newProducts.push(newProduct);
      };
      this.productsArray.push(...newProducts);
      this.updateFile(this.productsArray);
      return this.productsArray;
    } catch (error) {
      return `[ERROR ${error}]: Error al agregar los productos solicitados.`;
    };
  };
  getProductById = async (id) => {
    this.getting = true;
    this.readFileAndSave();
    let gottenProduct = await this.productsArray.find((product) => product._id == id);
    if (gottenProduct) {
    this.getting = false;
      return gottenProduct;
    } else {
      return `[ERROR: ${error}]: Lo sentimos, ha ocurrido un error al intentar encontrar el producto de ID '${pid}'.`;
    }
  };
  updateProductById = async (pid, latestProduct = {}) => {
    try {
      this.readFileAndSave();
      const oldProduct = this.productsArray.find(product => product._id == pid);
      if (!oldProduct) return `[ERROR]: Producto para actualizar no encontrado.`;
      for (let i = 0; i <= 7; i++) {
        if (Object.values(latestProduct)[i] == "") {
          let oldValue = Object.values(oldProduct)[i + 1];
          let myProp = Object.keys(latestProduct)[i];
          latestProduct = { ...latestProduct, [myProp]: oldValue, _id: generateRandomId() };
        }
      }
      let oldIndex = this.productsArray.indexOf(oldProduct);
      this.productsArray.splice(oldIndex, 1, latestProduct);
      this.updateFile(this.productsArray);
      let updatedProduct = this.productsArray.find(product => product._id == latestProduct._id)
      return updatedProduct;
    } catch (error) {
      return `[ERROR: ${error}]: Error al intentar actualizar el producto.`;
    }
  };
  deleteProductById = async (pid) => {
    try {
        this.readFileAndSave();
        let toDeleteProduct = await this.productsArray.find(product => product._id == pid);
        if (!toDeleteProduct) return `[ERROR]: No se encontró el producto que coincida con la ID "${pid}".`;
        const forDeleteIndex = this.productsArray.indexOf(toDeleteProduct);
        this.productsArray.splice(forDeleteIndex, 1);
        this.updateFile(this.productsArray);
        return `Producto de ID '${pid}' eliminado.`;
    } catch (error) {
        return `[ERROR ${error}]: Producto de ID '${pid}' eliminado.`;
    }
  };
  updateFile = async (array) => {
    fs.writeFileSync(`${this.path}`, JSON.stringify(array));
  };
  readFileAndSave = async () => {
    if (fs.existsSync(this.path)) {
      let fileContent = fs.readFileSync(this.path, "utf-8");
      let parsedFileContent = JSON.parse(fileContent);
      this.productsArray = parsedFileContent;
    } else if (this.getting) {
      console.log("ERROR: El archivo que intentas leer no existe.");
    }
    return this.productsArray;
  };
};

// Productos de ejemplo para agregar y probar el algoritmo.
const [product1, product2, product3, productCambiado] = myProducts;

// Métodos a utilizar:

// Para productos:
// exampleProductManager.addProduct();
// exampleProductManager.getProducts();
// exampleProductManager.getProductById();
// exampleProductManager.deleteProductById();
// exampleProductManager.updateProduct();
// exampleProductManager.readFileAndSave();

const ProductFSService = new ProductFSClass();

export default ProductFSService;
