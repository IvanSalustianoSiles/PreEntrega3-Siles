import { Router } from "express";
import { CartManager, TicketManager, ProductManager } from "../controllers/index.js";
import { verifyMDBID, handlePolicies, generateRandomCode, generateDateAndHour, ProductFSService } from "../services/index.js";
import nodemailer from "nodemailer";
import config from "../config.js";

let toSendObject = {};
const router = Router();

const transport = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
      user: config.GMAIL_APP_USER,
      pass: config.GMAIL_APP_PASSWORD
  }
});

router.get("/", async (req, res) => {
  try {
    const carts = await cartsModel.find().lean();
    res.status(200).send({ origin: config.SERVER, payload: carts });
  } catch (error) {
    res.status(500).send({
      origin: config.SERVER,
      error: `[ERROR: ${error}]: Lo sentimos, ha ocurrido un error al intentar recibir los carritos.`
    });
  }
});
router.post("/", async (req, res) => {
  toSendObject = await CartManager.createCart();
  res.status(200).send(toSendObject);
});
router.get("/:cid", verifyMDBID(["cid"]), async (req, res) => {
  const { cid } = req.params;
  toSendObject = await CartManager.getCartById(cid);
  res.status(200).send(toSendObject);
});
router.post("/:cid/product/:pid", handlePolicies(["USER"]), verifyMDBID(["cid", "pid"]), async (req, res) => {
  const { pid, cid } = req.params;
  toSendObject = await CartManager.addProduct(pid, cid);
  res.status(200).send(toSendObject);
});
router.delete("/:cid/product/:pid", verifyMDBID(["cid", "pid"]), async (req, res) => {
  const { pid, cid } = req.params;
  toSendObject = await CartManager.deleteProduct(pid, cid);
  console.log(toSendObject);
  res.status(200).send(toSendObject);
});
router.put("/:cid", verifyMDBID(["cid"]), async (req, res) => {
  // Formato del body: [{"quantity": Number, "_id:" String},...]
  const { cid } = req.params;
  toSendObject = await CartManager.updateCartById(cid, req.body);
  console.log(toSendObject);
  res.status(200).send(toSendObject);
});
router.put("/:cid/product/:pid", verifyMDBID(["cid", "pid"]), async (req, res) => {
  // Formato del body: {"quantity": Number}
  const { pid, cid } = req.params;
  toSendObject = await CartManager.updateQuantity(pid, cid, req.body);
  res.status(200).send(toSendObject);
});
router.delete("/:cid", verifyMDBID(["cid"]), async (req, res) => {
  const { cid } = req.params;
  toSendObject = await CartManager.deleteAllProducts(cid);
  res.status(200).send(toSendObject);
});
router.get("/:cid/purchase", handlePolicies(["USER"]), verifyMDBID(["cid"]), async (req, res) => {
  const { cid } = req.params;
  let cartProducts = await CartManager.getProductsOfACart(cid);
  let amount = 0;
  let ticketQuantity = 0;
  let msg = [];
  for (let i = 0; i < cartProducts.length; i++) {
    let product = cartProducts[i];
    const pid = product._id;
    if (product.stock == 0) {
      msg = [ ...msg, `El producto '${product.title}' no se pudo comprar. No queda stock.`];
    } else if (product.quantity <= product.stock) {
      ticketQuantity = product.quantity;
      product.stock = product.stock - product.quantity;
      product.quantity = 0;
      await ProductManager.updateProductById(pid, { stock: product.stock });
      await CartManager.deleteProduct(pid, cid);
      msg = [...msg, ""];
    } else if (product.quantity > product.stock) {
      ticketQuantity = product.stock;
      product.quantity = product.quantity - product.stock;
      product.stock = 0;
      await CartManager.updateQuantity(pid, cid, { quantity: product.quantity });
      await ProductManager.updateProductById(pid, { stock: product.stock });
      msg = [...msg, `No pudo realizarse la compra completamente. Ha vaciado el stock del producto '${product.title}'. Quedarán en su carrito los ${product.quantity} productos que sobrepasaron el stock.`];
    };
    amount += ticketQuantity * product.price;
  }
  const ticketGen = await TicketManager.createTicket({code: generateRandomCode(), purchase_datetime: generateDateAndHour(), amount: amount, purchaser: req.user.email });
  if (!ticketGen) return res.send({ origin: config.SERVER, error: "[ERROR]: Ha ocurrido un error intentando crear el ticket."});
  console.log(ticketGen);
  
  const myTicket = await TicketManager.getTicket(ticketGen);

  const email = await transport.sendMail({
    from: `Las Chicas <${config.GMAIL_APP_USER}>`, 
    to: req.user.email,
    subject: `[NO RESPONDER A ESTE CORREO] Hola, ${req.user.first_name}! aquí tienes tu ticket de compra`,
    html: 
    `<div> 
      <h1>Código de compra: ${myTicket.code}</h1>´
      <h2>Comprador: ${myTicket.purchaser}</h2>
      <h3>Total: ${myTicket.amount}</h3>
      <h4>Hora: ${myTicket.purchase_datetime}</h4>
      <h2>¡Gracias por comprar con las chicas!</h2>
    </div>`
  });
  
  return res.send({ origin: config.SERVER, payload: `Ticket exitosamente creado. Revise su bandeja de entrada`, ...msg});
});

export default router;
