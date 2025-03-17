
import * as z from "zod";
import { isValidCosmosAddress } from "@/utils/cosmos";

export const transferSchema = z.object({
  recipientAddress: z
    .string()
    .min(1, "Recipient address is required")
    .refine(val => isValidCosmosAddress(val), {
      message: "Must be a valid Cosmos address starting with 'cosmos1'"
    }),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number"
    })
});

export type TransferFormValues = z.infer<typeof transferSchema>;
