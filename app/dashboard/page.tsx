import Link from "next/link";
import { getAuthenticatedBusiness } from "@/lib/business";
import { AppNav } from "@/components/app-nav";
import { formatCurrency, formatDateTime } from "@/lib/format";

interface ActivityItem {
  id: string;
  type: "counter" | "credit" | "debit" | "estimate";
  title: string;
  subtitle: string;
  amount: number;
  occurredAt: string;
  href: string;
}

export default async function DashboardPage() {
  const { supabase, business } = await getAuthenticatedBusiness();

  // 1. Latest Cash Count
  const { data: latestCashReports } = await supabase
    .from("counter_reports")
    .select("id, total_amount, counted_at")
    .eq("business_id", business.id)
    .order("counted_at", { ascending: false })
    .limit(5);

  const latestCash = latestCashReports?.[0];

  // 2. Credit Outstanding
  const { data: creditTransactions } = await supabase
    .from("credit_transactions")
    .select("id, customer_id, transaction_type, amount, notes, occurred_at, customers(name)")
    .eq("business_id", business.id)
    .order("occurred_at", { ascending: false });

  let totalCreditOutstanding = 0;
  const customerBalances: Record<string, number> = {};

  if (creditTransactions) {
    for (const tx of creditTransactions) {
      const amt = Number(tx.amount);
      if (!customerBalances[tx.customer_id]) customerBalances[tx.customer_id] = 0;
      if (tx.transaction_type === "credit") {
        customerBalances[tx.customer_id] += amt;
      } else {
        customerBalances[tx.customer_id] -= amt;
      }
    }
    for (const bal of Object.values(customerBalances)) {
      if (bal > 0) totalCreditOutstanding += bal;
    }
  }

  // 3. Debit (Expenses)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const { data: debits } = await supabase
    .from("debit_transactions")
    .select("id, category_name, amount, description, occurred_at")
    .eq("business_id", business.id)
    .order("occurred_at", { ascending: false });

  let todayExpenses = 0;
  let totalExpenses = 0;
  if (debits) {
    for (const d of debits) {
      const amt = Number(d.amount);
      totalExpenses += amt;
      if (new Date(d.occurred_at) >= startOfToday) {
        todayExpenses += amt;
      }
    }
  }

  // 4. Estimates
  const { data: estimates } = await supabase
    .from("estimates")
    .select("id, estimate_number, customer_name, total_amount, issued_at")
    .eq("business_id", business.id)
    .order("issued_at", { ascending: false });

  const totalEstimatesCount = estimates?.length || 0;
  const totalEstimatesValue = (estimates || []).reduce(
    (sum, e) => sum + Number(e.total_amount),
    0
  );

  // 5. Recent Activity Feed (compile from last items)
  const recentActivities: ActivityItem[] = [];

  if (latestCashReports) {
    for (const r of latestCashReports.slice(0, 3)) {
      recentActivities.push({
        id: `cash-${r.id}`,
        type: "counter",
        title: "Cash Count Saved",
        subtitle: "Register counted",
        amount: Number(r.total_amount),
        occurredAt: r.counted_at,
        href: "/counter/history",
      });
    }
  }

  if (creditTransactions) {
    for (const c of creditTransactions.slice(0, 4)) {
      const cust = c.customers as unknown as { name: string } | null;
      const isCredit = c.transaction_type === "credit";
      recentActivities.push({
        id: `credit-${c.id}`,
        type: "credit",
        title: isCredit ? "Udhaar Given" : "Payment Received",
        subtitle: `${cust?.name || "Customer"}${c.notes ? ` • ${c.notes}` : ""}`,
        amount: isCredit ? Number(c.amount) : -Number(c.amount),
        occurredAt: c.occurred_at,
        href: `/credit/${c.customer_id}`,
      });
    }
  }

  if (debits) {
    for (const d of debits.slice(0, 4)) {
      recentActivities.push({
        id: `debit-${d.id}`,
        type: "debit",
        title: d.description || d.category_name,
        subtitle: `Category: ${d.category_name}`,
        amount: -Number(d.amount),
        occurredAt: d.occurred_at,
        href: "/debit",
      });
    }
  }

  if (estimates) {
    for (const e of estimates.slice(0, 3)) {
      recentActivities.push({
        id: `est-${e.id}`,
        type: "estimate",
        title: `Estimate ${e.estimate_number}`,
        subtitle: `For ${e.customer_name}`,
        amount: Number(e.total_amount),
        occurredAt: e.issued_at,
        href: `/estimates/${e.id}`,
      });
    }
  }

  recentActivities.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  const displayedActivities = recentActivities.slice(0, 8);

  const quickActions = [
    {
      title: "Count Cash",
      description: "Count notes & register drawer",
      href: "/counter",
      icon: "💵",
      badge: "Fast Count",
    },
    {
      title: "Add Credit",
      description: "Customer udhaar & payments",
      href: "/credit",
      icon: "📒",
      badge: "Khaata",
    },
    {
      title: "Add Expense",
      description: "Record business outgoing debits",
      href: "/debit",
      icon: "📉",
      badge: "Expenses",
    },
    {
      title: "New Estimate",
      description: "Create printable quotation",
      href: "/estimates/new",
      icon: "🧾",
      badge: "Invoice",
    },
    {
      title: "Products Catalog",
      description: "Manage items & selling prices",
      href: "/products",
      icon: "📦",
      badge: "Items",
    },
    {
      title: "Calculator",
      description: "Quick arithmetic & GST lookup",
      href: "/calculator",
      icon: "🔢",
      badge: "GST Calc",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <AppNav businessName={business.name} />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Overview • {business.business_type.replace("_", " ")}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {business.name}
            </h1>
          </div>
          <Link
            href="/counter"
            className="ui-button rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700"
          >
            💵 Start Daily Cash Count
          </Link>
        </div>

        {/* Real Live Metrics Cards */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Business Snapshot
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Cash Counter */}
            <Link
              href="/counter"
              className="interactive-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-brand-400"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Latest Cash Count
                </span>
                <span className="text-lg">💵</span>
              </div>
              <p className="mt-3 text-2xl font-extrabold text-slate-900">
                {latestCash ? formatCurrency(latestCash.total_amount) : "Not counted"}
              </p>
              <p className="mt-1 text-xs text-slate-500 truncate">
                {latestCash
                  ? `Counted ${formatDateTime(latestCash.counted_at)}`
                  : "Tap to record register count"}
              </p>
            </Link>

            {/* 2. Outstanding Credit */}
            <Link
              href="/credit"
              className="interactive-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-red-400"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Customer Udhaar
                </span>
                <span className="text-lg">📒</span>
              </div>
              <p className="mt-3 text-2xl font-extrabold text-red-600">
                {formatCurrency(totalCreditOutstanding)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {totalCreditOutstanding > 0
                  ? "Total money owed by customers"
                  : "All customer balances clear"}
              </p>
            </Link>

            {/* 3. Debit / Expenses */}
            <Link
              href="/debit"
              className="interactive-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-400"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Today’s Outgoing
                </span>
                <span className="text-lg">📉</span>
              </div>
              <p className="mt-3 text-2xl font-extrabold text-slate-900">
                {formatCurrency(todayExpenses)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {debits && debits.length > 0
                  ? `${debits.length} debit records total`
                  : "No expenses recorded today"}
              </p>
            </Link>

            {/* 4. Estimates */}
            <Link
              href="/estimates"
              className="interactive-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-400"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Estimates & Quotes
                </span>
                <span className="text-lg">🧾</span>
              </div>
              <p className="mt-3 text-2xl font-extrabold text-slate-900">
                {totalEstimatesCount} quotes
              </p>
              <p className="mt-1 text-xs text-slate-500 truncate">
                {totalEstimatesCount > 0
                  ? `Worth ${formatCurrency(totalEstimatesValue)}`
                  : "No estimates created yet"}
              </p>
            </Link>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Business Tools
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="interactive-card group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-50 text-2xl group-hover:bg-brand-50 transition-colors">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                      {action.title}
                    </h3>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {action.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity Feed */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recent Business Activity
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {displayedActivities.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                <p className="text-sm font-semibold">No activity recorded yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  Counts, customer credit, expenses, and estimates will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {displayedActivities.map((act) => (
                  <Link
                    key={act.id}
                    href={act.href}
                    className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-base">
                        {act.type === "counter"
                          ? "💵"
                          : act.type === "credit"
                          ? "📒"
                          : act.type === "debit"
                          ? "📉"
                          : "🧾"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{act.title}</p>
                        <p className="text-xs text-slate-500">{act.subtitle}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm sm:text-base font-extrabold ${
                          act.amount > 0 ? "text-slate-900" : "text-amber-600"
                        }`}
                      >
                        {formatCurrency(Math.abs(act.amount))}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatDateTime(act.occurredAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
