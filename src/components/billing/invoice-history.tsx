"use client";

import { ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { formatPrice } from "@/lib/billing/config";
import type { Payment } from "@/types/database.types";

interface InvoiceHistoryProps {
  payments: Payment[];
}

export function InvoiceHistory({ payments }: InvoiceHistoryProps) {
  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">No payment history yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-medium text-foreground">Payment History</h3>
      </div>
      <div className="divide-y divide-border">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  payment.status === "paid"
                    ? "bg-green-50 text-green-600"
                    : payment.status === "failed"
                      ? "bg-red-50 text-red-600"
                      : "bg-yellow-50 text-yellow-600"
                }`}
              >
                {payment.status === "paid" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : payment.status === "failed" ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {formatPrice(payment.amount, payment.currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(payment.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  payment.status === "paid"
                    ? "bg-green-50 text-green-700"
                    : payment.status === "failed"
                      ? "bg-red-50 text-red-700"
                      : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {payment.status}
              </span>
              {payment.invoice_url && (
                <a
                  href={payment.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
