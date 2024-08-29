import { cartsModel } from "../../models/index.js";

class CartMDBClass {
  constructor(model) {
    this.carts = [];
    this.products = [];
    this.model = model;
  }

  createCart = async () => {
    try {
      let toSendObject = await this.model.create({ products: [] });
      let toSendID = toSendObject["_id"];
      return { msg: "Carrito creado en la base de datos.", ID: toSendID };
    } catch (error) {
      return `[ERROR: ${error}]: Error al crear el carrito. Por favor, inténtalo de nuevo.`;
    }
  };
  addProduct = async (pid, cid) => {
    try {
      let newProduct = {
        _id: pid,
        quantity: 1,
      };
      if (!Object.values(newProduct).includes(undefined)) {
        let myCart = await this.model.findById(cid);
        if (myCart) {
          let myProduct = myCart["products"].find(
            (product) => product._id == pid
          );
          if (myProduct) {
            myProduct["quantity"] = myProduct["quantity"] + newProduct.quantity;
            await this.model.findOneAndUpdate(
              { _id: cid, "products._id": pid },
              { $set: { "products.$.quantity": myProduct.quantity } }
            );
            console.log(`Ahora hay ${myProduct["quantity"]} productos de ID ${pid} en el carrito de ID ${cid}.`);
            return myProduct;
          } else {
            await this.model.findByIdAndUpdate(
              { _id: cid },
              { $set: { products: [...myCart.products, newProduct] } }
            );
            let updatedCart = await this.model.findById(cid);
            return updatedCart;
          }
        } else {
          return `El carrito de ID ${cid} no fue encontrado.`;
        }
      } else {
        return `El producto que intentabas ingresar no contiene las propiedades adecuadas.`;
      }
    } catch (error) {
      return console.error(`[ERROR ${error}]: Lo sentimos, ha ocurrido un error intentando agregar el producto a su carrito.`);
    }
  };
  getProductsOfACart = async (cid) => {
    try {
      let cart = this.getCartById(cid);
      let products = await cart.products.map(product => {
        let fixedProduct = { ...product._id, quantity: product.quantity };
        return fixedProduct;
      });
      return products;
    } catch (error) {
      return console.error(`[ERROR: ${error}]: Error al traer los productos del carrito.`);
    }
  };
  deleteProduct = async (pid, cid) => {
    try {
      if (pid && cid) {
        let myCart = await this.model.findById(cid);
        if (myCart) {
          let myProduct = myCart["products"].find(
            (product) => product._id == pid
          );
          if (myProduct) {
            await this.model.findByIdAndUpdate(
              { _id: cid },
              { $pull: { products: { _id: pid } } }
            );
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
      return console.error(`[ERROR ${error}]: Lo sentimos, ha ocurrido un error eliminando la información de la base de datos.`);
    }
  };
  getCartById = async (cid) => {
    try {
      let cartById = await this.model.find({ _id: cid }).lean();
      return cartById[0];
    } catch (error) {
      return console.error(`[ERROR ${error}]: Lo sentimos, ha ocurrido un error enviando la información que intentó capturar.`);
    }
  };
  updateCartById = async (cid, preUpdatedData) => {
    try {
      let updatedProducts = [];
      this.model.findOneAndUpdate({ _id: cid }, { $set: { products: [] } });
      preUpdatedData.forEach(async (product) => {
        let updatedProduct = {
          _id: product._id,
          quantity: product.quantity,
        };
        updatedProducts.push(updatedProduct);
      });
      await this.model.findOneAndUpdate(
        { _id: cid },
        { $set: { products: updatedProducts } }
      );
      const updatedCart = await this.model.findById(cid);
      return (updatedCart);
    } catch (error) {
      return console.error(`[ERROR: ${error}]: Lo sentimos, ha ocurrido un error al actualizar el carrito.`);
    }
  };
  updateQuantity = async (pid, cid, objectQuantity) => {
    try {
      if (pid && cid && objectQuantity) {
        let myCart = await this.model.findById(cid);
        if (myCart) {
          let myProduct = myCart["products"].find(
            (product) => product._id == pid
          );
          if (myProduct) {
            myProduct["quantity"] = objectQuantity.quantity;
            await this.model.findOneAndUpdate(
              { _id: cid, "products._id": pid },
              { $set: { "products.$.quantity": myProduct.quantity } }
            );
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
      await this.model.findOneAndUpdate(
        { _id: cid },
        { $set: { products: [] } }
      );
      return `Carrito de ID ${cid} limpiado.`;
    } catch (error) {
      return console.error(`[ERROR: ${error}]: Error al intentar limpiar el carrito de ID ${cid}`);
    }
  };
  getAllCarts = async () => {
    try {
      const myCarts = this.model.find().lean();
      if (!myCarts) return "Ha ocurrido un error trayendo los carritos de la base de datos.";
      return myCarts;
    } catch (error) {
      return console.error(`[ERROR: ${error}]: Error al buscar y traer los carritos de la base de datos.`);
    }
  };
};

const CartMDBService = new CartMDBClass(cartsModel);

export default CartMDBService;
