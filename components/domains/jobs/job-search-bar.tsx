"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, X } from "lucide-react";

export function JobSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    if (location.trim() && location !== "all") {
      params.set("location", location.trim());
    } else {
      params.delete("location");
    }

    // Reset pagination to page 1 on new search
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery("");
    setLocation("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("location");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form
      role="search"
      aria-label="Job and Internship Search"
      onSubmit={handleSearch}
      className="flex flex-col md:flex-row items-center gap-2 p-2 bg-surface-card border border-border-strong rounded-lg shadow-sm"
    >
      {/* Keyword Search Input */}
      <div className="relative flex-1 w-full flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-text-muted shrink-0 pointer-events-none" aria-hidden="true" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, technical skills, or company name..."
          aria-label="Job title, skills, or company keyword search"
          className="pl-9 pr-8 h-10 border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear keyword search"
            className="absolute right-2.5 text-text-muted hover:text-text-primary p-1 focus-visible:ring-2 focus-visible:ring-border-focus rounded"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="hidden md:block h-6 w-px bg-border-subtle shrink-0" aria-hidden="true" />

      {/* Location Input */}
      <div className="relative w-full md:w-64 flex items-center">
        <MapPin className="absolute left-3 h-4 w-4 text-text-muted shrink-0 pointer-events-none" aria-hidden="true" />
        <Input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, State, or Remote..."
          aria-label="Location search"
          className="pl-9 pr-8 h-10 border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent text-sm"
        />
        {location && (
          <button
            type="button"
            onClick={() => setLocation("")}
            aria-label="Clear location search"
            className="absolute right-2.5 text-text-muted hover:text-text-primary p-1 focus-visible:ring-2 focus-visible:ring-border-focus rounded"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Button type="submit" className="w-full md:w-auto px-6 h-10 font-semibold">
          Search
        </Button>
        {(query || location) && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="text-xs text-text-muted hover:text-text-primary h-10 px-3"
          >
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}
