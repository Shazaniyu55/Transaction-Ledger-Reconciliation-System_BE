import { z } from "zod";

export const registerUserSchema = z.object({
  username: z.string({ message: "First name is required" }),
  phoneNumber: z.string({ message: "Phone number is required" }),
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Invalid email" }),
  password: z
    .string({ message: "Password must be at least 6 characters long" })
    .min(6),
});

export const loginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Invalid email" }),
  password: z
    .string({ message: "Password must be at least 6 characters long" })
    .min(6),
});

export  const transferSchema = z.object({
  fromAccount: z.string().min(5),
  uniqueSenderAccountId: z.string(),
  fromClientId: z.string(),
  fromClient: z.string(),
  fromSavingsId: z.string(),
  fromBvn: z.string().length(11),

  toClientId: z.string().optional(),
  toClient: z.string().optional(),
  toSavingsId: z.string().optional(),

  toSession: z.string(),
  toBvn: z.string().length(11),

  toAccount: z.string().min(10).max(10),
  toBank: z.string(),
  

  amount: z.number().positive(),
  remark: z.string().min(3).max(255),
  transferType: z.enum(["intra", "inter"]),

  reference: z.string().min(5)
});


export  const loanSchema = z.object({
  accountNo: z.string(),
  duration: z.string(),
  durationType: z.string(),
  amount: z.number().positive(),

});

export const cardPaymentSchema = z.object({
  amount: z
    .number({
      required_error: "Amount is required"
    })
    .min(1000, "Minimum amount is ₦1000"),

  reference: z
    .string()
    .min(5, "Reference must be at least 5 characters")
    .regex(/^rosapay-/, "Reference must start with 'rosapay-'"),

  useExistingCard: z
    .boolean()
    .refine(val => val === false, {
      message: "useExistingCard must always be false"
    }),

  cardNumber: z
    .string(),
  cardPin: z
    .string()
    .regex(/^\d{4}$/, "Card PIN must be 4 digits"),

  cvv2: z
    .string()
    .regex(/^\d{3}$/, "CVV must be 3 digits"),

  expiryDate: z
    .string()
    .regex(/^\d{4}$/, "Expiry must be in yymm format (e.g 2503)")
    .refine((val) => {
      const year = parseInt(val.slice(0, 2), 10);
      const month = parseInt(val.slice(2, 4), 10);
      return month >= 1 && month <= 12;
    }, {
      message: "Invalid expiry month"
    }),

  shouldTokenize: z.boolean()
});