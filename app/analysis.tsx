"use client";

import type { ChangeEvent, CSSProperties, DragEvent } from "react";
import { useEffect, useRef, useState } from "react";

type Routine = {
  id: string;
  title: string;
  tag: string;
  done: boolean;
};

type Goals = {
  water: number;
  sleep: number;
  steps: number;
  workout: number;
};

type ProgressPhoto = {
  id: string;
  url: string;
  name: string;
  createdAt: string;
};

type ScorePart = {
  label: string;
  points: number;
  max: number;
};

export type AnalysisResult = {
  id: string;
  imageUrl: string;
  imageName: string;
  createdAt: string;
  score: number;
  faceShape: "Oval" | "Round" | "Square" | "Diamond" | "Heart" | "Oblong" | "Triangle";
  faceShapeSuggestions: string[];
  hairType: string;
  hairVolume: string;
  hairlineNote: string;
  recommendedStyles: string[];
  hairCare: string[];
  skinStatus: string;
  skinNotes: {
    clarity: string;
    texture: string;
    oilinessDryness: string;
    darkCircles: string;
    acneVisibility: string;
    focus: string;
  };
  grooming: {
    label: string;
    status: "Excellent" | "Good" | "Needs work" | "Not visible";
    score: number;
  }[];
  jawlineNote: string;
  recommendations: string[];
  improvementPlan: {
    today: string[];
    thisWeek: string[];
    thisMonth: string[];
  };
  scoreBreakdown: ScorePart[];
};

type AnalysisInput = {
  imageUrl: string;
  imageName: string;
  routines: Routine[];
  goals: Goals;
  photos: ProgressPhoto[];
  history: AnalysisResult[];
};

export async function analyzeUserPhoto(input: AnalysisInput): Promise<AnalysisResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 720));

  const completed = input.routines.filter((routine) => routine.done).length;
  const routineConsistency = input.routines.length
    ? Math.round((completed / input.routines.length) * 25)
    : 0;
  const sleepHydration = Math.min(15, Math.round((input.goals.water / 12) * 7 + (input.goals.sleep / 10) * 8));
  const workoutPosture = Math.min(
    15,
    Math.round(
      input.routines.filter((routine) => /fitness|posture|workout/i.test(`${routine.tag} ${routine.title}`)).length * 3.5,
    ),
  );
  const tracking = Math.min(15, input.photos.length * 4 + input.history.length * 5 + 6);
  const skinGrooming = 16;
  const styleGrooming = 8;
  const scoreBreakdown: ScorePart[] = [
    { label: "Routine consistency", points: routineConsistency, max: 25 },
    { label: "Skin and grooming appearance", points: skinGrooming, max: 20 },
    { label: "Sleep and hydration targets", points: sleepHydration, max: 15 },
    { label: "Workout and posture routines", points: workoutPosture, max: 15 },
    { label: "Progress tracking consistency", points: tracking, max: 15 },
    { label: "Style and grooming improvement", points: styleGrooming, max: 10 },
  ];
  const total = scoreBreakdown.reduce((sum, part) => sum + part.points, 0);
  const score = Math.max(45, Math.min(92, total + 10));

  return {
    id: `analysis-${Date.now()}`,
    imageUrl: input.imageUrl,
    imageName: input.imageName,
    createdAt: new Date().toISOString(),
    score,
    faceShape: "Oval",
    faceShapeSuggestions: [
      "Most hairstyles can work well with this balance.",
      "Medium volume on top can improve structure in photos.",
      "Avoid covering too much of the forehead when tracking progress.",
    ],
    hairType: "Wavy",
    hairVolume: "Medium",
    hairlineNote: "Hairline detail is lighting-dependent in this photo, so keep future progress photos evenly lit.",
    recommendedStyles: ["Textured crop", "Medium volume side part", "Natural fringe with clean sides"],
    hairCare: ["Use a light conditioner consistently.", "Avoid heavy product buildup.", "Take future photos after styling for fair comparison."],
    skinStatus: "Balanced",
    skinNotes: {
      clarity: "Skin clarity looks fairly balanced in this photo.",
      texture: "Minor texture can look stronger under harsh light; use consistent lighting for tracking.",
      oilinessDryness: "Oiliness or dryness is not strongly visible here.",
      darkCircles: "Under-eye shadows appear lighting-sensitive; sleep and photo angle can affect this.",
      acneVisibility: "No diagnostic claim is made from this preview. Visible texture can be tracked over time.",
      focus: "Focus on hydration, gentle cleansing, night routine, and consistent progress photos.",
    },
    grooming: [
      { label: "Hair", status: "Good", score: 78 },
      { label: "Skin", status: "Good", score: 72 },
      { label: "Beard / Clean shave", status: "Not visible", score: 0 },
      { label: "Eyebrows", status: "Good", score: 70 },
      { label: "Lips", status: "Good", score: 74 },
      { label: "Posture", status: "Needs work", score: 58 },
      { label: "Style", status: "Not visible", score: 0 },
      { label: "Photo lighting", status: "Needs work", score: 60 },
    ],
    jawlineNote: "Facial structure can change a lot with angle and lighting. A straight-on photo with natural light gives a cleaner comparison.",
    recommendations: [
      "Use the same lighting and angle for every progress photo.",
      "Keep hair sides cleaner if you want sharper face framing.",
      "Track sleep, water, workouts and grooming together so the score can improve through actions.",
      "Add a weekly progress photo after completing routines for a fair trend.",
    ],
    improvementPlan: {
      today: ["Drink enough water", "Complete night skincare", "Take a progress photo in natural light"],
      thisWeek: ["Maintain haircut and grooming", "Sleep 7–8 hours consistently", "Complete workouts 3 times"],
      thisMonth: ["Compare progress photos", "Improve consistency score", "Update VantaScore with a new analysis"],
    },
    scoreBreakdown,
  };
}

export function AnalysisPage({
  analyses,
  routines,
  goals,
  photos,
  onSaveAnalysis,
}: {
  analyses: AnalysisResult[];
  routines: Routine[];
  goals: Goals;
  photos: ProgressPhoto[];
  onSaveAnalysis: (analysis: AnalysisResult) => void;
}) {
  const [photo, setPhoto] = useState<{ url: string; name: string } | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(analyses[0] ?? null);
  const [busy, setBusy] = useState(false);

  async function runAnalysis() {
    if (!photo || busy) return;
    setBusy(true);
    const next = await analyzeUserPhoto({
      imageUrl: photo.url,
      imageName: photo.name,
      routines,
      goals,
      photos,
      history: analyses,
    });
    setResult(next);
    onSaveAnalysis(next);
    setBusy(false);
  }

  return (
    <div className="analysisLayout">
      <section className="analysisHero stagger">
        <div>
          <p className="label">Analysis Preview</p>
          <h2>Face Analysis</h2>
          <p>Upload a clear photo and get your personalized VantaFace breakdown.</p>
          <small>
            VantaScore measures your visible progress and consistency — not your worth or attractiveness.
          </small>
        </div>
        <PhotoUploadCard
          photo={photo}
          busy={busy}
          onPhoto={setPhoto}
          onRemove={() => {
            setPhoto(null);
            setResult(analyses[0] ?? null);
          }}
          onAnalyze={runAnalysis}
        />
      </section>

      {result ? (
        <div className="analysisGrid">
          <AnalysisScoreRing analysis={result} />
          <FaceShapeCard analysis={result} />
          <HairAnalysisCard analysis={result} />
          <SkinAnalysisCard analysis={result} />
          <GroomingBreakdownCard analysis={result} />
          <ImprovementPlanCard analysis={result} />
          <ScoreHistoryChart analyses={mergeHistory(result, analyses)} />
        </div>
      ) : (
        <AnalysisEmptyState />
      )}
    </div>
  );
}

function PhotoUploadCard({
  photo,
  busy,
  onPhoto,
  onRemove,
  onAnalyze,
}: {
  photo: { url: string; name: string } | null;
  busy: boolean;
  onPhoto: (photo: { url: string; name: string }) => void;
  onRemove: () => void;
  onAnalyze: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [active, setActive] = useState(false);

  function loadFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onPhoto({ url: reader.result, name: file.name });
    };
    reader.readAsDataURL(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    loadFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setActive(false);
    loadFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div
      className={active ? "uploadCard dropActive" : "uploadCard"}
      onDragOver={(event) => {
        event.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={handleDrop}
    >
      <input ref={inputRef} className="hiddenInput" type="file" accept="image/*" onChange={handleChange} />
      {photo ? (
        <div className="uploadPreview">
          <img src={photo.url} alt="Selected progress preview" />
          <div>
            <strong>{photo.name}</strong>
            <span>Ready for Analysis Preview</span>
          </div>
        </div>
      ) : (
        <button className="uploadEmpty" type="button" onClick={() => inputRef.current?.click()}>
          <span>Upload photo</span>
          <strong>Drag & drop on desktop or tap to upload</strong>
        </button>
      )}
      <p>Your photos stay private and are only used for your personal progress tracking.</p>
      <div className="uploadActions">
        {photo && (
          <button className="button ghost" type="button" onClick={onRemove}>
            Remove photo
          </button>
        )}
        <button className="button primary" type="button" onClick={photo ? onAnalyze : () => inputRef.current?.click()} disabled={busy}>
          {busy ? "Analyzing..." : photo ? "Analyze" : "Choose Photo"}
        </button>
      </div>
    </div>
  );
}

function AnalysisScoreRing({ analysis }: { analysis: AnalysisResult }) {
  return (
    <section className="panel scorePanel stagger">
      <div className="analysisScoreRing" style={{ "--score": analysis.score } as CSSProperties}>
        <span>{analysis.score}</span>
        <small>/ 100</small>
      </div>
      <div>
        <p className="label">Current VantaScore</p>
        <h2>{analysis.score} / 100</h2>
        <p>
          Your VantaScore improves as your routine consistency, progress photos, sleep,
          hydration, workouts and grooming habits improve.
        </p>
      </div>
      <div className="scoreBreakdown">
        {analysis.scoreBreakdown.map((part) => (
          <div key={part.label}>
            <span>{part.label}</span>
            <strong>
              {part.points}/{part.max}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaceShapeCard({ analysis }: { analysis: AnalysisResult }) {
  return (
    <section className="analysisCard stagger">
      <p className="label">Face Shape</p>
      <h3>Your face shape appears closest to {analysis.faceShape}.</h3>
      <p>{analysis.jawlineNote}</p>
      <ul>{analysis.faceShapeSuggestions.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}

function HairAnalysisCard({ analysis }: { analysis: AnalysisResult }) {
  return (
    <section className="analysisCard stagger">
      <p className="label">Hair Analysis</p>
      <div className="analysisMeta">
        <span>{analysis.hairType}</span>
        <span>{analysis.hairVolume} volume</span>
      </div>
      <p>{analysis.hairlineNote}</p>
      <h4>Recommended styles</h4>
      <ul>{analysis.recommendedStyles.map((item) => <li key={item}>{item}</li>)}</ul>
      <h4>Care suggestions</h4>
      <ul>{analysis.hairCare.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}

function SkinAnalysisCard({ analysis }: { analysis: AnalysisResult }) {
  const notes = [
    ["Skin clarity", analysis.skinNotes.clarity],
    ["Texture", analysis.skinNotes.texture],
    ["Oiliness / dryness", analysis.skinNotes.oilinessDryness],
    ["Dark circles", analysis.skinNotes.darkCircles],
    ["Breakouts", analysis.skinNotes.acneVisibility],
    ["Skincare focus", analysis.skinNotes.focus],
  ];
  return (
    <section className="analysisCard stagger">
      <p className="label">Skin Analysis</p>
      <h3>{analysis.skinStatus}</h3>
      <div className="noteList">
        {notes.map(([label, text]) => (
          <div key={label}>
            <span>{label}</span>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function GroomingBreakdownCard({ analysis }: { analysis: AnalysisResult }) {
  return (
    <section className="analysisCard wide stagger">
      <p className="label">Grooming Breakdown</p>
      <div className="breakdownGrid">
        {analysis.grooming.map((item) => (
          <div className="breakdownItem" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.status}</strong>
            {item.score > 0 && <i><b style={{ width: `${item.score}%` }} /></i>}
          </div>
        ))}
      </div>
    </section>
  );
}

function ImprovementPlanCard({ analysis }: { analysis: AnalysisResult }) {
  const groups = [
    ["Today", analysis.improvementPlan.today],
    ["This Week", analysis.improvementPlan.thisWeek],
    ["This Month", analysis.improvementPlan.thisMonth],
  ] as const;
  return (
    <section className="analysisCard wide stagger">
      <p className="label">Improvement Plan</p>
      <div className="planColumns">
        {groups.map(([title, items]) => (
          <div key={title}>
            <h3>{title}</h3>
            <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="recommendationStrip">
        {analysis.recommendations.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  );
}

function ScoreHistoryChart({ analyses }: { analyses: AnalysisResult[] }) {
  if (!analyses.length) {
    return (
      <section className="analysisCard wide stagger">
        <AnalysisEmptyState compact />
      </section>
    );
  }
  const ordered = [...analyses].reverse().slice(-6);
  const max = Math.max(100, ...ordered.map((item) => item.score));
  return (
    <section className="analysisCard wide stagger">
      <p className="label">Progress Score History</p>
      <div className="scoreHistory">
        {ordered.map((item, index) => (
          <div key={item.id}>
            <span style={{ height: `${(item.score / max) * 100}%` }} />
            <strong>{item.score}</strong>
            <small>Week {index + 1}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function AnalysisEmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "analysisEmpty compact" : "analysisEmpty stagger"}>
      <div className="emptyMark" />
      <h3>No score history yet</h3>
      <p>Upload your first photo to start tracking your transformation.</p>
    </section>
  );
}

function mergeHistory(current: AnalysisResult, analyses: AnalysisResult[]) {
  const exists = analyses.some((item) => item.id === current.id);
  return exists ? analyses : [current, ...analyses];
}
