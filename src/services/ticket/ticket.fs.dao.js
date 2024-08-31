import config from "../../config.js";
import fs from "fs";
import { generateRandomId } from "../utils.js";

class TicketFSClass {
  constructor() {
    this.ticketsArray = [];
    this.path = `../../jsons/ticket.json`;
    this.getting = false;
  };
  createTicket = async (ticketData) => {
    try {
      await this.readFileAndSave();
      
      let ticketGen = {
      code: ticketData.code,
      purchase_datetime: ticketData.purchase_datetime,
      amount: ticketData.amount,
      purchaser: ticketData.purchaser
      };
      for (let i = 0; i < Object.values(ticketGen).length; i++) {
        if (Object.values(ticketGen)[i] !== 0 && (Object.values(ticketGen)[i] == "" || Object.values(ticketGen)[i] == undefined)) {
          return "[ERROR]: Error al intentar crear el ticket, faltan datos.";
        };
      };
      ticketGen._id = generateRandomId();
      
      this.ticketsArray.push(ticketGen);
      console.log(this.ticketsArray);
      
      await this.updateFile(this.ticketsArray);
    } catch (error) {
      return `[ERROR ${error}]: Ticket no creado. Inténtelo más tarde.`;
    };
  };
  getTicket = async (tid) => {
    try {
      let tickets = await this.getAllTickets();
      let myTicket = tickets.find(ticket => ticket._id == tid);
      if (myTicket) return myTicket;
      return `[ERROR]: Ticket no encontrado`;
    } catch (error) {
      return `[ERROR ${error}]: No fue posible conectarse al servicio.`;
    };
  };
  getAllTickets = async () => {
    try {
      return await this.readFileAndSave();
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`};
    };
  };
  updateFile = async (array) => {
    fs.writeFileSync(`${this.path}`, JSON.stringify(array));
  };
  readFileAndSave = async () => {
    if (fs.existsSync(this.path)) {
      let fileContent = fs.readFileSync(this.path, "utf-8") || null;
      let parsedFileContent = JSON.parse(fileContent) || null;
      this.ticketsArray = parsedFileContent || [];
    } else {
      this.updateFile(this.ticketsArray);
    }
    return this.ticketsArray;
  };
};

const TicketFSService = new TicketFSClass();

export default TicketFSService;
