import config from "../config.js";
import { generateDateAndHour, generateRandomCode, TicketMDBService, TicketFSService } from "../services/index.js";

class TicketDTO {
  constructor() {
  };
  addAutoGenerate = async (ticketData) => {
    for (let i = 0; i <= Object.values(ticketData).length; i++) {
      if (!ticketData.hasOwnProperty("code")) ticketData.code = generateRandomCode();
      if (!ticketData.hasOwnProperty("purchase_datetime")) ticketData.purchase_datetime = generateDateAndHour();
    };
    return ticketData;
  };
};
const DTO = new TicketDTO();

class TicketManagerClass {

  constructor(service) {
    this.service = service
  };
  createTicket = async (ticketData) => {
    try {
      const normalizedData = TicketDTO.addAutoGenerate(ticketData);
      return await this.service.createTicket(normalizedData);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`};
    }
  };
  getTicket = async (tid) => {
    try {
      return await this.service.getTicket(tid);
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`};
    };
  };
  getAllTickets = async () => {
    try {
      return await this.service.getAllTickets();
    } catch (error) {
      return { origin: config.SERVER, error: `[ERROR ${error}]: No fue posible conectarse al servicio.`};
    };
  };
};

const service = config.DATA_SOURCE == "MDB" 
? TicketMDBService
: TicketFSService;

const TicketManager = new TicketManagerClass(service);

export default TicketManager;
