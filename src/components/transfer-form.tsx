
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { transferSchema, type TransferFormValues } from "@/schemas/transfer";
import { DENOM_DISPLAY } from "@/utils/cosmos";
import { toast } from "@/components/ui/use-toast";

interface TransferFormProps {
  onSubmit: (values: TransferFormValues) => Promise<void>;
  balance: string;
  isLoading: boolean;
}

export function TransferForm({ onSubmit, balance, isLoading }: TransferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipientAddress: "",
      amount: "",
    },
  });

  const handleSubmit = async (values: TransferFormValues) => {
    // Check if amount exceeds balance
    if (parseFloat(values.amount) > parseFloat(balance)) {
      toast({
        variant: "destructive",
        title: "Insufficient funds",
        description: `Your transfer amount (${values.amount} ${DENOM_DISPLAY}) exceeds your balance (${balance} ${DENOM_DISPLAY})`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send {DENOM_DISPLAY}</CardTitle>
        <CardDescription>Transfer tokens to another Cosmos address</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="recipientAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address</FormLabel>
                  <FormControl>
                    <Input placeholder="cosmos1..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0.0"
                        {...field}
                      />
                    </FormControl>
                    <span className="text-sm text-muted-foreground">{DENOM_DISPLAY}</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || isLoading || !balance || parseFloat(balance) <= 0}
            >
              {isSubmitting ? "Sending..." : `Send ${DENOM_DISPLAY}`}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
