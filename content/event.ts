// Single source of truth for every TABS 1.0 fact.
// The page and the AI assistant read from this file only. Do not add details
// that have not been confirmed; leave a TODO instead.

export const event = {
  name: "The AI Build Shop",
  shortName: "TABS",
  edition: "TABS 1.0",
  editionNote: "First edition",
  tagline: "Don't just learn about AI. Build with it.",
  supportingLine:
    "Four hands-on Saturdays in Accra. You won't just sit and listen: you'll learn the tools, then leave with a finished product that works and that you can share with your network. No tech skills needed.",
  url: "https://events.theaugustdispatch.com",

  dates: {
    label: "Saturdays 7, 14, 21 and 28 November 2026",
    short: "7, 14, 21 and 28 Nov 2026",
    iso: ["2026-11-07", "2026-11-14", "2026-11-21", "2026-11-28"],
  },
  time: {
    label: "11am to 2pm each Saturday",
    short: "11am to 2pm",
    start: "11:00",
    end: "14:00",
    timezone: "Africa/Accra",
  },

  venue: {
    name: "Venture Nest",
    address: "HR4F+WR6, Klannaa St, Osu, Accra",
    plusCode: "HR4F+WR6",
    directionsNote: "Paste HR4F+WR6 into Google Maps for directions.",
    // Derived from the plus code above, not a separately confirmed link.
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=HR4F%2BWR6%20Accra",
  },

  price: {
    amount: 200,
    currency: "GHS",
    label: "GHS 200",
    covers: "All four Saturdays",
    refundPolicy: "Payments are non-refundable.",
  },

  seats: {
    total: 40,
    policy: "First come, first served",
  },

  payment: {
    method: "Mobile Money",
    number: "0597580640",
    accountName: "Daniel Kwaku Merki",
    reference: "Use your full name as the reference.",
    confirmation: "Your seat is confirmed once payment is received.",
  },

  contact: {
    whatsapp: "0207926546",
    // Derived from the WhatsApp number with Ghana's country code (+233).
    whatsappUrl: "https://wa.me/233207926546",
    email: "theteam@augustwheel.com",
  },

  audience: {
    groups: [
      "Entrepreneurs and business owners",
      "Workers and professionals",
      "Students and job seekers",
      "Anyone curious about AI",
    ],
    callout: "No coding or tech background needed.",
  },

  build: {
    summary: "A live personal website, and you decide what it's about.",
    title: "Your personal portfolio",
    description:
      "A home online for you: who you are, what you do, what you make or sell, or an idea you care about. Built your way, ready to share with your network.",
    showcase: "Every finished site is featured on The AI Build Shop showcase site.",
    // TODO: showcase site URL not provided yet.
    showcaseUrl: null as string | null,
  },

  learn: [
    "Write good prompts",
    "Create and edit images with AI",
    "Turn an idea into a clear plan",
    "Build a website by describing it in plain words (vibe coding)",
    "Publish your site and update it yourself after the course",
  ],

  schedule: {
    sessions: [
      {
        id: "7-nov",
        tab: "7 Nov",
        date: "2026-11-07",
        dateLabel: "Sat 7 Nov",
        title: "Meet your AI toolkit",
        description:
          "Opening talk from Daniel Merki of Zipline Ghana, a tour of everyday AI tools, how to write good prompts, and shaping your website idea.",
        linkedGroup: null,
      },
      {
        id: "14-nov",
        tab: "14 Nov",
        date: "2026-11-14",
        dateLabel: "Sat 14 Nov",
        title: "Vibe Coding 101: Part 1",
        description:
          "Plan your page, find design inspiration, and use AI to write your text and create your images.",
        linkedGroup: "vibe-coding-101",
      },
      {
        id: "21-nov",
        tab: "21 Nov",
        date: "2026-11-21",
        dateLabel: "Sat 21 Nov",
        title: "Vibe Coding 101: Part 2",
        description: "Build your website with AI and publish it live.",
        linkedGroup: "vibe-coding-101",
      },
      {
        id: "28-nov",
        tab: "28 Nov",
        date: "2026-11-28",
        dateLabel: "Sat 28 Nov",
        title: "Demo Day",
        description:
          "Polish your site, learn to update it yourself, and present your work. Talk from Daniel Merki.",
        linkedGroup: null,
      },
    ],
    flowNote:
      "Parts 1 and 2 flow together: finish Part 1 early and you start building straight away. The earlier you finish, the more time you have to polish and fix errors before Demo Day.",
    betweenSessions:
      "Between sessions there are small, practical tasks, such as gathering photos or testing your site with a friend.",
  },

  speakers: [
    {
      id: "daniel-merki",
      name: "Daniel Kwaku Merki",
      initials: "DM",
      role: "Country Director, Zipline Ghana; Venture Builder, Boxplay Ventures",
      bio: "Builds African ventures from idea to commercialisation, capital and scale. Opens the course on 7 November with the story of how Zipline uses technology to change lives in Ghana, and returns for Demo Day on 28 November.",
      linkedin: "https://www.linkedin.com/in/danielmerki/",
      photo: "/assets/speaker-daniel-merki-320.webp" as string | null,
    },
    {
      id: "augustine-osei",
      name: "Augustine Osei",
      initials: "AO",
      role: "Lead Facilitator, Founder of August Labs",
      bio: "Augustine, known as August, is an IT and cybersecurity professional who builds with AI in public. His projects include GhanaNice.com, an AI-powered guide to discovering Ghana, and browser games such as CHOP FIRST. He also publishes The August Dispatch.",
      linkedin: "https://www.linkedin.com/in/augustineosei/" as string | null,
      photo: "/assets/speaker-augustine-osei-320.webp" as string | null,
    },
  ],
  guestSpeakerNote: "A special guest speaker may join one session, to be announced.",

  bring: [
    "Your laptop",
    "Your laptop charger",
    "A Google (Gmail) account you can log in to",
    "Your phone, for testing your website",
  ],

  included: [
    "Four hands-on sessions",
    "Your own live website",
    "A feature on the showcase site",
    "A community to keep learning after the course",
  ],
  // TODO: setup checklist content to be supplied.
  setupChecklistNote: "A short setup checklist is sent before the first session.",

  partners: [
    {
      name: "The August Dispatch",
      logo: "/assets/partner-august-dispatch.png",
      width: 767,
      height: 165,
    },
    {
      name: "Venture Nest",
      logo: "/assets/partner-venture-nest.png",
      width: 642,
      height: 95,
    },
  ],
  presentedBy: "Presented by The August Dispatch and Venture Nest",
} as const;

export type EventFacts = typeof event;
export type Session = EventFacts["schedule"]["sessions"][number];
