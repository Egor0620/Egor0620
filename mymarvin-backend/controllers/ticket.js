const Ticket = require("../models/Ticket");

const getVerifyPlan = async (req, res) => {
  try {
    const plans = await Ticket.find({ role: "register" }).sort("price").exec();

    res.status(200).json(plans);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Get all tickets failed",
    });
  }
};

const getAccountPlans = async (req, res) => {
  try {
    const plans = await Ticket.find({ role: "account" }).sort("price").exec();

    res.status(200).json(plans);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Get all tickets failed",
    });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const purchase = await Ticket.find({ type: "purchase" })
      .sort("price")
      .exec();
    const subscription = await Ticket.find({ type: "subscription" })
      .sort("price")
      .exec();

    res.status(200).json({
      purchase,
      subscription,
    });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Get all tickets failed",
    });
  }
};

const createTicket = async (req, res) => {
  try {
    const { type, price, credits } = req.body;
    const ticket = new Ticket({ type, price, credits });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create ticket failed",
    });
  }
};

const createTickets = async (req, res) => {
  try {
    const { purchase, subscription } = req.body;

    Object.keys(req.body).forEach(function (key) {
      console.log(key, req.body[key]);
      req.body[key].forEach(async (el) => {
        const ticket = new Ticket({
          type: key,
          price: el.price,
          credits: el.credits,
        });

        await ticket.save();
      });
    });

    res.status(201).json({
      message: "Created tickets",
    });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create ticket failed",
    });
  }
};

module.exports = {
  createTicket,
  createTickets,
  getAllTickets,
  getVerifyPlan,
  getAccountPlans,
};
