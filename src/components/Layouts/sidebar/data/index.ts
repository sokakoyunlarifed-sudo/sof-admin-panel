import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "ANA MENÜ",
    items: [
      {
        title: "Panel",
        icon: Icons.HomeIcon,
        url: "/",
        items: [],
      },
      {
        title: "İçerik",
        icon: Icons.Table,
        items: [
          { title: "Haberler", url: "/content/news", icon: Icons.NewsIcon },
          { title: "Duyurular", url: "/content/announcements", icon: Icons.ProjectsIcon },
          { title: "Komiteler", url: "/content/committees", icon: Icons.EventsIcon },
        ],
      },
      {
        title: "Takvim",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Ayarlar",
        url: "/settings",
        icon: Icons.Alphabet,
        items: [],
      },
    ],
  },
] as const;
