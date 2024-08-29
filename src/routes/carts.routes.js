import { Router } from "express";
import { CartManager } from "../controllers/index.js";
import { verifyMDBID } from "../services/index.js";
import config from "../config.js";

let toSendObject = {};
const router = Router();

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
router.post("/:cid/product/:pid", verifyMDBID(["cid", "pid"]), async (req, res) => {
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

export default router;
