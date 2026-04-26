import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();



export const authHeader = (token: string) => ({
  headers: {
    AccessToken:  token,
  },
});


export const mapNetworkToCategory = (network: string) => {
  return "Airtime"; // all airtime networks fall here
};

export const generateUniqueReference = (walletName: string) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${walletName}-${timestamp}-${randomString}`;
}


export const generateSignature = (fromAccount: string, toAccount: string)=>{
  const raw = fromAccount + toAccount;
  const signature = crypto.createHash("sha512").update(raw).digest("hex");
  return signature;
}