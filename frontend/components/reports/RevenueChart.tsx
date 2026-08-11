"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  RevenueByDate,
} from "@/types/report";

interface RevenueChartProps {
  data: RevenueByDate[];
}

export default function RevenueChart({
  data,
}: RevenueChartProps) {

  const formattedData =
    data.map((item) => ({
      ...item,

      label: new Date(
        `${item.date}T00:00:00`
      ).toLocaleDateString(
        "en-PH",
        {
          month: "short",
          day: "numeric",
        }
      ),
    }));

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

      {/* HEADER */}

      <div className="mb-6">

        <h2 className="text-lg font-bold text-[#06131f]">
          Revenue Overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Revenue generated during the selected period.
        </p>

      </div>


      {/* CHART */}

      <div className="h-[320px] w-full">

        {formattedData.length === 0 ? (

          <div className="flex h-full items-center justify-center">

            <p className="text-sm text-slate-400">
              No revenue data available.
            </p>

          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={formattedData}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={(value) =>
                  `₱${Number(
                    value
                  ).toLocaleString(
                    "en-PH"
                  )}`
                }
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow:
                    "0 8px 30px rgba(0,0,0,0.08)",
                }}
                labelStyle={{
                  color: "#06131f",
                  fontWeight: 600,
                }}
                formatter={(value) => [
                  `₱${Number(
                    value
                  ).toLocaleString(
                    "en-PH",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}`,
                  "Revenue",
                ]}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#06131f"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#b7ff00",
                  stroke: "#06131f",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "#b7ff00",
                  stroke: "#06131f",
                  strokeWidth: 2,
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        )}

      </div>

    </div>
  );
}