import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        url: "/",
        items: [],
      },
      {
        title: "Content",
        icon: Icons.Table,
        items: [
          { title: "News", url: "/content/news", icon: Icons.NewsIcon },
          { title: "Announcements", url: "/content/announcements", icon: Icons.ProjectsIcon },
          { title: "Committees", url: "/content/committees", icon: Icons.EventsIcon },
        ],
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Icons.Alphabet,
        items: [],
      },
    ],
  },
] as const;
