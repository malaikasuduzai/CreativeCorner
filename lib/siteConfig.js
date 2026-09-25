// Central place for figures that aren't stored anywhere else in the database.
// Update FOUNDING_YEAR once when the company's start date changes and every
// page that shows "Years of Experience" will recalculate itself automatically.
export const FOUNDING_YEAR = 2025;

export function getYearsOfExperience() {
  const years = new Date().getFullYear() - FOUNDING_YEAR;
  return Math.max(years, 0);
}

// There's no "satisfaction survey" table in the schema yet, so this stays a
// simple constant you can edit by hand until real feedback data exists.
export const CLIENT_SATISFACTION_PERCENT = 98;
