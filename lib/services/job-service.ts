import { jobStore } from "@/lib/db/job-store";
import { PublicJob } from "@/lib/db/seed-data";

export interface JobQueryFilters {
  query?: string;
  location?: string;
  jobType?: "all" | "full_time" | "internship" | "part_time" | "contract";
  workplaceType?: "all" | "on_site" | "hybrid" | "remote";
  experienceLevel?: "all" | "freshers" | "1-3_years" | "3-5_years" | "5+_years";
  minCompensation?: number;
  skill?: string;
  sortBy?: "newest" | "compensation_desc" | "relevance";
  page?: number;
  limit?: number;
}

export interface PaginatedJobResult {
  jobs: PublicJob[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  activeFiltersCount: number;
}

/**
 * Server-side public job discovery service.
 * Strictly enforces that ONLY 'published' opportunities are visible publicly.
 */
export async function getPublicJobs(filters: JobQueryFilters = {}): Promise<PaginatedJobResult> {
  const {
    query = "",
    location = "",
    jobType = "all",
    workplaceType = "all",
    experienceLevel = "all",
    minCompensation = 0,
    skill = "",
    sortBy = "newest",
    page = 1,
    limit = 10,
  } = filters;

  const allPublished = await jobStore.getPublishedJobs();
  let filtered = [...allPublished];

  let activeFiltersCount = 0;

  // 1. Keyword Search (Title, Company Name, Skills, Description)
  if (query.trim()) {
    activeFiltersCount++;
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.name.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q)) ||
        job.description.toLowerCase().includes(q)
    );
  }

  // 2. Location Filter
  if (location && location !== "all") {
    activeFiltersCount++;
    const loc = location.toLowerCase().trim();
    filtered = filtered.filter(
      (job) =>
        job.city.toLowerCase().includes(loc) ||
        job.state.toLowerCase().includes(loc) ||
        (loc === "remote" && job.workplaceType === "remote")
    );
  }

  // 3. Job Type Filter (Full-time vs Internship)
  if (jobType && jobType !== "all") {
    activeFiltersCount++;
    filtered = filtered.filter((job) => job.jobType === jobType);
  }

  // 4. Workplace Type (Remote / Hybrid / On-site)
  if (workplaceType && workplaceType !== "all") {
    activeFiltersCount++;
    filtered = filtered.filter((job) => job.workplaceType === workplaceType);
  }

  // 5. Experience Level
  if (experienceLevel && experienceLevel !== "all") {
    activeFiltersCount++;
    filtered = filtered.filter((job) => job.experienceLevel === experienceLevel);
  }

  // 6. Minimum Compensation
  if (minCompensation > 0) {
    activeFiltersCount++;
    filtered = filtered.filter((job) => job.maxCompensation >= minCompensation);
  }

  // 7. Specific Skill Tag Filter
  if (skill && skill !== "all") {
    activeFiltersCount++;
    const s = skill.toLowerCase();
    filtered = filtered.filter((job) =>
      job.skills.some((sk) => sk.toLowerCase() === s)
    );
  }

  // 8. Sorting
  if (sortBy === "compensation_desc") {
    filtered.sort((a, b) => b.maxCompensation - a.maxCompensation);
  } else if (sortBy === "newest") {
    filtered.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  // 9. Pagination
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const validPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (validPage - 1) * limit;
  const paginatedJobs = filtered.slice(startIndex, startIndex + limit);

  return {
    jobs: paginatedJobs,
    totalCount,
    currentPage: validPage,
    totalPages,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
    activeFiltersCount,
  };
}

/**
 * Retrieve public job by slug.
 */
export async function getPublicJobBySlug(slug: string): Promise<PublicJob | null> {
  return jobStore.getPublishedJobBySlug(slug);
}

/**
 * Retrieve related jobs for the detail view.
 */
export async function getRelatedJobs(currentJobId: string, limit = 3): Promise<PublicJob[]> {
  const allPublished = await jobStore.getPublishedJobs();
  const current = allPublished.find((j) => j.id === currentJobId);
  if (!current) return [];

  return allPublished
    .filter(
      (j) =>
        j.id !== currentJobId &&
        (j.jobType === current.jobType ||
          j.skills.some((s) => current.skills.includes(s)))
    )
    .slice(0, limit);
}

/**
 * Summary counts for filters
 */
export async function getDiscoveryMetadata() {
  const published = await jobStore.getPublishedJobs();
  const fullTimeCount = published.filter((j) => j.jobType === "full_time").length;
  const internshipCount = published.filter((j) => j.jobType === "internship").length;
  const remoteCount = published.filter((j) => j.workplaceType === "remote").length;
  const hybridCount = published.filter((j) => j.workplaceType === "hybrid").length;
  const onSiteCount = published.filter((j) => j.workplaceType === "on_site").length;

  return {
    total: published.length,
    fullTimeCount,
    internshipCount,
    remoteCount,
    hybridCount,
    onSiteCount,
    cities: ["Bengaluru", "Pune", "Mumbai", "Hyderabad", "Delhi NCR", "Pan-India"],
    skills: ["React", "TypeScript", "Node.js", "Python", "Go", "PostgreSQL", "Figma", "AWS", "SQL"],
  };
}
