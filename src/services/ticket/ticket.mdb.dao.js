import config from "../../config.js";
import { ticketsModel } from "../../models/tickets.model.js";

class TicketMDBClass {
  constructor(model) {
    this.model = model;
  };
  createTicket = async (ticketData) => {
    try {
      const ticketGen = await ticketsModel.create(ticketData);
      if (!ticketGen) return "[ERROR]: Error al intentar crear el ticket.";
      return JSON.parse(JSON.stringify(ticketGen._id));
    } catch (error) {
      return `[ERROR ${error}]: Ticket no creado. Inténtelo más tarde.`;
    }
  };
  getTicket = async (tid) => {
    try {
      return await this.model.findById(tid);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`};
    };
  };
  getAllTickets = async () => {
    try {
      return await this.model.find();
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`};
    };
  };
};

const TicketMDBService = new TicketMDBClass(ticketsModel);

export default TicketMDBService;
