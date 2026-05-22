export interface Snapshot {
  wayback_ts: string;
  captured_at: string;
  wayback_url: string;
  page_title: string | null;
}

export interface DomainMetadata {
  domain: string;
  first_captured: string | null;
  last_captured: string | null;
  total_snapshots: number;
  has_biography: boolean;
  snapshots: Snapshot[];
}

export interface DesignEra {
  name: string;
  start: string;
  end: string;
  description: string;
}

export interface KeyMoment {
  date: string;
  title: string;
  description: string;
}

export interface Biography {
  biography_md: string;
  design_eras: DesignEra[];
  key_moments: KeyMoment[];
  one_liner: string | null;
  generated_at: string;
  domain?: string;
}

export interface SavedDomain {
  id: string;
  domain: string;
  personal_note: string | null;
  saved_at: string;
  first_captured: string | null;
  latest_snapshot_ts: string | null;
}
