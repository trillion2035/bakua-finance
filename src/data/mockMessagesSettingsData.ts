export interface Message {
  id: string;
  from: string;
  role: string;
  avatar: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  read: boolean;
  channel: "platform" | "investor" | "bakua";
}

export const mockMessages: Message[] = [
  {
    id: "msg-1",
    from: "Bakua Finance",
    role: "Platform",
    avatar: "BF",
    subject: "Milestone 4 Disbursed Successfully",
    preview: "11,750,000 FCFA has been released to MHCC following weighbridge confirmation…",
    body: "Hi Emmanuel,\n\nMilestone 4 (Harvest Advance) has been successfully disbursed. 11,750,000 FCFA has been released to the MHCC operating account at Ecobank.\n\nOracle trigger confirmed: Weighbridge reading of 62.4 MT cherry intake exceeded the 60 MT threshold.\n\nRemaining in vault: 4,900,000 FCFA (Milestone 5 — Processing & Export).\n\nPlease ensure ONCC certification and Sucafina inspection are completed by June 2025 to trigger the final disbursement.\n\nBest regards,\nBakua Operations",
    date: "Apr 15, 2025",
    read: true,
    channel: "platform",
  },
  {
    id: "msg-2",
    from: "Sarah Chen",
    role: "Investor — Retail/DeFi",
    avatar: "SC",
    subject: "Question about Q1 harvest yield",
    preview: "Hi, I noticed the Grade A percentage dipped in March. Is this seasonal or…",
    body: "Hi Emmanuel,\n\nI've been reviewing the Q1 performance data on the dashboard. I noticed the Grade A percentage dipped from 81% in January to 76% in March.\n\nIs this a seasonal pattern, or should we be concerned about quality control at the mill?\n\nAlso, is the Sucafina off-take contract still on track for the June shipment?\n\nThanks for the transparency — the dashboard is incredibly detailed.\n\nBest,\nSarah",
    date: "Apr 12, 2025",
    read: false,
    channel: "investor",
  },
  {
    id: "msg-3",
    from: "Bakua Finance",
    role: "Platform",
    avatar: "BF",
    subject: "NDVI Oracle Update — March 2025",
    preview: "Sentinel-2 NDVI reading for March 2025: 0.63. All canopy health thresholds met…",
    body: "Monthly NDVI Report — March 2025\n\nSentinel-2 satellite pass (Mar 4, 2025) recorded an NDVI value of 0.63 across the 480 ha coverage area.\n\nThis exceeds the oracle threshold of 0.55 and confirms healthy canopy cover across all 12 plots.\n\nNo anomalies detected. Next satellite pass scheduled for Mar 9, 2025.\n\nThis data has been submitted to the Chainlink oracle adapter on Base Network.",
    date: "Apr 5, 2025",
    read: true,
    channel: "platform",
  },
  {
    id: "msg-4",
    from: "James Okonkwo",
    role: "Mercy Corps Ventures",
    avatar: "JO",
    subject: "Due diligence follow-up for Series extension",
    preview: "Emmanuel, we'd like to discuss the possibility of a second SPV for the…",
    body: "Dear Emmanuel,\n\nFollowing the strong performance of SPV-01, our team at Mercy Corps Ventures would like to explore the possibility of a second SPV for MHCC.\n\nSpecifically, we're interested in:\n1. Expanding to the remaining 200 ha of untitled land (once ACT conversion completes)\n2. Adding a wet mill processing facility\n3. Potential Blue Mountain varietal expansion\n\nCould we schedule a call next week to discuss? We'd also like to understand the timeline for the ONCC certification for the current harvest.\n\nBest regards,\nJames Okonkwo\nMercy Corps Ventures",
    date: "Apr 1, 2025",
    read: false,
    channel: "investor",
  },
  {
    id: "msg-5",
    from: "Bakua Finance",
    role: "Platform",
    avatar: "BF",
    subject: "Sensor Alert — RainGauge Charlie-1 Offline (Resolved)",
    preview: "RainGauge Charlie-1 at Plot B went offline for 2 hours on Mar 28. Issue resolved…",
    body: "Sensor Alert — Resolved\n\nDevice: RainGauge Charlie-1\nLocation: Plot B — Dschang (1,780m)\nIncident: Device went offline at 14:32 UTC on Mar 28, 2025\nResolution: Connectivity restored at 16:45 UTC. Cause: temporary cellular network outage in Dschang area.\n\nNo data loss — readings were cached locally and synced upon reconnection.\n\nAll 6 sensors are now online and reporting normally.",
    date: "Mar 28, 2025",
    read: true,
    channel: "platform",
  },
  {
    id: "msg-6",
    from: "Amina Fon",
    role: "MHCC Secretary",
    avatar: "AF",
    subject: "Updated insurance certificate from SAAR",
    preview: "Please find attached the renewed crop insurance certificate for the 2025 season…",
    body: "Dear Bakua team,\n\nPlease find the renewed SAAR crop insurance certificate for the 2025 growing season. Coverage has been increased from 35M FCFA to 42M FCFA to reflect the expanded planting area.\n\nThe certificate has been assigned to Bakua SPV-01 Ltd as beneficiary, as per the original agreement.\n\nPlease upload this to the document repository.\n\nRegards,\nAmina Fon\nSecretary, MHCC",
    date: "Mar 22, 2025",
    read: true,
    channel: "bakua",
  },
];

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited";
}

export const mockTeamMembers: TeamMember[] = [
  { id: "tm-1", name: "Emmanuel Nkweti", email: "emmanuel@mhcc.cm", role: "Admin", status: "active" },
  { id: "tm-2", name: "Amina Fon", email: "amina@mhcc.cm", role: "Member", status: "active" },
  { id: "tm-3", name: "Pierre Tchoupo", email: "pierre@mhcc.cm", role: "Viewer", status: "invited" },
];

export const mockCompanyProfile = {
  name: "Menoua Highlands Coffee Cooperative",
  shortName: "MHCC",
  registrationNo: "COOP/WR/2019/0847",
  country: "Cameroon",
  region: "West Region — Menoua Division",
  address: "Quartier Foreke-Dschang, Dschang, Cameroon",
  phone: "+237 6 77 XX XX XX",
  email: "info@mhcc.cm",
  website: "—",
  taxId: "M061900084723A",
  founded: "2019",
  president: "Emmanuel Nkweti",
  sector: "Agriculture — Specialty Coffee",
};
