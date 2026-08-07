"use client";

import { User, Mail, Phone, MessageSquare } from "lucide-react";

interface GuestFormProps {
  value: {
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    remarks: string;
  };

  onChange: (
    value: {
      guest_name: string;
      guest_email: string;
      guest_phone: string;
      remarks: string;
    }
  ) => void;
}

export default function GuestForm({
  value,
  onChange,
}: GuestFormProps) {
  const handleChange = (
    field: keyof typeof value,
    input: string
  ) => {
    onChange({
      ...value,
      [field]: input,
    });
  };

  return (
    <div className="space-y-8">

      <div>
        <h2 className="text-3xl font-bold">
          Guest Information
        </h2>

        <p className="mt-2 text-slate-400">
          No account is required to reserve a court.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* Full Name */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Full Name
          </label>

          <div className="relative">
            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              value={value.guest_name}
              onChange={(e) =>
                handleChange("guest_name", e.target.value)
              }
              placeholder="Juan Dela Cruz"
              className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-12 pr-4 outline-none transition focus:border-lime-400"
            />
          </div>
        </div>

        {/* Email */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Email Address
          </label>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              type="email"
              value={value.guest_email}
              onChange={(e) =>
                handleChange("guest_email", e.target.value)
              }
              placeholder="juan@email.com"
              className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-12 pr-4 outline-none transition focus:border-lime-400"
            />
          </div>
        </div>

        {/* Phone */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Mobile Number
          </label>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              value={value.guest_phone}
              onChange={(e) =>
                handleChange("guest_phone", e.target.value)
              }
              placeholder="09123456789"
              className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-12 pr-4 outline-none transition focus:border-lime-400"
            />
          </div>
        </div>

      </div>

      {/* Remarks */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Remarks (Optional)
        </label>

        <div className="relative">
          <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-slate-500" />

          <textarea
            rows={4}
            value={value.remarks}
            onChange={(e) =>
              handleChange("remarks", e.target.value)
            }
            placeholder="Additional requests..."
            className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-12 pr-4 outline-none transition focus:border-lime-400"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 p-5">
        <p className="text-sm text-lime-300">
          You can reserve as a guest. Create a free player account later to join tournaments,
          track your match history, and earn rankings.
        </p>
      </div>

    </div>
  );
}