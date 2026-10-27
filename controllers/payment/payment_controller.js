const SSLCommerzPayment = require("sslcommerz-lts");

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWD;
const is_live = process.env.IS_LIVE === "true";

const CLINT_URL = process.env.CLIENT_URL || "http://localhost:5173"; // Replace with your client URL
const BACKEND_URL = `http://localhost:${process.env.PORT || 8000}`;
const API_BASE_URL = process.env.BASE_URL || "/api/v1"; // Replace with your API base URL

// -----------profile controllerp
const payment = async (req, res) => {
  const data = {
    total_amount: 100,
    currency: "BDT",
    tran_id: `REF_${Date.now()}`,
    success_url: `${BACKEND_URL}${API_BASE_URL}/payment/payment-success`,
    fail_url: `${BACKEND_URL}${API_BASE_URL}/payment/payment-fail`,
    cancel_url: `${BACKEND_URL}${API_BASE_URL}/payment/payment-cancel`,
    // ipn_url: `${BACKEND_URL}${API_BASE_URL}/payment/payment-ipn`,
    shipping_method: "Courier",
    product_name: "Computer.",
    product_category: "Electronic",
    product_profile: "general",
    cus_name: "Customer Name",
    cus_email: "customer@example.com",
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",
    ship_name: "Customer Name",
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: 1000,
    ship_country: "Bangladesh",
  };
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  sslcz
    .init(data)
    .then((apiResponse) => {
      console.log("SSLCommerz Response:", apiResponse);

      if (!apiResponse.GatewayPageURL) {
        return res.status(502).json({ success: false, message: "Payment gateway did not return a redirect URL" });
      }

      res.status(200).json({
        success: true,
        message: "Payment initialized successfully",
        data: { GatewayPageURL: apiResponse.GatewayPageURL },
      });
    })
    .catch((error) => {
      console.error("Error initializing payment:", error);
      res.status(500).json({ error: "Failed to initialize payment" });
    });
};

// ------redirect clint
const redirectClient = (path) => (req, res) => {
  res.redirect(303, `${CLINT_URL}${path}`);
};

// ---------payment success
const   paymentSuccess = redirectClient("/paymentSuccess");
const paymentFail = redirectClient("/payment/payment-fail");
const paymentCancel = redirectClient("/payment/payment-cancel");

module.exports = {
  payment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
};
