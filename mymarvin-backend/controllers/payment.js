const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");
const Ticket = require("../models/Ticket");
const Transactions = require("../models/Transactions");

console.log("process.env.STRIPE_SECRET_KEY: ", process.env.STRIPE_SECRET_KEY);

const setupProject = async (req, res) => {
  try {
    const { productName, service, register, account } = req.body;

    // create product
    const product = await stripe.products.create({
      name: productName,
    });

    // create prices of product
    Object.keys(service).forEach(function (key) {
      console.log(key, service[key]);
      service[key].forEach(async (el) => {
        const options = {
          unit_amount: el.price * 100,
          currency: "GBP",
          product: product.id,
          nickname: `service_${key}_${el.price}`,
        };

        if (el.recurring) {
          options.recurring = { interval: "month" };
        }
        const price = await stripe.prices.create(options);

        const ticket = new Ticket({
          type: key,
          price: el.price,
          role: key,
          credits: el.credits,
          price_id: price.id,
          product_id: product.id,
        });

        await ticket.save();
      });
    });

    // create register plan 
    register.forEach(async (el) => {
      const options = {
        unit_amount: el.price * 100,
        currency: "GBP",
        product: product.id,
        nickname: `register_${el.recurring ? 'subscription' : 'purchase'}_${el.price}`,
      };

      if (el.recurring) {
        options.recurring = { interval: "month" };
      }
      const price = await stripe.prices.create(options);

      const ticket = new Ticket({
        type: el.recurring ? 'subscription' : 'purchase',
        price: el.price,
        role: 'register',
        credits: el.credits,
        price_id: price.id,
        product_id: product.id,
      });

      await ticket.save();
    });

    // create account plan 
    account.forEach(async (el) => {
      const options = {
        unit_amount: el.price * 100,
        currency: "GBP",
        product: product.id,
        nickname: `account_${el.recurring ? 'subscription' : 'purchase'}_${el.price}`,
      };

      if (el.recurring) {
        options.recurring = { interval: "month" };
      }
      const price = await stripe.prices.create(options);

      const ticket = new Ticket({
        type: el.recurring ? 'subscription' : 'purchase',
        price: el.price,
        role: 'account',
        credits: el.credits,
        price_id: price.id,
        product_id: product.id,
      });

      await ticket.save();
    });

    res.status(201).json({
      message: "Setup project and plans successfully",
    });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create payment intent failed",
    });
  }
};

const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      payment_method_types: ["card"],
      amount,
      currency,
    });

    res.status(201).json(paymentIntent);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create payment intent failed",
    });
  }
};

const createIntent = async (req, res) => {
  try {
    const { use } = req.user;

    const user = await User.findById(use._id).select("-password").exec();

    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
      customer: user.customer_id,
    });

    console.log("setupIntent: ", setupIntent);

    res.status(201).json(setupIntent);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create payment intent failed",
    });
  }
};

const createSessionPayment = async (req, res) => {
  try {
    const { use } = req.user;
    const { price, mode, amount } = req.body;
    console.log(req.body);

    const user = await User.findById(use._id).select("-password").exec();

    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.BUSINESS_FRONTEND_URL}/checkout/status?status=success&price=${price}&mode=${mode}`,
      cancel_url: `${process.env.BUSINESS_FRONTEND_URL}/checkout/status?status=cancel&price=${price}&mode=${mode}`,
      line_items: [{ price: price, quantity: 1 }],
      mode: mode,
      customer: user.customer_id,
      allow_promotion_codes: true,
    });

    console.log("session: ", session);

    const priceStripe = await stripe.prices.retrieve(price);

    const transaction = new Transactions({
      user: user._id,
      status: session.payment_status,
      session,
      amount: priceStripe.unit_amount,
    });

    await transaction.save();

    user.session_id = session.id;
    await user.save();

    res.status(201).json(session);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create session payment failed",
    });
  }
};

const createPaymentLink = async (req, res) => {
  try {
    const { use } = req.user;
    const { priceId } = req.body;

    const user = await User.findById(use._id).select("-password").exec();
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
    });
    console.log("paymentLink: ", paymentLink);

    res.status(201).json(paymentLink);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create session payment failed",
    });
  }
};

const checkPayment = async (req, res) => {
  try {
    const { use } = req.user;
    const { sessionId, priceId } = req.body;

    const user = await User.findById(use._id).select("-password").exec();

    const ticket = await Ticket.findOne({
      price_id: priceId,
    }).exec();

    // check session status
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // update transaction
    const transaction = await Transactions.findOne({
      "session.id": session.id,
      user: user.id,
    }).exec();

    if (transaction) {
      transaction.status = session.payment_status;
      transaction.session = session;
      await transaction.save();
    }

    if (session.payment_status === "paid") {
      user.balance = user.balance + ticket.credits;
      user.plan_id = priceId;
      await user.save();
    }
    res.status(200).json({ transaction, user });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create session payment failed",
    });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const { use } = req.user;
    const { session_id } = req.body;
    const transaction = await Transactions.findOne({
      "session.id": session_id,
      user: use._id,
    })
    console.log(transaction);

    const user = await User.findById(use._id).select("-password").exec();

    const deleted = await stripe.subscriptions.del(
      transaction.session.subscription
    );

    transaction.status = deleted.status;
    await transaction.save();

    user.plan_id = null;
    user.session_id = null;
    await user.save();

    res.status(200).json(deleted);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create session payment failed",
    });
  }
}

module.exports = {
  createPaymentIntent,
  createIntent,
  setupProject,
  createSessionPayment,
  checkPayment,
  createPaymentLink,
  cancelSubscription,
};
