export type NavTab = "dashboard" | "routine" | "progress" | "analysis" | "explore" | "profile";

export const routineSuggestions = [
  { id: "skin", title: "Morning skincare", tag: "Skin" as const, done: false },
  { id: "water", title: "Reach water target", tag: "Hydration" as const, done: false },
  { id: "steps", title: "Outdoor walk", tag: "Fitness" as const, done: false },
  { id: "posture", title: "Posture reset", tag: "Posture" as const, done: false },
  { id: "sleep", title: "Sleep wind-down", tag: "Sleep" as const, done: false },
];

export const exploreSections = [
  "Skin",
  "Hair",
  "Fitness",
  "Grooming",
  "Posture",
  "Sleep",
  "Nutrition",
  "Style",
];

export const libraryCards = [
  {
    title: "Simple Morning Skincare Routine",
    section: "Skin",
    time: "5 min read",
    text: "A practical routine built around cleansing, hydration, and daily SPF.",
  },
  {
    title: "How to Improve Sleep Quality",
    section: "Sleep",
    time: "6 min read",
    text: "Small changes for wind-down, room setup, caffeine timing, and consistency.",
  },
  {
    title: "Beginner Posture Routine",
    section: "Posture",
    time: "4 min read",
    text: "Simple mobility and awareness drills for a cleaner everyday posture.",
  },
  {
    title: "Daily Grooming Checklist",
    section: "Grooming",
    time: "3 min read",
    text: "A short checklist for hair, face, nails, scent, and clothing care.",
  },
  {
    title: "Hydration Guide",
    section: "Nutrition",
    time: "4 min read",
    text: "Set a realistic water target and build an easy tracking routine.",
  },
  {
    title: "Beginner Workout Routine",
    section: "Fitness",
    time: "7 min read",
    text: "A balanced starter plan focused on form, consistency, and recovery.",
  },
];

export const profileSettings = [
  "Personal Goals",
  "Daily Targets",
  "Reminder Settings",
  "Appearance",
  "Privacy",
  "Data",
  "Account",
  "Sign Out",
];
