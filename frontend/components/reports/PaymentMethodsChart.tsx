"use client";

import type {
  PaymentMethodReport,
} from "@/types/report";

interface PaymentMethodsProps {
  data: PaymentMethodReport[];
}

export default function PaymentMethods({
  data,
}: PaymentMethodsProps) {

  const total =
    data.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
      "
    >

      <div className="mb-6">

        <h2 className="text-lg font-bold text-[#06131f]">
          Payment Methods
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Revenue distribution by payment method.
        </p>

      </div>


      <div className="space-y-5">

        {data.length === 0 ? (

          <p className="text-sm text-slate-400">
            No payment data available.
          </p>

        ) : (

          data.map((payment) => {

            const percentage =
              total > 0
                ? (payment.amount /
                    total) *
                  100
                : 0;

            return (
              <div
                key={payment.payment_method}
                className="space-y-2"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-semibold text-[#06131f]">
                      {payment.payment_method}
                    </p>

                    <p className="text-xs text-slate-400">
                      {payment.transactions} transactions
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-sm font-bold text-[#06131f]">
                      ₱
                      {payment.amount.toLocaleString(
                        "en-PH",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </p>

                    <p className="text-xs text-slate-400">
                      {percentage.toFixed(1)}%
                    </p>

                  </div>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-[#b7ff00]"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />

                </div>

              </div>
            );

          })

        )}

      </div>

    </div>
  );
}