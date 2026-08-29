export interface CollegePartnershipRecord {
  id: string;
  referenceCode: string;
  institutionName: string;
  affiliationType: string;
  tpoHeadName: string;
  officialEmail: string;
  phoneNumber: string;
  state: string;
  city: string;
  estimatedBatchSize: number;
  preferredHiringModes: string[];
  comments?: string;
  status: "new" | "reviewing" | "partnered" | "scheduled";
  createdAt: string;
}

export interface CampusDriveRegistrationRecord {
  id: string;
  driveId: string;
  registrantType: "student" | "tpo_institution";
  fullName: string;
  email: string;
  collegeName: string;
  graduationYear: string;
  phoneNumber?: string;
  registeredAt: string;
}

// In-Memory Global Store for Institutional Leads
class CollegeStore {
  private partnerships: Map<string, CollegePartnershipRecord> = new Map();
  private registrations: Map<string, CampusDriveRegistrationRecord> = new Map();

  constructor() {
    this.seedInitialLeads();
  }

  private seedInitialLeads() {
    const seedId = "lead-nit-001";
    this.partnerships.set(seedId, {
      id: seedId,
      referenceCode: "WEC-NIT-2026",
      institutionName: "National Institute of Technology, Karnataka (NITK)",
      affiliationType: "Institute of National Importance (INI / Autonomous)",
      tpoHeadName: "Dr. Rameshwar Rao (Head, T&P Cell)",
      officialEmail: "placements@nitk.edu.in",
      phoneNumber: "+91 98450 12345",
      state: "Karnataka",
      city: "Surathkal / Mangalore",
      estimatedBatchSize: 650,
      preferredHiringModes: ["On-Campus Pooled Drive", "6-Month Fast-Track Internships", "Virtual Hackathon"],
      comments: "Interested in organizing exclusive Day-1 hiring drives for 2026 CSE & ECE graduating batches.",
      status: "partnered",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    });

    const seedId2 = "lead-vit-002";
    this.partnerships.set(seedId2, {
      id: seedId2,
      referenceCode: "WEC-VIT-2026",
      institutionName: "Vellore Institute of Technology (VIT)",
      affiliationType: "Deemed University (NAAC A++)",
      tpoHeadName: "Prof. S. Balasubramanian",
      officialEmail: "pat.office@vit.ac.in",
      phoneNumber: "+91 94432 98765",
      state: "Tamil Nadu",
      city: "Vellore",
      estimatedBatchSize: 1200,
      preferredHiringModes: ["Virtual Online Assessment", "6-Month Fast-Track Internships"],
      comments: "Seeking product engineering startup cohorts for B.Tech CSE & Data Science students.",
      status: "reviewing",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    });
  }

  async addPartnership(data: Omit<CollegePartnershipRecord, "id" | "referenceCode" | "status" | "createdAt">): Promise<CollegePartnershipRecord> {
    const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const shortCode = data.institutionName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 4)
      .toUpperCase();
    const referenceCode = `WEC-${shortCode || "COL"}-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: CollegePartnershipRecord = {
      ...data,
      id,
      referenceCode,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    this.partnerships.set(id, record);
    return record;
  }

  async addRegistration(data: Omit<CampusDriveRegistrationRecord, "id" | "registeredAt">): Promise<CampusDriveRegistrationRecord> {
    const id = `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const record: CampusDriveRegistrationRecord = {
      ...data,
      id,
      registeredAt: new Date().toISOString(),
    };

    this.registrations.set(id, record);
    return record;
  }

  async getAllPartnerships(): Promise<CollegePartnershipRecord[]> {
    return Array.from(this.partnerships.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const collegeStore = new CollegeStore();
