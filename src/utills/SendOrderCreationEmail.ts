import nodemailer from "nodemailer";
import moment from "moment";

interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

interface SendOrderEmailParams {
  user: {
    name?: string;
    email: string;
  };
  address: Address; // ✅ FIXED this line
  order: any;
  items: {
    product: any;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
}

export const sendOrderConfirmationEmail = async ({
  user,
  address,
  order,
  items,
  totalAmount,
}: SendOrderEmailParams) => {
  const orderDate = moment(order.createdAt).format("MMMM Do YYYY, h:mm:ss a");

  const productDetailsHtml = items
    .map((item) => {
      const name = item.product?.name?.en || "Product";
      const unitPrice = item.price.toFixed(2);
      const subtotal = (item.price * item.quantity).toFixed(2);

      return `
        <tr>
          <td>${name}</td>
          <td>${item.quantity}</td>
          <td>$${unitPrice}</td>
          <td>$${subtotal}</td>
        </tr>`;
    })
    .join("");

  const emailHtml = `
    <h2>Thank you for your order, ${user.name || "Customer"}!</h2>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Date:</strong> ${orderDate}</p>
    <p><strong>Shipping Address:</strong></p>
<p>
  ${address.fullName}<br />
  ${address.street}<br />
  ${address.city}, ${address.state} ${address.postalCode}<br />
  ${address.country}<br />
  Phone: ${address.phoneNumber}
</p>

    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${productDetailsHtml}
      </tbody>
    </table>
    <h3>Total Paid: $${totalAmount.toFixed(2)}</h3>
    <p><strong>Payment Status:</strong> Paid</p>
    <p>We’ll notify you when your order is on its way. 🎉</p>
  `;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: `"AutoParts Store" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Your Order Confirmation",
    html: emailHtml,
  });
};
