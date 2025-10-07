const MANUAL = {
  text: "Manual",
  items: [
    { text: "Quick Start", link: "/manual/start" },
    { text: "Installation", link: "/manual/install" },
  ],
};

export default {
  title: "Pera",
  description: "Running frontend code with only a single .tsx file",
  ignoreDeadLinks: [
    /^https?:\/\/localhost/,
  ],
  themeConfig: {
    search: {
      provider: "local",
    },
    nav: [
      { text: "Home", link: "/" },
      MANUAL,
    ],
    sidebar: [
      MANUAL,
    ],
  },
};
