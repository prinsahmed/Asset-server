const { getCollection } = require("../db/dbConfig");
const { ObjectId, CURSOR_FLAGS } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const checkOut = async (req, res) => {
  const { id, email } = req.body;
  if (!id || !email) return res.status(404).send({ message: "Not Found" });
  
  const query = { _id: new ObjectId(id) };
  const packageData = await getCollection("packageCollection").findOne(query);
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "USD",
          unit_amount: packageData.price * 100,
          product_data: {
            name: packageData.name,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      packageName: packageData.name,
      packageLimit: packageData.employeeLimit,
    },
    customer_email: email,
    mode: "payment",
    success_url: `${process.env.SITE_DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_DOMAIN}/payment-cancel`,
  });
  
  
  res.send({ url: session.url });
};

const paymentStatus = async (req, res) => {
  const sessionId = req.query.session_id;
  if (sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paymentData = {
      userName: session.customer_details.name,
      userEmail: session.customer_details.email,
      paymentStatus: session.payment_status,
      packageName: session.metadata.packageName,
      packageLimit: parseInt(session.metadata.packageLimit),
      packageAmount: session.amount_total,
      transactionId: session.payment_intent,
    };

    if (session.payment_status === "paid") {
      const query = {
        email: session.customer_details.email,
        processedSessions: { $ne: sessionId },
      };

      const update = {
        $inc: { packageLimit: parseInt(session.metadata.packageLimit) },
        $set: { subscription: session.metadata.packageName },
        $push: { processedSessions: sessionId },
      };
      const updateLimit = await getCollection("usersCollection").updateOne(
        query,
        update,
      );
    }
    
    res.send(paymentData);
  }
};
module.exports = { checkOut, paymentStatus };
