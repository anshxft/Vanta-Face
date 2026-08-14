"use client";

import type { CSSProperties, ReactNode } from "react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  exploreSections,
  libraryCards,
  NavTab,
  profileSettings,
  routineSuggestions,
} from "./data";
import { AnalysisPage, type AnalysisResult } from "./analysis";

type Category =
  | "Skin"
  | "Hair"
  | "Fitness"
  | "Grooming"
  | "Posture"
  | "Sleep"
  | "Nutrition"
  | "Style";

type Routine = {
  id: string;
  title: string;
  tag: Category | "Hydration";
  done: boolean;
};

type Goals = {
  water: number;
  sleep: number;
  steps: number;
  workout: number;
};

type Measurement = {
  id: string;
  weight?: string;
  bodyFat?: string;
  waist?: string;
  chest?: string;
  arms?: string;
  neck?: string;
  shoulders?: string;
  createdAt: string;
};

type SkinLog = {
  id: string;
  clarity: number;
  acne: number;
  oiliness: number;
  dryness: number;
  darkCircles: number;
  overall: number;
  createdAt: string;
};

type ProgressPhoto = {
  id: string;
  url: string;
  name: string;
  createdAt: string;
};

type AppState = {
  onboarded: boolean;
  activeTab: NavTab;
  focusAreas: string[];
  goals: Goals;
  routines: Routine[];
  measurements: Measurement[];
  skinLogs: SkinLog[];
  photos: ProgressPhoto[];
  analyses: AnalysisResult[];
};

const storageKey = "vantaface-state-v2";
const categories: Category[] = [
  "Skin",
  "Hair",
  "Fitness",
  "Grooming",
  "Posture",
  "Sleep",
  "Nutrition",
  "Style",
];
const onboardingChoices = [
  "Skin",
  "Hair",
  "Fitness",
  "Face & Grooming",
  "Posture",
  "Sleep",
  "Style",
  "Overall Glow Up",
];
const tabs: { id: NavTab; label: string }[] = [
  { id: "dashboard", label: "Today" },
  { id: "routine", label: "Routine" },
  { id: "progress", label: "Progress" },
  { id: "analysis", label: "Analysis" },
  { id: "explore", label: "Explore" },
  { id: "profile", label: "Profile" },
];
const defaultGoals: Goals = { water: 8, sleep: 7.5, steps: 8000, workout: 4 };
const initialState: AppState = {
  onboarded: false,
  activeTab: "dashboard",
  focusAreas: [],
  goals: defaultGoals,
  routines: [],
  measurements: [],
  skinLogs: [],
  photos: [],
  analyses: [],
};

export function AppShell() {
  const [state, setState] = usePersistentState();
  const [modal, setModal] = useState<ModalName | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const completed = state.routines.filter((routine) => routine.done).length;
  const progress = state.routines.length
    ? Math.round((completed / state.routines.length) * 100)
    : 0;

  function patch(patchValue: Partial<AppState>) {
    setState((current) => ({ ...current, ...patchValue }));
  }

  function openDashboardFromOnboarding(payload: {
    focusAreas: string[];
    goals: Goals;
    routines: Routine[];
  }) {
    setState((current) => ({
      ...current,
      onboarded: true,
      activeTab: "dashboard",
      focusAreas: payload.focusAreas,
      goals: payload.goals,
      routines: payload.routines.map((routine) => ({ ...routine, done: false })),
    }));
  }

  function addRoutine(title: string, tag: Category | "Hydration") {
    const routine: Routine = {
      id: `routine-${Date.now()}`,
      title,
      tag,
      done: false,
    };
    patch({ routines: [...state.routines, routine] });
  }

  function toggleRoutine(id: string) {
    patch({
      routines: state.routines.map((routine) =>
        routine.id === id ? { ...routine, done: !routine.done } : routine,
      ),
    });
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 900);
  }

  function saveGoals(goals: Goals) {
    patch({ goals });
    setModal(null);
  }

  function addMeasurement(measurement: Omit<Measurement, "id" | "createdAt">) {
    patch({
      measurements: [
        {
          ...measurement,
          id: `measurement-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
        ...state.measurements,
      ],
    });
    setModal(null);
  }

  function addSkinLog(log: Omit<SkinLog, "id" | "createdAt">) {
    patch({
      skinLogs: [
        { ...log, id: `skin-${Date.now()}`, createdAt: new Date().toISOString() },
        ...state.skinLogs,
      ],
    });
    setModal(null);
  }

  function addPhoto(photo: ProgressPhoto) {
    patch({ photos: [photo, ...state.photos] });
  }

  function saveAnalysis(analysis: AnalysisResult) {
    patch({ analyses: [analysis, ...state.analyses.filter((item) => item.id !== analysis.id)] });
  }

  return (
    <main className="appRoot">
      <div className="ambient one" />
      <div className="ambient two" />
      {!state.onboarded ? (
        <Onboarding onFinish={openDashboardFromOnboarding} />
      ) : (
        <>
          <DesktopNavigation
            activeTab={state.activeTab}
            onChange={(activeTab) => patch({ activeTab })}
          />
          <div className="appFrame">
            <section className="appSurface">
              <Header
                activeTab={state.activeTab}
                onGoalClick={() => setModal("goals")}
              />
              <div className="tabTransition" key={state.activeTab}>
                {state.activeTab === "dashboard" && (
                  <Dashboard
                    goals={state.goals}
                    routines={state.routines}
                    completed={completed}
                    progress={progress}
                    celebrate={celebrate}
                    onToggleRoutine={toggleRoutine}
                    onCreateRoutine={() => setModal("routine")}
                    onGoalClick={() => setModal("goals")}
                    onHistoryClick={() => setModal("history")}
                  />
                )}
                {state.activeTab === "routine" && (
                  <RoutinePage
                    routines={state.routines}
                    completed={completed}
                    progress={progress}
                    celebrate={celebrate}
                    onToggleRoutine={toggleRoutine}
                    onCreateRoutine={() => setModal("routine")}
                    onHistoryClick={() => setModal("history")}
                  />
                )}
                {state.activeTab === "progress" && (
                  <ProgressPage
                    measurements={state.measurements}
                    skinLogs={state.skinLogs}
                    photos={state.photos}
                    onAddMeasurement={() => setModal("measurement")}
                    onLogSkin={() => setModal("skin")}
                    onAddPhoto={addPhoto}
                  />
                )}
                {state.activeTab === "analysis" && (
                  <AnalysisPage
                    analyses={state.analyses}
                    routines={state.routines}
                    goals={state.goals}
                    photos={state.photos}
                    onSaveAnalysis={saveAnalysis}
                  />
                )}
                {state.activeTab === "explore" && <ExplorePage />}
                {state.activeTab === "profile" && (
                  <ProfilePage
                    goals={state.goals}
                    focusAreas={state.focusAreas}
                    onGoalClick={() => setModal("goals")}
                  />
                )}
              </div>
            </section>
          </div>
          <BottomNavigation
            activeTab={state.activeTab}
            onChange={(activeTab) => patch({ activeTab })}
          />
          <GoalModal
            open={modal === "goals"}
            goals={state.goals}
            onClose={() => setModal(null)}
            onSave={saveGoals}
          />
          <RoutineModal
            open={modal === "routine"}
            onClose={() => setModal(null)}
            onSave={addRoutine}
          />
          <WeeklyHistoryModal open={modal === "history"} onClose={() => setModal(null)} />
          <MeasurementModal
            open={modal === "measurement"}
            onClose={() => setModal(null)}
            onSave={addMeasurement}
          />
          <SkinModal
            open={modal === "skin"}
            onClose={() => setModal(null)}
            onSave={addSkinLog}
          />
        </>
      )}
    </main>
  );
}

function Onboarding({
  onFinish,
}: {
  onFinish: (payload: { focusAreas: string[]; goals: Goals; routines: Routine[] }) => void;
}) {
  const [step, setStep] = useState(0);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [goals, setGoals] = useState<Goals>(defaultGoals);
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>([]);
  const [customOpen, setCustomOpen] = useState(false);
  const [customRoutines, setCustomRoutines] = useState<Routine[]>([]);
  const steps = ["Welcome", "Focus", "Goals", "Routine", "Ready"];
  const routinePool = [...routineSuggestions, ...customRoutines];

  function next() {
    if (step === steps.length - 1) {
      const routines = routinePool.filter((routine) =>
        selectedRoutineIds.includes(routine.id),
      );
      onFinish({ focusAreas, goals, routines });
    } else {
      setStep((current) => current + 1);
    }
  }

  function toggleFocus(choice: string) {
    setFocusAreas((current) =>
      current.includes(choice)
        ? current.filter((item) => item !== choice)
        : [...current, choice],
    );
  }

  function toggleRoutine(id: string) {
    setSelectedRoutineIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <section className="onboarding">
      <div className="wordmark large">VantaFace</div>
      <div className="onboardingCard" key={step}>
        <StepDots total={steps.length} current={step} />
        {step === 0 && (
          <div className="onboardContent">
            <p className="eyebrow">WELCOME</p>
            <h1>Welcome to VantaFace.</h1>
            <p>Build better habits. Track your progress. Become your best version.</p>
          </div>
        )}
        {step === 1 && (
          <div className="onboardContent">
            <p className="eyebrow">PERSONALIZE</p>
            <h1>What do you want to improve?</h1>
            <div className="choiceGrid">
              {onboardingChoices.map((choice) => (
                <button
                  className={focusAreas.includes(choice) ? "choice active" : "choice"}
                  key={choice}
                  type="button"
                  onClick={() => toggleFocus(choice)}
                >
                  <span>{choice}</span>
                  <b>{focusAreas.includes(choice) ? "✓" : ""}</b>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="onboardContent">
            <p className="eyebrow">DAILY TARGETS</p>
            <h1>Create your daily goals.</h1>
            <PickerGrid goals={goals} onChange={setGoals} />
          </div>
        )}
        {step === 3 && (
          <div className="onboardContent">
            <p className="eyebrow">ROUTINE</p>
            <h1>Build your routine.</h1>
            <div className="routinePreview compact">
              {routinePool.map((item) => (
                <SelectableRoutine
                  key={item.id}
                  item={item}
                  selected={selectedRoutineIds.includes(item.id)}
                  onToggle={() => toggleRoutine(item.id)}
                />
              ))}
            </div>
            <button className="inlineAction" type="button" onClick={() => setCustomOpen(true)}>
              Create custom routine
            </button>
          </div>
        )}
        {step === 4 && (
          <div className="onboardContent">
            <p className="eyebrow">READY</p>
            <h1>Your glow-up plan is ready.</h1>
            <p>
              You selected {selectedRoutineIds.length} routine
              {selectedRoutineIds.length === 1 ? "" : "s"}. Your dashboard will
              start from zero and update as you complete work.
            </p>
          </div>
        )}
        <div className="onboardActions">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((current) => current - 1)}>
              Back
            </Button>
          )}
          <Button onClick={next}>{step === 4 ? "Open Dashboard" : "Get Started"}</Button>
        </div>
      </div>
      <RoutineModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSave={(title, tag) => {
          const routine = { id: `custom-${Date.now()}`, title, tag, done: false };
          setCustomRoutines((current) => [...current, routine]);
          setSelectedRoutineIds((current) => [...current, routine.id]);
          setCustomOpen(false);
        }}
      />
    </section>
  );
}

function Dashboard({
  goals,
  routines,
  completed,
  progress,
  celebrate,
  onToggleRoutine,
  onCreateRoutine,
  onGoalClick,
  onHistoryClick,
}: {
  goals: Goals;
  routines: Routine[];
  completed: number;
  progress: number;
  celebrate: boolean;
  onToggleRoutine: (id: string) => void;
  onCreateRoutine: () => void;
  onGoalClick: () => void;
  onHistoryClick: () => void;
}) {
  return (
    <div className="dashboardGrid">
      <section className="heroPanel stagger">
        <div>
          <p className="label">Personal workspace</p>
          <h2>Start clean. Build consistency from day one.</h2>
          <p>
            Your stats start from zero and update only from routines and logs you
            create in VantaFace.
          </p>
        </div>
        <ProgressRing value={progress} />
      </section>
      <StatCard title="Current streak" value="0" suffix="days" />
      <StatCard title="Overall consistency" value={progress} suffix="%" />
      <StatCard title="Average sleep" value="0" suffix="h" />
      <section className="panel wide stagger">
        <PanelHeader title="Morning Routine" action="Create Routine" onAction={onCreateRoutine} />
        {routines.length ? (
          <div className="routinePreview">
            {routines.map((item) => (
              <RoutineItem
                item={item}
                key={item.id}
                onToggle={() => onToggleRoutine(item.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No routine created yet."
            text="Build a routine that fits your lifestyle."
            action="Create Routine"
            onAction={onCreateRoutine}
          />
        )}
        {celebrate && <div className="celebration">Routine updated</div>}
      </section>
      <section className="panel stagger">
        <PanelHeader title="Weekly Progress" action="View History" onAction={onHistoryClick} />
        <EmptyState
          compact
          title="No weekly progress yet."
          text="Complete routines for a few days to see your trend."
        />
      </section>
      <section className="panel stagger">
        <PanelHeader title="Daily Targets" action="Edit Goal" onAction={onGoalClick} />
        <GoalList goals={goals} />
      </section>
    </div>
  );
}

function RoutinePage({
  routines,
  completed,
  progress,
  celebrate,
  onToggleRoutine,
  onCreateRoutine,
  onHistoryClick,
}: {
  routines: Routine[];
  completed: number;
  progress: number;
  celebrate: boolean;
  onToggleRoutine: (id: string) => void;
  onCreateRoutine: () => void;
  onHistoryClick: () => void;
}) {
  return (
    <div className="routineLayout">
      <section className="heroPanel stagger">
        <div>
          <p className="label">Daily routine</p>
          <h2>{completed} completed today</h2>
          <p>Complete routines to raise your consistency and unlock real weekly trends.</p>
        </div>
        <ProgressRing value={progress} />
      </section>
      <section className="panel wide stagger">
        <PanelHeader title="Your Routine" action="Create Routine" onAction={onCreateRoutine} />
        {routines.length ? (
          <div className="routinePreview">
            {routines.map((item) => (
              <RoutineItem item={item} key={item.id} onToggle={() => onToggleRoutine(item.id)} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No routine created yet."
            text="Build a routine that fits your lifestyle."
            action="Create Routine"
            onAction={onCreateRoutine}
          />
        )}
        {celebrate && <div className="celebration">Routine updated</div>}
      </section>
      <section className="panel stagger">
        <PanelHeader title="Weekly Progress" action="View History" onAction={onHistoryClick} />
        <EmptyState
          compact
          title="No weekly progress yet."
          text="Complete routines for a few days to see your trend."
        />
      </section>
    </div>
  );
}

function ProgressPage({
  measurements,
  skinLogs,
  photos,
  onAddMeasurement,
  onLogSkin,
  onAddPhoto,
}: {
  measurements: Measurement[];
  skinLogs: SkinLog[];
  photos: ProgressPhoto[];
  onAddMeasurement: () => void;
  onLogSkin: () => void;
  onAddPhoto: (photo: ProgressPhoto) => void;
}) {
  const fileInput = useRef<HTMLInputElement | null>(null);

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onAddPhoto({
          id: `photo-${Date.now()}`,
          url: reader.result,
          name: file.name,
          createdAt: new Date().toISOString(),
        });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return (
    <div className="progressLayout">
      <section className="panel wide stagger">
        <PanelHeader title="Measurements" action="Add Measurement" onAction={onAddMeasurement} />
        {measurements.length ? (
          <>
            <div className="measurementGrid">
              {measurementToCards(measurements[0]).map((item) => (
                <MeasurementCard item={item} key={item.label} />
              ))}
            </div>
            <ElegantChart empty={measurements.length < 2} />
          </>
        ) : (
          <EmptyState
            title="No measurements added yet."
            text="Add your first measurement to start tracking changes."
            action="Add Measurement"
            onAction={onAddMeasurement}
          />
        )}
      </section>
      <section className="panel stagger">
        <PanelHeader title="Skin Progress" action="Log Skin" onAction={onLogSkin} />
        {skinLogs.length ? (
          <div className="skinList">
            {skinLogToBars(skinLogs[0]).map((item) => (
              <ProgressBar key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        ) : (
          <EmptyState
            compact
            title="No skin log yet."
            text="Log your first skin check to see progress here."
            action="Log Skin"
            onAction={onLogSkin}
          />
        )}
      </section>
      <section className="panel stagger">
        <PanelHeader title="Monthly Transformation" />
        <EmptyState
          compact
          title="Monthly summary will appear after you track progress for a few weeks."
          text="Keep completing routines and adding logs to unlock this view."
        />
      </section>
      <section className="panel wide stagger">
        <PanelHeader
          title="Progress Photos"
          action={photos.length ? "Add Progress Photo" : "Add First Photo"}
          onAction={() => fileInput.current?.click()}
        />
        <input
          ref={fileInput}
          className="hiddenInput"
          type="file"
          accept="image/*"
          onChange={handlePhoto}
        />
        {photos.length ? (
          <div className="photoGrid">
            {photos.map((photo) => (
              <figure className="photoCard" key={photo.id}>
                <img src={photo.url} alt={photo.name} />
                <figcaption>{new Date(photo.createdAt).toLocaleDateString()}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No progress photos yet."
            text="Your transformation starts with your first photo."
            action="Add First Photo"
            onAction={() => fileInput.current?.click()}
          />
        )}
      </section>
    </div>
  );
}

function ExplorePage() {
  return (
    <div className="exploreLayout">
      <section className="panel wide stagger">
        <PanelHeader title="Self-improvement library" />
        <div className="sectionChips">
          {exploreSections.map((section) => (
            <button key={section} type="button">
              {section}
            </button>
          ))}
        </div>
      </section>
      <div className="libraryGrid">
        {libraryCards.map((card) => (
          <article className="libraryCard stagger" key={card.title}>
            <span>{card.section}</span>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
            <small>{card.time}</small>
          </article>
        ))}
      </div>
      <p className="safetyNote">
        Recommendations are practical and habit-focused. VantaFace does not make
        medical, diagnostic, or unrealistic transformation claims.
      </p>
    </div>
  );
}

function ProfilePage({
  goals,
  focusAreas,
  onGoalClick,
}: {
  goals: Goals;
  focusAreas: string[];
  onGoalClick: () => void;
}) {
  return (
    <div className="profileLayout">
      <section className="profileHero stagger">
        <div className="profilePhoto">VF</div>
        <div>
          <p className="label">Personal profile</p>
          <h2>VantaFace User</h2>
          <p>Joined today · 0 day streak · 0% overall consistency</p>
        </div>
      </section>
      <section className="panel stagger">
        <PanelHeader title="Personal Goals" action="Edit Goal" onAction={onGoalClick} />
        <GoalList goals={goals} />
        <div className="focusList">
          {(focusAreas.length ? focusAreas : ["No focus areas selected yet"]).map((area) => (
            <span key={area}>{area}</span>
          ))}
        </div>
      </section>
      <section className="panel stagger">
        <PanelHeader title="Settings" />
        <div className="settingsList">
          {profileSettings.map((item) => (
            <button key={item} type="button">
              {item}
              <span>›</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function DesktopNavigation({
  activeTab,
  onChange,
}: {
  activeTab: NavTab;
  onChange: (tab: NavTab) => void;
}) {
  return (
    <nav className="topNav">
      <button
        className="wordmark"
        type="button"
        onClick={() => onChange("dashboard")}
        aria-label="VantaFace home"
      >
        VantaFace
      </button>
      <div className="navPills">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab.id ? "navPill active" : "navPill"}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function BottomNavigation({
  activeTab,
  onChange,
}: {
  activeTab: NavTab;
  onChange: (tab: NavTab) => void;
}) {
  return (
    <nav className="bottomNav" aria-label="Mobile navigation">
      {tabs.map((tab) => (
        <button
          className={activeTab === tab.id ? "bottomItem active" : "bottomItem"}
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
        >
          <span />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function Header({
  activeTab,
  onGoalClick,
}: {
  activeTab: NavTab;
  onGoalClick: () => void;
}) {
  const titles: Record<NavTab, string> = {
    dashboard: "Today",
    routine: "Routine",
    progress: "Your Progress",
    analysis: "Face Analysis",
    explore: "Explore",
    profile: "Profile",
  };
  return (
    <header className="pageHeader">
      <div>
        <p className="eyebrow">VANTAFACE</p>
        <h1>{titles[activeTab]}</h1>
      </div>
      <Button onClick={onGoalClick}>Edit Goal</Button>
    </header>
  );
}

function PickerGrid({ goals, onChange }: { goals: Goals; onChange: (goals: Goals) => void }) {
  return (
    <div className="pickerGrid">
      <PickerCard
        label="Water target"
        value={`${goals.water} glasses`}
        options={range(4, 12).map((value) => ({ label: `${value} glasses`, value }))}
        onSelect={(water) => onChange({ ...goals, water })}
      />
      <PickerCard
        label="Sleep goal"
        value={`${goals.sleep} hours`}
        options={range(10, 20).map((value) => ({ label: `${value / 2} hours`, value: value / 2 }))}
        onSelect={(sleep) => onChange({ ...goals, sleep })}
      />
      <PickerCard
        label="Steps goal"
        value={`${goals.steps.toLocaleString()} steps`}
        options={range(2, 15).map((value) => ({ label: `${value * 1000} steps`, value: value * 1000 }))}
        onSelect={(steps) => onChange({ ...goals, steps })}
      />
      <PickerCard
        label="Workout frequency"
        value={`${goals.workout} days / week`}
        options={range(1, 7).map((value) => ({ label: `${value} days / week`, value }))}
        onSelect={(workout) => onChange({ ...goals, workout })}
      />
    </div>
  );
}

function PickerCard<T extends number>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: { label: string; value: T }[];
  onSelect: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={open ? "pickerCard open" : "pickerCard"}>
      <button type="button" onClick={() => setOpen((current) => !current)}>
        <span>{label}</span>
        <strong>{value}</strong>
      </button>
      {open && (
        <div className="pickerWheel">
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                onSelect(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GoalModal({
  open,
  goals,
  onClose,
  onSave,
}: {
  open: boolean;
  goals: Goals;
  onClose: () => void;
  onSave: (goals: Goals) => void;
}) {
  const [draft, setDraft] = useState(goals);
  useEffect(() => setDraft(goals), [goals, open]);
  if (!open) return null;
  return (
    <BottomSheet title="Daily Targets" action="Close" onClose={onClose}>
      <PickerGrid goals={draft} onChange={setDraft} />
      <Button onClick={() => onSave(draft)}>Save Changes</Button>
    </BottomSheet>
  );
}

function RoutineModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, tag: Category | "Hydration") => void;
}) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState<Category>("Skin");
  if (!open) return null;
  return (
    <BottomSheet title="Create Routine" action="Close" onClose={onClose}>
      <label className="field">
        <span>Routine name</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Evening skincare"
        />
      </label>
      <div className="categoryGrid">
        {categories.map((item) => (
          <button
            className={tag === item ? "choice active" : "choice"}
            key={item}
            type="button"
            onClick={() => setTag(item)}
          >
            <span>{item}</span>
            <b>{tag === item ? "✓" : ""}</b>
          </button>
        ))}
      </div>
      <Button
        onClick={() => {
          if (!title.trim()) return;
          onSave(title.trim(), tag);
          setTitle("");
          setTag("Skin");
        }}
      >
        Save Routine
      </Button>
    </BottomSheet>
  );
}

function WeeklyHistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <BottomSheet title="Weekly Progress" action="Close" onClose={onClose}>
      <EmptyState
        title="No weekly progress yet."
        text="Complete routines for a few days to see your trend."
      />
    </BottomSheet>
  );
}

function MeasurementModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (measurement: Omit<Measurement, "id" | "createdAt">) => void;
}) {
  const [draft, setDraft] = useState<Omit<Measurement, "id" | "createdAt">>({});
  if (!open) return null;
  return (
    <BottomSheet title="Add Measurement" action="Close" onClose={onClose}>
      <div className="formGrid">
        {measurementFields.map((field) => (
          <label className="field" key={field.key}>
            <span>{field.label}</span>
            <input
              inputMode="decimal"
              value={(draft[field.key] as string) ?? ""}
              onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
              placeholder={field.placeholder}
            />
          </label>
        ))}
      </div>
      <Button onClick={() => onSave(draft)}>Save Measurement</Button>
    </BottomSheet>
  );
}

function SkinModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (log: Omit<SkinLog, "id" | "createdAt">) => void;
}) {
  const [draft, setDraft] = useState<Omit<SkinLog, "id" | "createdAt">>({
    clarity: 50,
    acne: 50,
    oiliness: 50,
    dryness: 50,
    darkCircles: 50,
    overall: 50,
  });
  if (!open) return null;
  return (
    <BottomSheet title="Log Skin" action="Close" onClose={onClose}>
      <div className="rangeList">
        {skinFields.map((field) => (
          <label className="rangeField" key={field.key}>
            <span>{field.label}</span>
            <strong>{draft[field.key]}</strong>
            <input
              type="range"
              min="0"
              max="100"
              value={draft[field.key]}
              onChange={(event) =>
                setDraft({ ...draft, [field.key]: Number(event.target.value) })
              }
            />
          </label>
        ))}
      </div>
      <Button onClick={() => onSave(draft)}>Save Skin Log</Button>
    </BottomSheet>
  );
}

function BottomSheet({
  title,
  action,
  children,
  onClose,
}: {
  title: string;
  action: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modalBackdrop" role="presentation" onClick={onClose}>
      <div className="modalCard" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <PanelHeader title={title} action={action} onAction={onClose} />
        {children}
      </div>
    </div>
  );
}

function RoutineItem({ item, onToggle }: { item: Routine; onToggle: () => void }) {
  return (
    <button
      className={item.done ? "routineItem done" : "routineItem"}
      type="button"
      onClick={onToggle}
    >
      <span>
        <small>{item.tag}</small>
        {item.title}
      </span>
      <b>{item.done ? "✓" : ""}</b>
    </button>
  );
}

function SelectableRoutine({
  item,
  selected,
  onToggle,
}: {
  item: Routine;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={selected ? "routineItem selected done" : "routineItem"}
      type="button"
      onClick={onToggle}
    >
      <span>
        <small>{item.tag}</small>
        {item.title}
      </span>
      <b>{selected ? "✓" : ""}</b>
    </button>
  );
}

function StatCard({
  title,
  value,
  suffix,
}: {
  title: string;
  value: string | number;
  suffix: string;
}) {
  const display = useCountUp(Number(value));
  return (
    <section className="statCard stagger">
      <span>{title}</span>
      <strong>
        {Number.isFinite(Number(value)) ? display : value}
        <small>{suffix}</small>
      </strong>
      <p>Based on your activity</p>
    </section>
  );
}

function MeasurementCard({ item }: { item: { label: string; value: string } }) {
  return (
    <article className="measurementCard">
      <span>{item.label}</span>
      <strong>{item.value}</strong>
    </article>
  );
}

function ProgressRing({ value }: { value: number }) {
  return (
    <div className="ring" style={{ "--value": value } as CSSProperties}>
      <span>{value}%</span>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="progressBar">
      <div>
        <span>{label}</span>
        <strong>{value}/100</strong>
      </div>
      <i>
        <b style={{ width: `${value}%` }} />
      </i>
    </div>
  );
}

function ElegantChart({ empty }: { empty: boolean }) {
  if (empty) {
    return (
      <div className="chartEmpty">
        Add another measurement later to unlock historical changes.
      </div>
    );
  }
  return (
    <div className="barChart" aria-label="Historical measurement changes">
      {[48, 56, 52, 64, 72, 68, 78, 82].map((height, index) => (
        <span key={index} style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  text,
  action,
  onAction,
  compact = false,
}: {
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "emptyState compact" : "emptyState"}>
      <div className="emptyMark" />
      <h3>{title}</h3>
      <p>{text}</p>
      {action && <Button onClick={onAction}>{action}</Button>}
    </div>
  );
}

function GoalList({ goals }: { goals: Goals }) {
  const items = [
    { label: "Daily water target", value: `${goals.water} glasses` },
    { label: "Sleep target", value: `${goals.sleep} hours` },
    { label: "Step target", value: `${goals.steps.toLocaleString()} steps` },
    { label: "Workout frequency", value: `${goals.workout} days / week` },
  ];
  return (
    <div className="targetList">
      {items.map((goal) => (
        <div key={goal.label}>
          <span>{goal.label}</span>
          <strong>{goal.value}</strong>
        </div>
      ))}
    </div>
  );
}

function PanelHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="panelHeader">
      <h2>{title}</h2>
      {action && (
        <button type="button" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
}) {
  return (
    <button className={`button ${variant}`} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="stepDots" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, index) => (
        <span className={index <= current ? "active" : ""} key={index} />
      ))}
    </div>
  );
}

function usePersistentState() {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppState>;
        setState({
          ...initialState,
          ...parsed,
          goals: { ...defaultGoals, ...(parsed.goals ?? {}) },
          routines: parsed.routines ?? [],
          measurements: parsed.measurements ?? [],
          skinLogs: parsed.skinLogs ?? [],
          photos: parsed.photos ?? [],
          analyses: parsed.analyses ?? [],
        });
      }
    } catch {
      setState(initialState);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [ready, state]);

  return [state, setState] as const;
}

function useCountUp(target: number) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    let frame = 0;
    const totalFrames = 24;
    const timer = window.setInterval(() => {
      frame += 1;
      setValue(Math.round((target * frame) / totalFrames));
      if (frame >= totalFrames) window.clearInterval(timer);
    }, 20);
    return () => window.clearInterval(timer);
  }, [target]);
  return value;
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function measurementToCards(measurement: Measurement) {
  return measurementFields
    .map((field) => ({ label: field.label, value: measurement[field.key] || "Not set" }))
    .filter((item) => item.value !== "Not set");
}

function skinLogToBars(log: SkinLog) {
  return skinFields.map((field) => ({ label: field.label, value: log[field.key] }));
}

type ModalName = "goals" | "routine" | "history" | "measurement" | "skin";

const measurementFields: {
  key: keyof Omit<Measurement, "id" | "createdAt">;
  label: string;
  placeholder: string;
}[] = [
  { key: "weight", label: "Weight", placeholder: "72 kg" },
  { key: "bodyFat", label: "Body fat", placeholder: "18%" },
  { key: "waist", label: "Waist", placeholder: "82 cm" },
  { key: "chest", label: "Chest", placeholder: "101 cm" },
  { key: "arms", label: "Arms", placeholder: "35 cm" },
  { key: "neck", label: "Neck", placeholder: "39 cm" },
  { key: "shoulders", label: "Shoulders", placeholder: "118 cm" },
];

const skinFields: {
  key: keyof Omit<SkinLog, "id" | "createdAt">;
  label: string;
}[] = [
  { key: "clarity", label: "Skin clarity" },
  { key: "acne", label: "Acne" },
  { key: "oiliness", label: "Oiliness" },
  { key: "dryness", label: "Dryness" },
  { key: "darkCircles", label: "Dark circles" },
  { key: "overall", label: "Overall skin condition" },
];
