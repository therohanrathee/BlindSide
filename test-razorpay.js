const Razorpay = require("razorpay");
const razorpay = new Razorpay({
  key_id: "rzp_test_THoZOJ7u9apjvw",
  key_secret: "Obwwt0Ewqlisr4JqIn7w50ta",
});
async function test() {
  try {
    const order = await razorpay.orders.create({
      amount: 6900,
      currency: "INR",
      receipt: "780642e1-6e8e-43e8-9cda-08f2109881b3"
    });
    console.log(order);
  } catch (e) {
    console.error(e);
  }
}
test();
