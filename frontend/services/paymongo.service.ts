import axios from "axios";

const PAYMONGO_API_URL = "https://api.paymongo.com/v1";

class PayMongoService {
  private secretKey: string;

  constructor() {
    if (!process.env.PAYMONGO_SECRET_KEY) {
      throw new Error(
        "PAYMONGO_SECRET_KEY is not configured."
      );
    }

    this.secretKey =
      process.env.PAYMONGO_SECRET_KEY;
  }

  private getHeaders() {
    return {
      Authorization:
        `Basic ${Buffer.from(
          `${this.secretKey}:`
        ).toString("base64")}`,

      "Content-Type":
        "application/json",
    };
  }

  /**
   * Create PayMongo Payment Intent
   */
  async createPaymentIntent(
    amount: number,
    description: string
  ) {
    const response =
      await axios.post(
        `${PAYMONGO_API_URL}/payment_intents`,
        {
          data: {
            attributes: {
              amount: Math.round(
                amount * 100
              ),

              currency: "PHP",

              payment_method_allowed: [
                "gcash",
              ],

              description,
            },
          },
        },
        {
          headers:
            this.getHeaders(),
        }
      );

    return response.data.data;
  }

  /**
   * Create GCash Payment Method
   */
  async createGCashPaymentMethod() {
    const response =
      await axios.post(
        `${PAYMONGO_API_URL}/payment_methods`,
        {
          data: {
            attributes: {
              type: "gcash",
            },
          },
        },
        {
          headers:
            this.getHeaders(),
        }
      );

    return response.data.data;
  }

  /**
   * Attach GCash payment method
   * to Payment Intent
   */
  async attachPaymentMethod(
    paymentIntentId: string,
    paymentMethodId: string,
    returnUrl: string
  ) {
    const response =
      await axios.post(
        `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`,
        {
          data: {
            attributes: {
              payment_method:
                paymentMethodId,

              return_url:
                returnUrl,
            },
          },
        },
        {
          headers:
            this.getHeaders(),
        }
      );

    return response.data.data;
  }

  /**
   * Retrieve Payment Intent
   */
  async getPaymentIntent(
    paymentIntentId: string
  ) {
    const response =
      await axios.get(
        `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}`,
        {
          headers:
            this.getHeaders(),
        }
      );

    return response.data.data;
  }
}

export default new PayMongoService();