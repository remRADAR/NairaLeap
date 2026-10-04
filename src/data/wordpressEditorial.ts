// Snapshot of the published WordPress Blogsy feed used by the editorial homepage.
// Replace with the CMS adapter once the production content endpoint is connected.

export interface EditorialPost {
  title: string;
  href: string;
  date: string;
  category: string;
  excerpt: string;
}

export const EDITORIAL_POSTS: EditorialPost[] = [
  {
    title: "FRSC commends Dangote Cement on new transport safety policy",
    href: "https://nairaleap.ct.ws/2026/06/04/frsc-commends-dangote-cement-on-new-transport-safety-policy/",
    date: "June 4, 2026",
    category: "Transportation Investigation and Safety Boards",
    excerpt:
      "The Federal Road Safety Corps has commended Dangote Cement Plc for delivering measurable and transformative transport safety improvements.",
  },
  {
    title: "UAE envoy: First Abu Dhabi Bank, Etihad Airways will begin Nigeria operations soon",
    href: "https://nairaleap.ct.ws/2026/06/04/uae-envoy-first-abu-dhabi-bank-etihad-airways-will-begin-nigeria-operations-soon/",
    date: "June 4, 2026",
    category: "Aviation",
    excerpt: "The latest business and regional development story from NairaLeap’s editorial desk.",
  },
  {
    title: "US-Nigeria air strike kills ‘21 ISWAP fighters’ in Borno",
    href: "https://nairaleap.ct.ws/2026/06/01/us-nigeria-air-strike-kills-21-iswap-fighters-in-borno/",
    date: "June 1, 2026",
    category: "Interconnectedness",
    excerpt:
      "A developing national security story with implications for Nigeria and its international partners.",
  },
  {
    title: "Tinubu mourns beheaded Oyo teacher, pledges rescue of abducted students",
    href: "https://nairaleap.ct.ws/2026/06/01/tinubu-mourns-beheaded-oyo-teacher-pledges-rescue-of-abducted-students/",
    date: "June 1, 2026",
    category: "Sustainable Development",
    excerpt: "A public-interest update connecting leadership, education, and community safety.",
  },
  {
    title: "OPay hits 45 million users, expands merchant network to over 1 million nationwide",
    href: "https://nairaleap.ct.ws/2026/06/01/opay-hits-45-million-users-expands-merchant-network-to-over-1-million-nationwide/",
    date: "June 1, 2026",
    category: "Digital Economy",
    excerpt:
      "A technology and commerce indicator tracking the reach of digital payments across Nigeria.",
  },
  {
    title: "Nigerian stocks flash classic cyclical peak signals, aggressive buyers beware",
    href: "https://nairaleap.ct.ws/2026/06/01/nigerian-stocks-flash-classic-cyclical-peak-signals-aggressive-buyers-beware/",
    date: "June 1, 2026",
    category: "Financial Health Performance and Relative Strength Index (RSI)",
    excerpt:
      "The multi-million-dollar question dominating Broad Street is whether the NGX All-Share Index has peaked.",
  },
  {
    title: "Cost of healthy diet rises to N1,541 daily in March 2026 — NBS",
    href: "https://nairaleap.ct.ws/2026/06/01/cost-of-healthy-diet-rises-to-n1541-daily-in-march-2026-nbs/",
    date: "June 1, 2026",
    category: "Health",
    excerpt:
      "A data-led look at household nutrition costs and the indicators shaping everyday life.",
  },
  {
    title: "The Beginning: The Longest Running University-Industry Partnerships in Nigeria",
    href: "https://nairaleap.ct.ws/2026/06/01/the-beginning-the-longest-running-university-industry-partnerships-in-nigeria/",
    date: "June 1, 2026",
    category: "Education",
    excerpt:
      "A long-form indicator story about the relationship between institutions, industry, and national development.",
  },
  {
    title: "JAMB releases 279 UTME results withheld over malpractice concerns",
    href: "https://nairaleap.ct.ws/2026/05/29/jamb-releases-279-utme-results-withheld-over-malpractice-concerns/",
    date: "May 29, 2026",
    category: "Education",
    excerpt: "The latest education-sector update from the NairaLeap indicator desk.",
  },
  {
    title: "APC unveils 25 gov candidates as Kwara, Bauchi suffer delay",
    href: "https://nairaleap.ct.ws/2026/05/29/apc-unveils-25-gov-candidates-as-kwara-bauchi-suffer-delay/",
    date: "May 29, 2026",
    category: "Governance",
    excerpt: "A governance and leadership update tracking Nigeria’s political landscape.",
  },
  {
    title: "Public Service Leaders Unite To Drive Reforms, Professionalism In Nigeria",
    href: "https://nairaleap.ct.ws/2026/05/29/public-service-leaders-unite-to-drive-reforms-professionalism-in-nigeria/",
    date: "May 29, 2026",
    category: "Leadership",
    excerpt: "A spotlight on public-sector leadership, reform, and professional standards.",
  },
  {
    title: "Poor Plumbing Materials Threaten Building Safety, Longevity – Babayeju",
    href: "https://nairaleap.ct.ws/2026/05/29/poor-plumbing-materials-threaten-building-safety-longevity-babayeju/",
    date: "May 29, 2026",
    category: "Infrastructure Quality",
    excerpt:
      "An infrastructure indicator story examining the materials behind safer, longer-lasting buildings.",
  },
] as EditorialPost[];
