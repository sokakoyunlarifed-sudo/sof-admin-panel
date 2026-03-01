import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getDevicesUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const data = [
    {
      name: "Desktop",
      percentage: 0.65,
      amount: 1625,
    },
    {
      name: "Tablet",
      percentage: 0.1,
      amount: 250,
    },
    {
      name: "Mobile",
      percentage: 0.2,
      amount: 500,
    },
    {
      name: "Unknown",
      percentage: 0.05,
      amount: 125,
    },
  ];

  if (timeFrame === "yearly") {
    data[0].amount = 19500;
    data[1].amount = 3000;
    data[2].amount = 6000;
    data[3].amount = 1500;
  }

  return data;
}

export async function getPaymentsOverviewData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  const supabase = await getSupabaseServerClient();

  // We will produce three series: News, Announcements, Committees
  // Monthly: buckets Jan..Dec for current year
  // Yearly: buckets of last 5 years

  if (timeFrame === "yearly") {
    const now = new Date();
    const years = [
      now.getFullYear() - 4,
      now.getFullYear() - 3,
      now.getFullYear() - 2,
      now.getFullYear() - 1,
      now.getFullYear(),
    ];

    const [newsRes, annRes, comRes] = await Promise.all([
      supabase.from("news").select("created_at"),
      // Use announcements.date when available, fallback to created_at
      supabase.from("announcements").select("date,created_at"),
      supabase.from("committees").select("created_at"),
    ]);

    const series = {
      news: years.map((y) => ({ x: y, y: 0 })),
      announcements: years.map((y) => ({ x: y, y: 0 })),
      committees: years.map((y) => ({ x: y, y: 0 })),
    } as const;

    (newsRes.data || []).forEach((row: any) => {
      const y = new Date(row.created_at).getFullYear();
      const idx = years.indexOf(y);
      if (idx >= 0) series.news[idx].y += 1;
    });

    (annRes.data || []).forEach((row: any) => {
      const base = row.date || row.created_at;
      const y = new Date(base).getFullYear();
      const idx = years.indexOf(y);
      if (idx >= 0) series.announcements[idx].y += 1;
    });

    (comRes.data || []).forEach((row: any) => {
      const y = new Date(row.created_at).getFullYear();
      const idx = years.indexOf(y);
      if (idx >= 0) series.committees[idx].y += 1;
    });

    return series as any;
  }

  // Default: monthly
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);

  const [newsRes, annRes, comRes] = await Promise.all([
    supabase
      .from("news")
      .select("created_at")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString()),
    supabase
      .from("announcements")
      .select("date,created_at")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString()),
    supabase
      .from("committees")
      .select("created_at")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString()),
  ]);

  const news = months.map((m) => ({ x: m, y: 0 }));
  const announcements = months.map((m) => ({ x: m, y: 0 }));
  const committees = months.map((m) => ({ x: m, y: 0 }));

  (newsRes.data || []).forEach((row: any) => {
    const d = new Date(row.created_at);
    const mi = d.getMonth();
    news[mi].y += 1;
  });

  (annRes.data || []).forEach((row: any) => {
    const base = row.date || row.created_at;
    const d = new Date(base);
    const mi = d.getMonth();
    announcements[mi].y += 1;
  });

  (comRes.data || []).forEach((row: any) => {
    const d = new Date(row.created_at);
    const mi = d.getMonth();
    committees[mi].y += 1;
  });

  return { news, announcements, committees } as any;
}

export async function getWeeksProfitData(timeFrame?: string) {
  const supabase = await getSupabaseServerClient();
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - 6);

  const tables = ["news", "projects", "events"];
  const res = await Promise.all(
    tables.map((t) =>
      supabase
        .from(t)
        .select("created_at,published_at")
        .gte("created_at", start.toISOString())
        .lte("created_at", now.toISOString()),
    ),
  );

  const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]; // keep UI labels
  const sales = days.map((d) => ({ x: d, y: 0 })); // Published per day
  const revenue = days.map((d) => ({ x: d, y: 0 })); // Drafts per day

  for (const r of res) {
    (r.data || []).forEach((row: any) => {
      const d = new Date(row.created_at);
      const dayIdx = d.getDay();
      if (row.published_at) sales[dayIdx].y += 1;
      else revenue[dayIdx].y += 1;
    });
  }

  return { sales, revenue };
}

export async function getCampaignVisitorsData() {
  // Fake data for now to fix build
  return {
    total_visitors: 12500,
    performance: 12.5,
    chart: [
      { x: "Mon", y: 400 },
      { x: "Tue", y: 800 },
      { x: "Wed", y: 600 },
      { x: "Thu", y: 1000 },
      { x: "Fri", y: 900 },
      { x: "Sat", y: 1200 },
      { x: "Sun", y: 1100 },
    ],
  };
}