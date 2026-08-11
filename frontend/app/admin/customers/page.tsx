"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Mail,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
  Phone,
} from "lucide-react";

import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
  type Customer,
  type CustomerStatus,
} from "@/lib/api/customer";

// =====================================================
// HELPERS
// =====================================================

function getInitials(
  customer: Customer
) {
  const first =
    customer.first_name
      ?.trim()
      ?.charAt(0) ?? "";

  const last =
    customer.last_name
      ?.trim()
      ?.charAt(0) ?? "";

  return (
    `${first}${last}`.toUpperCase() ||
    "CU"
  );
}

function formatDate(
  value: string
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

// =====================================================
// PAGE
// =====================================================

export default function CustomersPage() {
  // ===================================================
  // CUSTOMERS
  // ===================================================

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [page, setPage] =
    useState(1);

  const [limit] =
    useState(10);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  // ===================================================
  // FILTERS
  // ===================================================

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<
      CustomerStatus | "all"
    >("all");

  // ===================================================
  // LOADING
  // ===================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  // ===================================================
  // ERROR
  // ===================================================

  const [error, setError] =
    useState("");

  // ===================================================
  // MODAL
  // ===================================================

  const [showModal, setShowModal] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  // ===================================================
  // FORM
  // ===================================================

  const [form, setForm] =
    useState({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      status:
        "Active" as CustomerStatus,
      notes: "",
    });

  // ===================================================
  // LOAD CUSTOMERS
  // ===================================================

  const loadCustomers =
    useCallback(
      async (
        requestedPage = page
      ) => {
        try {
          setLoading(true);
          setError("");

          const result =
            await getCustomers({
              page:
                requestedPage,
              limit,
              search,
              status:
                status === "all"
                  ? undefined
                  : status,
            });

          setCustomers(
            result.customers ?? []
          );

          setPage(
            result.pagination.page
          );

          setTotal(
            result.pagination.total
          );

          setTotalPages(
            result.pagination
              .totalPages
          );
        } catch (err: any) {
          console.error(
            "Failed to load customers:",
            err
          );

          setError(
            err?.response?.data
              ?.message ||
              "Failed to load customers."
          );

          setCustomers([]);
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        limit,
        search,
        status,
      ]
    );

  // ===================================================
  // INITIAL / FILTER LOAD
  // ===================================================

  useEffect(() => {
    const timer =
      setTimeout(() => {
        loadCustomers(1);
      }, 300);

    return () =>
      clearTimeout(timer);
  }, [
    search,
    status,
  ]);

  // ===================================================
  // STATS
  // ===================================================

  const activeCount =
    useMemo(
      () =>
        customers.filter(
          (customer) =>
            customer.status ===
            "Active"
        ).length,
      [customers]
    );

  const inactiveCount =
    useMemo(
      () =>
        customers.filter(
          (customer) =>
            customer.status ===
            "Inactive"
        ).length,
      [customers]
    );

  // ===================================================
  // OPEN CREATE
  // ===================================================

  const openCreate =
    () => {
      setEditingCustomer(
        null
      );

      setForm({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        status: "Active",
        notes: "",
      });

      setError("");
      setShowModal(true);
    };

  // ===================================================
  // OPEN EDIT
  // ===================================================

  const openEdit =
    (
      customer: Customer
    ) => {
      setEditingCustomer(
        customer
      );

      setForm({
        first_name:
          customer.first_name ??
          "",
        last_name:
          customer.last_name ??
          "",
        phone:
          customer.phone ??
          "",
        email:
          customer.email ??
          "",
        status:
          customer.status,
        notes:
          customer.notes ??
          "",
      });

      setError("");
      setShowModal(true);
    };

  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const closeModal =
    () => {
      if (saving) {
        return;
      }

      setShowModal(false);
      setEditingCustomer(
        null
      );
    };

  // ===================================================
  // SAVE CUSTOMER
  // ===================================================

  const handleSave =
    async () => {
      setError("");

      const firstName =
        form.first_name.trim();

      const lastName =
        form.last_name.trim();

      const phone =
        form.phone.trim();

      const email =
        form.email.trim();

      const notes =
        form.notes.trim();

      // -----------------------------------------------
      // VALIDATION
      // -----------------------------------------------

      if (!firstName) {
        setError(
          "First name is required."
        );

        return;
      }

      if (!lastName) {
        setError(
          "Last name is required."
        );

        return;
      }

      if (!phone) {
        setError(
          "Phone number is required."
        );

        return;
      }

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        )
      ) {
        setError(
          "Please enter a valid email address."
        );

        return;
      }

      try {
        setSaving(true);

        const data = {
          first_name:
            firstName,

          last_name:
            lastName,

          phone,

          email:
            email || undefined,

          status:
            form.status,

          notes:
            notes || undefined,
        };

        // ---------------------------------------------
        // UPDATE
        // ---------------------------------------------

        if (
          editingCustomer
        ) {
          await updateCustomer(
            editingCustomer.id,
            data
          );
        }

        // ---------------------------------------------
        // CREATE
        // ---------------------------------------------

        else {
          await createCustomer(
            data
          );
        }

        setShowModal(false);

        setEditingCustomer(
          null
        );

        // ---------------------------------------------
        // REFRESH
        // ---------------------------------------------

        await loadCustomers(
          editingCustomer
            ? page
            : 1
        );
      } catch (err: any) {
        console.error(
          "Failed to save customer:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Failed to save customer."
        );
      } finally {
        setSaving(false);
      }
    };

  // ===================================================
  // DELETE CUSTOMER
  // ===================================================

  const handleDelete =
    async (
      customer: Customer
    ) => {
      const name =
        `${customer.first_name} ${customer.last_name}`;

      const confirmed =
        window.confirm(
          `Are you sure you want to delete ${name}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeleting(true);
        setError("");

        await deleteCustomer(
          customer.id
        );

        const nextPage =
          customers.length === 1 &&
          page > 1
            ? page - 1
            : page;

        await loadCustomers(
          nextPage
        );
      } catch (err: any) {
        console.error(
          "Failed to delete customer:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Unable to delete this customer. They may have existing reservations."
        );
      } finally {
        setDeleting(false);
      }
    };

  // ===================================================
  // PAGINATION
  // ===================================================

  const goToPage =
    (
      nextPage: number
    ) => {
      if (
        nextPage < 1 ||
        nextPage >
          totalPages ||
        loading
      ) {
        return;
      }

      loadCustomers(
        nextPage
      );
    };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="min-h-full bg-slate-50/60 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-[1500px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">

              <Users className="h-4 w-4" />

              Management

              <span>/</span>

              Customers

            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Customers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage customers from
              online and walk-in
              reservations.
            </p>

          </div>

        

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <StatCard
            label="Total customers"
            value={
              total
            }
            icon={
              <Users className="h-4 w-4" />
            }
          />

          <StatCard
            label="Active"
            value={
              activeCount
            }
            icon={
              <Check className="h-4 w-4" />
            }
          />

          <StatCard
            label="Inactive"
            value={
              inactiveCount
            }
            icon={
              <User className="h-4 w-4" />
            }
          />

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        )}

        {/* =================================================
            TABLE CARD
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* FILTERS */}

          <div className="border-b border-slate-100 p-4 sm:p-5">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              <div className="relative w-full lg:max-w-lg">

                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={
                    search
                  }
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search name, phone, email or customer no..."
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-10
                    pr-4
                    text-sm
                    text-slate-900
                    outline-none
                    placeholder:text-slate-400
                    focus:border-slate-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-slate-100
                  "
                />

              </div>

              <div className="flex gap-2">

                <FilterButton
                  active={
                    status ===
                    "all"
                  }
                  onClick={() =>
                    setStatus(
                      "all"
                    )
                  }
                >
                  All
                </FilterButton>

                <FilterButton
                  active={
                    status ===
                    "Active"
                  }
                  onClick={() =>
                    setStatus(
                      "Active"
                    )
                  }
                >
                  Active
                </FilterButton>

                <FilterButton
                  active={
                    status ===
                    "Inactive"
                  }
                  onClick={() =>
                    setStatus(
                      "Inactive"
                    )
                  }
                >
                  Inactive
                </FilterButton>

              </div>

            </div>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/70">

                  <th className={th}>
                    Customer
                  </th>

                  <th className={th}>
                    Contact
                  </th>

                  <th className={th}>
                    Customer No.
                  </th>

                  <th className={th}>
                    Status
                  </th>

                  <th className={th}>
                    Created
                  </th>

                  <th className="w-24 px-5 py-3" />

                </tr>

              </thead>

              <tbody>

                {/* LOADING */}

                {loading && (
                  <CustomerSkeleton />
                )}

                {/* EMPTY */}

                {!loading &&
                  customers.length ===
                    0 && (
                    <tr>

                      <td
                        colSpan={6}
                        className="px-6 py-16 text-center"
                      >

                        <div className="mx-auto flex max-w-sm flex-col items-center">

                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                            <Users className="h-5 w-5" />

                          </div>

                          <h3 className="mt-4 text-sm font-semibold text-slate-900">
                            No customers found
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            Try another search
                            or create a
                            customer.
                          </p>

                          <button
                            type="button"
                            onClick={
                              openCreate
                            }
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                          >

                            <Plus className="h-3.5 w-3.5" />

                            Add customer

                          </button>

                        </div>

                      </td>

                    </tr>
                  )}

                {/* DATA */}

                {!loading &&
                  customers.map(
                    (
                      customer
                    ) => (
                      <tr
                        key={
                          customer.id
                        }
                        className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                      >

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">

                              {getInitials(
                                customer
                              )}

                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-slate-900">

                                {
                                  customer.first_name
                                }{" "}

                                {
                                  customer.last_name
                                }

                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">

                                {customer.customer_no ||
                                  `Customer #${customer.id}`}

                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CONTACT */}

                        <td className="px-5 py-4">

                          <div className="space-y-1">

                            {customer.phone && (
                              <div className="flex items-center gap-2 text-xs text-slate-600">

                                <Phone className="h-3.5 w-3.5 text-slate-400" />

                                {
                                  customer.phone
                                }

                              </div>
                            )}

                            {customer.email && (
                              <div className="flex max-w-[250px] items-center gap-2 truncate text-xs text-slate-400">

                                <Mail className="h-3.5 w-3.5 shrink-0" />

                                <span className="truncate">

                                  {
                                    customer.email
                                  }

                                </span>

                              </div>
                            )}

                          </div>

                        </td>

                        {/* CUSTOMER NUMBER */}

                        <td className="px-5 py-4">

                          <span className="font-mono text-xs font-medium text-slate-600">

                            {customer.customer_no ||
                              `CUS-${customer.id}`}

                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <StatusBadge
                            status={
                              customer.status
                            }
                          />

                        </td>

                        {/* CREATED */}

                        <td className="px-5 py-4 text-xs text-slate-500">

                          {
                            formatDate(
                              customer.created_at
                            )
                          }

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-1">

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  customer
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                            >

                              <Edit3 className="h-4 w-4" />

                            </button>

                            <button
                              type="button"
                              disabled={
                                deleting
                              }
                              onClick={() =>
                                handleDelete(
                                  customer
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >

                              <Trash2 className="h-4 w-4" />

                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading &&
            total > 0 && (
              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-xs text-slate-400">

                  Showing{" "}

                  <span className="font-medium text-slate-600">

                    {
                      (page - 1) *
                        limit +
                        1
                    }

                  </span>

                  {" "}to{" "}

                  <span className="font-medium text-slate-600">

                    {Math.min(
                      page *
                        limit,
                      total
                    )}

                  </span>

                  {" "}of{" "}

                  <span className="font-medium text-slate-600">

                    {total}

                  </span>

                  {" "}customers

                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    disabled={
                      page <= 1
                    }
                    onClick={() =>
                      goToPage(
                        page - 1
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                  >

                    <ChevronLeft className="h-4 w-4" />

                  </button>

                  <span className="px-2 text-xs font-medium text-slate-600">

                    {page} /{" "}

                    {Math.max(
                      totalPages,
                      1
                    )}

                  </span>

                  <button
                    type="button"
                    disabled={
                      page >=
                      totalPages
                    }
                    onClick={() =>
                      goToPage(
                        page + 1
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                  >

                    <ChevronRight className="h-4 w-4" />

                  </button>

                </div>

              </div>
            )}

        </div>

      </div>

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

                  <User className="h-5 w-5" />

                </div>

                <h2 className="mt-4 text-lg font-semibold text-slate-950">

                  {editingCustomer
                    ? "Edit customer"
                    : "Add customer"}

                </h2>

                <p className="mt-1 text-xs text-slate-400">

                  {editingCustomer
                    ? "Update customer information."
                    : "Create a customer for online or walk-in reservations."}

                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >

                <X className="h-4 w-4" />

              </button>

            </div>

            {/* FORM */}

            <div className="space-y-4 px-6 py-6">

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">

                  {error}

                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Field label="First name" required>

                  <input
                    value={
                      form.first_name
                    }
                    onChange={(event) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          first_name:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="John"
                    className={
                      inputClass
                    }
                    disabled={
                      saving
                    }
                    autoFocus
                  />

                </Field>

                <Field label="Last name" required>

                  <input
                    value={
                      form.last_name
                    }
                    onChange={(event) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          last_name:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="Doe"
                    className={
                      inputClass
                    }
                    disabled={
                      saving
                    }
                  />

                </Field>

              </div>

              <Field label="Phone" required>

                <input
                  type="tel"
                  value={
                    form.phone
                  }
                  onChange={(event) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        phone:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="09XXXXXXXXX"
                  className={
                    inputClass
                  }
                  disabled={
                    saving
                  }
                />

              </Field>

              <Field
                label="Email"
                optional
              >

                <input
                  type="email"
                  value={
                    form.email
                  }
                  onChange={(event) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        email:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="customer@example.com"
                  className={
                    inputClass
                  }
                  disabled={
                    saving
                  }
                />

              </Field>

              <Field label="Status">

                <select
                  value={
                    form.status
                  }
                  onChange={(event) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        status:
                          event.target
                            .value as CustomerStatus,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                  disabled={
                    saving
                  }
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                </select>

              </Field>

              <Field
                label="Notes"
                optional
              >

                <textarea
                  value={
                    form.notes
                  }
                  onChange={(event) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        notes:
                          event.target
                            .value,
                      })
                    )
                  }
                  rows={3}
                  placeholder="Optional notes..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3.5
                    py-3
                    text-sm
                    text-slate-900
                    outline-none
                    placeholder:text-slate-400
                    focus:border-slate-400
                    focus:ring-4
                    focus:ring-slate-100
                  "
                  disabled={
                    saving
                  }
                />

              </Field>

            </div>

            {/* FOOTER */}

            <div className="flex gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                className="h-10 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  saving
                }
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >

                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />

                    {editingCustomer
                      ? "Save changes"
                      : "Create customer"}
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const th =
  "px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400";

const inputClass = `
  h-11
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-3.5
  text-sm
  text-slate-900
  outline-none
  placeholder:text-slate-400
  focus:border-slate-400
  focus:ring-4
  focus:ring-slate-100
  disabled:bg-slate-50
  disabled:text-slate-400
`;

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-lg
        px-3.5
        py-2
        text-xs
        font-semibold
        transition
        ${
          active
            ? "bg-slate-950 text-white"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        }
      `}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

        {optional && (
          <span className="ml-1 font-normal text-slate-400">
            Optional
          </span>
        )}

      </label>

      {children}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: CustomerStatus;
}) {
  const active =
    status === "Active";

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-[11px]
        font-semibold
        ${
          active
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-500"
        }
      `}
    >

      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${
            active
              ? "bg-emerald-500"
              : "bg-slate-400"
          }
        `}
      />

      {status}

    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>

      <p className="mt-4 text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
        {value.toLocaleString()}
      </p>

    </div>
  );
}

function CustomerSkeleton() {
  return (
    <>
      {Array.from({
        length: 6,
      }).map(
        (_, row) => (
          <tr
            key={row}
            className="border-b border-slate-100"
          >

            {Array.from({
              length: 6,
            }).map(
              (_, column) => (
                <td
                  key={
                    column
                  }
                  className="px-5 py-5"
                >
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                </td>
              )
            )}

          </tr>
        )
      )}
    </>
  );
}