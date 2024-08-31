import fs from "fs";
import { myCarts, myProducts } from "../../mocks/index.js";
import { generateRandomId } from "../utils.js";

// Clase para controlar los métodos referentes a los carritos.
class CartFSClass {
  constructor() {
    this.cartsArray = [];
    this.productsArray = [];
    this.cartPath = `../../jsons/cart.json`;
    this.productPath = `../../jsons/product.json`;
    this.getting = false;
  };
  createCart() {
    this.readFileAndSave(this.cartsArray, this.cartPath);
    let myId = generateRandomId();
    while (this.cartsArray.some(cart => cart._id == myId)) {
      myId = generateRandomId();
    }
    let newCart = {
      _id: myId,
      products: [],
    };

    this.cartsArray.push(newCart);
    this.updateFile(this.cartsArray, this.cartPath);
    console.log(`El carrito de ID "${newCart._id}" fue agregado.`);

    return { msg: "Carrito creado en el archivo local.", ID: newCart._id };
  };
  addProduct = async (pid, cid) => {
    if (!pid || !cid) return "[ERROR]: Faltan parámetros."
    
    this.readFileAndSave(this.cartsArray, this.cartPath);
    this.readFileAndSave(this.productsArray, this.productPath);
    
    const fileProduct = this.productsArray.find(product => product._id == pid);

    if (!fileProduct) return `[ERROR]: El producto de ID "${pid}" no se encuentra en los archivos.`;
  
    const newProduct = {
      _id: {...fileProduct},
      quantity: 1
    }

    if (Object.values(newProduct._id).includes(undefined)) return console.log(`El producto que intentabas ingresar no contiene las propiedades adecuadas.`);
    
    let myCart = await this.getCartById(cid);

    if (!myCart) return console.log(`El carrito de ID ${cid} no fue encontrado.`);

    let myProduct = myCart["products"].find((product) => product._id == pid);
    
    if (myProduct) {
      const indexOfProd = myCart["products"].indexOf(myProduct);
      newProduct["quantity"] = myProduct["quantity"] + newProduct.quantity;
      myCart["products"].splice(indexOfProd, 1);
      myCart["products"].push(newProduct);
      this.cartsArray.push(myCart);
      this.updateFile(this.cartsArray, this.cartPath);
      console.log(`Ahora hay ${myProduct["quantity"]} productos de ID ${pid} en el carrito de ID ${cid}.`);
    } else {
      myCart["products"].push(newProduct);
      console.log(`Producto de ID ${pid} agregado.`);
    }
    this.updateFile(this.cartsArray, this.cartPath);
    return myCart;
  };
  getProductsOfACart(cid) {
    this.getting = true;
    this.readFileAndSave(this.cartsArray, this.cartPath);
    let gottenCart = this.getCartById(cid);
    if (gottenCart) {
      return gottenCart["products"];
    } else {
      console.log(`No se encontró el carrito que coincida con la id "${cid}".`);
    }
    this.getting = false;
  };
  deleteProduct = async (pid, cid) => {
    try {
      this.readFileAndSave(this.cartsArray, this.cartPath);
      if (pid && cid) {
        let myCart = await this.getCartById(cid);
        if (myCart) {
          const cartIndex = this.cartsArray.indexOf(myCart);
          let myProduct = myCart["products"].find(
            (product) => product._id == pid
          );
          if (myProduct) {
            const productIndex = myCart["products"].indexOf(myProduct);
            myCart["products"].splice(productIndex, 1);
            this.cartsArray.splice(cartIndex, 1);
            this.cartsArray.push(myCart);
            this.updateFile(this.cartsArray, this.cartPath);
            return `Producto de ID "${pid}" eliminado en el carrito de ID "${cid}".`;
          } else {
            return `Producto de ID "${pid}" no encontrado en el carrito.`;
          }
        } else {
          return `El carrito de ID "${cid}" no fue encontrado.`;
        }
      } else {
        return `El producto o el carrito no contienen las propiedades adecuadas.`;
      }
    } catch (error) {
      return console.error(`[ERROR ${error}]: Lo sentimos, ha ocurrido un error eliminando la información del archivo.`);
    }
  };
  getCartById = async (cid) => {
    try {
      this.readFileAndSave(this.cartsArray, this.cartPath);
      let cartById = await this.cartsArray.find((cart) => cart._id == cid);
      return cartById;
    } catch (error) {
      return console.error(`[ERROR ${error}]: Lo sentimos, ha ocurrido un error enviando la información que intentó capturar.`);
    }
  };
  updateCartById = async (cid, preUpdatedData) => {
    try {
      this.readFileAndSave(this.cartsArray, this.cartPath);
      let myCart = await this.getCartById(cid);
      myCart["products"] = []
      let updatedProducts = [];
      preUpdatedData.forEach(async (product) => {
        let updatedProduct = {
          _id: product._id,
          quantity: product.quantity,
        };
        updatedProducts.push(updatedProduct);
      });
      myCart["products"] = updatedProducts;

      const updatedCart = this.getCartById(cid);

      const cartIndex = this.cartsArray.indexOf(updatedCart);
      this.cartsArray.splice(cartIndex, 1);
      this.cartsArray.push(updatedCart);
      this.updateFile(this.cartsArray, this.cartPath);

      return (updatedCart);
    } catch (error) {
      return console.error(`[ERROR: ${error}]: Lo sentimos, ha ocurrido un error al actualizar el carrito.`);
    }
  };
  updateQuantity = async (pid, cid, objectQuantity) => {
    try {
      this.readFileAndSave(this.cartsArray, this.cartPath);
      if (pid && cid && objectQuantity) {
        let myCart = this.getCartById(cid);
        if (myCart) {
          const cartIndex = this.cartsArray.indexOf(myCart);
          let myProduct = myCart["products"].find(
            (product) => product._id == pid
          );
          if (myProduct) {
            const productIndex = myCart["products"].indexOf(myProduct);
            myProduct["quantity"] = objectQuantity.quantity;
            myCart["products"].splice(productIndex, 1);
            myCart["products"].push(myProduct);
            this.cartsArray.splice(cartIndex, 1);
            this.cartsArray.push(myCart);
            this.updateFile(this.cartsArray, this.cartPath);
            return `Ahora hay ${myProduct["quantity"]} productos de ID ${pid} en el carrito de ID ${cid}.`;
          } else {
            return `Producto de ID "${pid}" no encontrado en el carrito.`;
          }
        } else {
          return `El carrito de ID "${cid}" no fue encontrado.`;
        }
      } else {
        return `El producto que intentabas ingresar no contiene las propiedades adecuadas.`;
      }
      
    } catch (error) {
      return console.error(`[ERROR: ${error}]: Error al actualizar la cantidad de productos en tu carrito.`)
    }
  };
  deleteAllProducts = async (cid) => {
    try {
      this.readFileAndSave(this.cartsArray, this.cartPath);
      let myCart = this.getCartById(cid);
      if (!myCart) return console.error(`[ERROR: ${error}]: Carrito de ID "${cid}" no encontrado.`);
      const cartIndex = this.cartsArray.indexOf(myCart);
      myCart["products"] = [];
      this.cartsArray.splice(cartIndex, 1);
      this.cartsArray.push(myCart);
      this.updateFile(this.cartsArray, this.cartPath)
      return `Carrito de ID ${cid} limpiado.`;
    } catch (error) {
      return console.error(`[ERROR: ${error}]: Error al intentar limpiar el carrito de ID ${cid}`);
    }
  };
  updateFile(array, path) {
    fs.writeFileSync(`${path}`, JSON.stringify(array));
  };
  readFileAndSave(array, path) {
    if (fs.existsSync(path)) {
      let fileContent = fs.readFileSync(path, "utf-8");
      let parsedFileContent = JSON.parse(fileContent);
      array = parsedFileContent;
    } else if (this.getting) {
      console.log("ERROR: El archivo que intentas leer no existe.");
    }
    return array;
  };
  getAllCarts = async () => {
    try {
      this.readFileAndSave(this.cartsArray, this.cartPath);
      const myCarts = this.cartsArray;
      if (!myCarts) return "Ha ocurrido un error trayendo los carritos de la base de datos.";
      return myCarts;
    } catch (error) {
      return console.error(`[ERROR: ${error}]: Error al buscar y traer los carritos de la base de datos.`);
    }
  };
};

// Carritos y productos de ejemplo para agregar y probar el algoritmo.
const [cart1, cart2, cart3, cart4] = myCarts;
const [product1, product2, product3, productCambiado] = myProducts;

// Métodos a utilizar:

// Para productos:
// exampleProductManager.addProduct();
// exampleProductManager.getProducts();
// exampleProductManager.getProductById();
// exampleProductManager.deleteProductById();
// exampleProductManager.updateProduct();
// exampleProductManager.readFileAndSave();

// Para carritos:
// exampleCartManager.createCart();
// exampleCartManager.getProdsOfCartById();
// exampleCartManager.addProduct();
// exampleCartManager.updateFile();
// exampleCartManager.readFileAndSave();

// CartManager de ejemplo para probar el algoritmo.

const CartFSService = new CartFSClass();

export default CartFSService;
