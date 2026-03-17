import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+14155238886"

if (!accountSid || !authToken || !fromWhatsAppNumber) {
    // We don't throw here to avoid crashing build; runtime calls should still validate
    // eslint-disable-next-line no-console
    console.warn("Twilio environment variables are not fully configured.");
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendWhatsAppMessage(toPhone: string, body: string): Promise<void> {
    if (!client) {
        throw new Error("Twilio client is not configured");
    }

    const to = toPhone.startsWith("whatsapp:") ? toPhone : `whatsapp:+91${toPhone}`;
    const obj = {
        from: fromWhatsAppNumber as string,
        to,
        body,
    }
    console.log(obj);

    const message = await client.messages.create(obj);
    console.log(message);
}

