export default async ({ req, res, log }) => {

  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // =========================
  // WEBHOOK VERIFICATION (GET)
  // =========================
  if (req.method === "GET") {

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      log("Webhook verified");
      return res.text(challenge);
    }

    return res.text("Forbidden", 403);
  }

  // =========================
  // RECEIVE MESSAGE (POST)
  // =========================
  if (req.method === "POST") {

    const body = req.body;

    log(JSON.stringify(body, null, 2));

    const message =
      body?.entry?.[0]
        ?.changes?.[0]
        ?.value?.messages?.[0];

    if (message) {

      const from = message.from;
      const text = message.text?.body;

      log(`Message from ${from}: ${text}`);

      // =========================
      // AUTO REPLY
      // =========================
      await fetch(
        `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: {
              body: "Halo 👋, pesan Anda sudah kami terima."
            }
          })
        }
      );
    }

    return res.json({ success: true });
  }

  return res.text("OK");
};
