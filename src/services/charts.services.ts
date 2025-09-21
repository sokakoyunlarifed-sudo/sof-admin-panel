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

  const tables = ["news","projects","events"];
  const res = await Promise.all(
    tables.map((t) =>
      supabase
        .from(t)
        .select("created_at,published_at")
        .gte("created_at", start.toISOString())
        .lte("created_at", now.toISOString()),
    ),
  );

  const days = ["Sat","Sun","Mon","Tue","Wed","Thu","Fri"]; // keep UI labels
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
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    total_visitors: 784_000,
    performance: -1.5,
    chart: [
      { x: "S", y: 168 },
      { x: "S", y: 385 },
      { x: "M", y: 201 },
      { x: "T", y: 298 },
      { x: "W", y: 187 },
      { x: "T", y: 195 },
      { x: "F", y: 291 },
    ],
  };
}

export async function getVisitorsAnalyticsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112, 123, 212, 270,
    190, 310, 115, 90, 380, 112, 223, 292, 170, 290, 110, 115, 290, 380, 312,
  ].map((value, index) => ({ x: index + 1 + "", y: value }));
}

export async function getCostsPerInteractionData() {
  return {
    avg_cost: 560.93,
    growth: 2.5,
    chart: [
      {
        name: "Google Ads",
        data: [
          { x: "Sep", y: 15 },
          { x: "Oct", y: 12 },
          { x: "Nov", y: 61 },
          { x: "Dec", y: 118 },
          { x: "Jan", y: 78 },
          { x: "Feb", y: 125 },
          { x: "Mar", y: 165 },
          { x: "Apr", y: 61 },
          { x: "May", y: 183 },
          { x: "Jun", y: 238 },
          { x: "Jul", y: 237 },
          { x: "Aug", y: 235 },
        ],
      },
      {
        name: "Facebook Ads",
        data: [
          { x: "Sep", y: 75 },
          { x: "Oct", y: 77 },
          { x: "Nov", y: 151 },
          { x: "Dec", y: 72 },
          { x: "Jan", y: 7 },
          { x: "Feb", y: 58 },
          { x: "Mar", y: 60 },
          { x: "Apr", y: 185 },
          { x: "May", y: 239 },
          { x: "Jun", y: 135 },
          { x: "Jul", y: 119 },
          { x: "Aug", y: 124 },
        ],
      },
    ],
  };
}