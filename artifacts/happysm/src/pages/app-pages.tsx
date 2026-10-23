import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useClerk, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, type Control } from 'react-hook-form';
import {
  getGetDashboardQueryKey, getGetHealthProfileQueryKey, getGetScheduleQueryKey,
  useGetDashboard, useGetHealthProfile, useGetSchedule, useSaveHealthProfile,
} from '@workspace/api-client-react';
import type { HealthProfileInput, InsightCategory, RoutineDay } from '@workspace/api-client-react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Check, CircleHelp,
  Clock3, Droplets, Heart, Leaf, LogOut, Menu, Moon, MoveRight, Pencil, ShieldCheck,
  Sparkles, Sprout, Sun, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';

const goalOptions = [
  ['move-more', 'Move a little more'], ['sleep-better', 'Sleep more soundly'],
  ['hydrate', 'Drink more water'], ['manage-stress', 'Make space for calm'],
  ['build-routine', 'Find a gentle routine'],
] as const;

function Brand({ testId = 'link-brand-home' }: { testId?: string }) {
  return <Link href="/" className="brand" data-testid={testId}><span className="brand-mark">h</span><span>happysm</span></Link>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const nav = [
    { href: '/dashboard', label: 'Today', icon: Sun },
    { href: '/health-profile', label: 'Your profile', icon: Heart },
    { href: '/schedule', label: 'Weekly rhythm', icon: Clock3 },
  ];
  return <div className="app-layout">
    <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
      <div className="side-top"><Brand testId="link-app-brand-home" /><button aria-label="Close menu" data-testid="button-close-navigation" className="mobile-close" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
      <div className="side-caption">YOUR SPACE</div>
      <nav className="side-nav">{nav.map(({ href, label, icon: Icon }) =>
        <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`nav-link ${loc === href ? 'active' : ''}`} data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`}>
          <Icon size={18} strokeWidth={1.7} /><span>{label}</span>{loc === href && <span className="nav-dot" />}
        </Link>)}
      </nav>
      <div className="side-note">
        <div className="note-icon"><ShieldCheck size={17} /></div>
        <p>Your information stays yours.</p>
        <span>Private by design. No judgement, ever.</span>
      </div>
      <div className="side-bottom">
        <div className="profile-chip"><div className="avatar-initial">{user?.firstName?.[0] ?? user?.username?.[0] ?? 'Y'}</div><div className="chip-text"><strong>{user?.firstName || 'Your space'}</strong><span>Personal account</span></div>
          <button className="icon-button logout" onClick={() => signOut({ redirectUrl: baseRoot() })} aria-label="Sign out" data-testid="button-sign-out"><LogOut size={17} /></button>
        </div>
      </div>
    </aside>
    {menuOpen && <button className="mobile-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" data-testid="button-dismiss-navigation" />}
    <main className="main-panel">
      <header className="topbar"><button className="mobile-menu" aria-label="Open navigation" data-testid="button-open-navigation" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="crumb">Your wellbeing <span>/</span> {nav.find((n) => n.href === loc)?.label ?? 'Today'}</div><div className="topbar-right"><span className="privacy-pill"><span /> Your private space</span></div></header>
      <div className="page-content">{children}</div>
      <footer className="app-footer"><span>happysm is a place to notice, not to judge.</span><Link href="/health-profile" data-testid="link-manage-information">Manage your information <ArrowRight size={13} /></Link></footer>
    </main>
  </div>;
}

function baseRoot() { return import.meta.env.BASE_URL || '/'; }

function LoadingPanel() {
  return <div className="loading-wrap"><Skeleton className="skeleton-title" /><Skeleton className="skeleton-wide" /><div className="skeleton-row"><Skeleton /><Skeleton /><Skeleton /></div></div>;
}
function QueryError({ retry }: { retry: () => void }) {
  return <div className="error-panel"><CircleHelp size={22} /><div><strong>We couldn't open this just now.</strong><p>Your information hasn't changed. Please try again in a moment.</p></div><Button variant="outline" onClick={retry} data-testid="button-retry-query">Try again</Button></div>;
}

export function HomePage() {
  return <div className="landing">
    <header className="landing-nav"><Brand testId="link-header-brand-home" /><nav><a href="#approach" data-testid="link-approach">Our approach</a><a href="#privacy" data-testid="link-privacy">Privacy</a><Link href="/sign-in" className="nav-signin" data-testid="link-sign-in">Sign in <ArrowRight size={15} /></Link></nav></header>
    <section className="hero">
      <div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot" /> YOUR WELLBEING, YOUR WAY</span><h1>A little more in tune<br />with <em>yourself.</em></h1><p className="hero-description">A private, gentle space to notice your everyday habits—and make small changes that feel like yours.</p>
        <div className="hero-actions"><Link href="/sign-up" className="button-primary" data-testid="link-start-check-in">Start your check-in <ArrowRight size={17} /></Link><a href="#approach" className="text-link" data-testid="link-see-how-it-works">See how it works <MoveRight size={16} /></a></div>
        <div className="hero-footnote"><ShieldCheck size={15} /> Your information is private and always in your control.</div>
      </div>
      <div className="hero-visual" aria-label="Illustration of a peaceful growing plant">
        <div className="sun-disc" /><div className="visual-rings" /><div className="plant-pot"><div className="plant-stem" /><span className="leaf-shape leaf-a" /><span className="leaf-shape leaf-b" /><span className="leaf-shape leaf-c" /><span className="leaf-shape leaf-d" /><div className="pot-body" /><div className="pot-rim" /></div>
        <div className="float-card float-top"><span className="mini-icon"><Moon size={15} /></span><span><b>Make room to rest</b><small>One small thing at a time</small></span></div>
        <div className="float-card float-bottom"><span className="mini-icon coral"><Droplets size={15} /></span><span><b>Your pace is enough</b><small>A gentle weekly rhythm</small></span></div>
        <div className="visual-label">GROW AT YOUR OWN PACE</div>
      </div>
      <div className="hero-side-note">A softer kind of self-care <span>—</span> rooted in real life.</div>
    </section>
    <section id="approach" className="approach-section">
      <div className="section-intro"><span className="eyebrow">A SMALLER, SOFTER START</span><h2>Not a life overhaul.<br /><em>A moment to notice.</em></h2><p>Happysm is built around what you tell us about your days. No labels, no pressure—just useful context for the habits you want to nurture.</p></div>
      <div className="steps-list">
        <article><span className="step-number">01</span><div className="step-icon sage"><Heart size={20} /></div><div><h3>Check in with yourself</h3><p>Share only what feels comfortable: sleep, movement, water, and what matters to you.</p></div></article>
        <article><span className="step-number">02</span><div className="step-icon peach"><Sparkles size={20} /></div><div><h3>See the little patterns</h3><p>Get educational reflections based on your own self-reported information—not a diagnosis.</p></div></article>
        <article><span className="step-number">03</span><div className="step-icon butter"><Sprout size={20} /></div><div><h3>Choose what feels doable</h3><p>A weekly rhythm offers small ideas. Keep what works, skip what doesn't.</p></div></article>
      </div>
    </section>
    <section id="privacy" className="privacy-section"><div className="privacy-orbit"><ShieldCheck size={29} /><span className="orbit-ring one" /><span className="orbit-ring two" /></div><div><span className="eyebrow">YOUR INFORMATION IS YOURS</span><h2>Care starts with<br /><em>feeling safe.</em></h2><p>Before you share any health information, we’ll explain what it’s for and ask for your consent. You can update your personal profile whenever you choose.</p><Link href="/sign-up" className="text-link" data-testid="link-create-private-space">Make your space <ArrowRight size={15} /></Link></div></section>
    <section className="closing-band"><span>There’s no behind.</span><h2>Just where you are,<br /><em>and where you’d like to go.</em></h2><Link href="/sign-up" className="button-light" data-testid="link-come-as-you-are">Come as you are <ArrowRight size={16} /></Link><div className="closing-flower" aria-hidden="true"><i /><i /><i /><i /><b /></div></section>
    <footer className="landing-footer"><Brand testId="link-footer-brand-home" /><span>A gentle companion for everyday wellbeing.</span><span>Not medical advice. Always your choice.</span></footer>
  </div>;
}

export function DashboardPage() {
  const query = useGetDashboard();
  const profileQuery = useGetHealthProfile();
  const dashboard = query.data;
  const profile = dashboard?.profile ?? profileQuery.data ?? null;
  const { user } = useUser();
  const greeting = user?.firstName ? `Hello, ${user.firstName}.` : 'A moment for you.';
  if (query.isLoading || profileQuery.isLoading) return <LoadingPanel />;
  if (query.isError) return <QueryError retry={() => { void query.refetch(); void profileQuery.refetch(); }} />;
  const hasProfile = Boolean(profile);
  return <div className="dashboard-page animate-in">
    <div className="welcome-row"><div><span className="eyebrow">A FRESH MOMENT</span><h1>{greeting}</h1><p>There’s no perfect way to feel. Let’s start with what’s here.</p></div><span className="date-tag"><Sun size={15} /> YOUR TODAY</span></div>
    {!hasProfile && <div className="first-checkin"><div className="checkin-art"><div className="checkin-circle"><Sprout size={28} /></div></div><div><span className="eyebrow">WHEN YOU’RE READY</span><h2>Your starting point is yours to choose.</h2><p>Share a little about your everyday habits to see personal reflections and a weekly rhythm. You’ll review clear consent before anything is saved.</p><Link href="/health-profile" className="button-primary" data-testid="link-set-up-profile">Set up your profile <ArrowRight size={16} /></Link></div></div>}
    {hasProfile && <div className="dashboard-grid">
      <section className="profile-overview panel">
        <div className="panel-heading"><div><span className="eyebrow">YOUR SNAPSHOT</span><h2>A few things about you</h2></div><Link href="/health-profile" className="quiet-link" data-testid="link-edit-profile"><Pencil size={14} /> Edit</Link></div>
        <div className="snapshot-metrics">
          <Metric label="Age" value={profile?.ageYears ? `${profile.ageYears} years` : 'Not shared'} icon={<Sun size={17} />} />
          {profile?.heightCm != null && <Metric label="Height" value={`${profile.heightCm} cm`} icon={<ArrowUpRight size={17} />} />}
          {profile?.weightKg != null && <Metric label="Weight" value={`${profile.weightKg} kg`} icon={<ArrowDownRight size={17} />} />}
          <Metric label="Sleep" value={profile?.sleepHours != null ? `${profile.sleepHours} hrs` : 'Not shared'} icon={<Moon size={17} />} />
          <Metric label="Water" value={profile?.waterGlasses != null ? `${profile.waterGlasses} glasses` : 'Not shared'} icon={<Droplets size={17} />} />
          <Metric label="Movement" value={formatChoice(profile?.activityLevel)} icon={<Activity size={17} />} />
          {profile?.heightCm != null && profile.weightKg != null && dashboard?.bmi != null && <Metric label="BMI" value={`${dashboard.bmi.toFixed(1)}`} icon={<Heart size={17} />} note="A height-to-weight measure, not a complete picture of health." />}
        </div>
        {profile?.goals?.length ? <div className="goals-line"><span>WHAT MATTERS TO YOU</span><div>{profile.goals.map((goal) => <span className="goal-chip" key={goal}>{goalLabel(goal)}</span>)}</div></div> : null}
      </section>
      <section className="insights-panel panel">
        <div className="panel-heading"><div><span className="eyebrow">GENTLE OBSERVATIONS</span><h2>Patterns to explore</h2></div><span className="sun-spark"><Sparkles size={17} /></span></div>
        {dashboard?.insights?.length ? <div className="insights-list">{dashboard.insights.map((insight, i) => <Insight key={`${insight.title}-${i}`} title={insight.title} detail={insight.detail} category={insight.category} index={i} />)}</div> : <div className="inline-empty"><Sprout size={19} /><p>No reflections to share just yet. Your check-in helps us offer useful context.</p></div>}
        <p className="disclaimer">{dashboard?.disclaimer || 'These educational reflections are based on information you choose to share. They are not medical advice or a diagnosis.'}</p>
      </section>
      <section className="week-preview panel">
        <div className="panel-heading"><div><span className="eyebrow">A FEW IDEAS FOR THE WEEK</span><h2>Your weekly rhythm</h2></div><Link href="/schedule" className="quiet-link" data-testid="link-see-weekly-rhythm">See all <ArrowRight size={14} /></Link></div>
        {dashboard?.schedule?.days?.length ? <div className="preview-days">{dashboard.schedule.days.slice(0, 3).map((day, i) => <DayCard key={`${day.day}-${i}`} day={day} compact={true} />)}</div> : <div className="inline-empty"><Clock3 size={18} /><p>Your weekly ideas will appear here once your profile is ready.</p></div>}
      </section>
    </div>}
    {!hasProfile && dashboard?.disclaimer && <p className="disclaimer outside-disclaimer">{dashboard.disclaimer}</p>}
  </div>;
}

function Metric({ label, value, icon, note }: { label: string; value: string; icon: ReactNode; note?: string }) {
  return <div className="metric"><span className="metric-icon">{icon}</span><span className="metric-label">{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}
function Insight({ title, detail, category, index }: { title: string; detail: string; category: InsightCategory; index: number }) {
  const Icon = category === 'sleep' ? Moon : category === 'hydration' ? Droplets : category === 'movement' ? Activity : category === 'stress' ? Leaf : Sparkles;
  return <article className="insight-item"><span className={`insight-icon tone-${category}`}><Icon size={17} /></span><div><h3>{title}</h3><p>{detail}</p></div><span className="insight-index">0{index + 1}</span></article>;
}

export function SchedulePage() {
  const query = useGetSchedule();
  if (query.isLoading) return <LoadingPanel />;
  if (query.isError) return <QueryError retry={() => { void query.refetch(); }} />;
  const days = query.data?.days ?? [];
  return <div className="schedule-page animate-in">
    <div className="welcome-row"><div><span className="eyebrow">MAKE SPACE FOR WHAT MATTERS</span><h1>Your weekly rhythm</h1><p>A handful of ideas, shaped around what you shared. Keep it flexible.</p></div><span className="date-tag"><Clock3 size={15} /> WEEK AT A GLANCE</span></div>
    {days.length ? <div className="schedule-list">{days.map((day, i) => <DayCard day={day} key={`${day.day}-${i}`} index={i} />)}</div> :
       <div className="empty-schedule"><div className="empty-schedule-art"><Sprout size={30} /></div><span className="eyebrow">A LITTLE SPACE TO BEGIN</span><h2>Your rhythm will grow from your own check-in.</h2><p>When you’re ready to share your profile, your weekly routine will appear here. No made-up plans—just ideas based on what you choose to tell us.</p><Link href="/health-profile" className="button-primary" data-testid="link-visit-profile">Visit your profile <ArrowRight size={16} /></Link></div>}
    <div className="schedule-reminder"><ShieldCheck size={17} /><p>Your routine is a set of suggestions, not a checklist. You can adapt it to your energy, time, and circumstances.</p></div>
  </div>;
}

const dayTones = ['sage', 'peach', 'butter', 'blue', 'sage', 'peach', 'butter'];
function DayCard({ day, compact = false, index = 0 }: { day: RoutineDay; compact?: boolean; index?: number }) {
  const tone = dayTones[index % dayTones.length];
  return <article className={`day-card ${tone} ${compact ? 'compact' : ''}`} data-testid={`card-routine-${day.day.toLowerCase().replaceAll(' ', '-')}`}>
    <div className="day-label"><span className="day-mark">{String(index + 1).padStart(2, '0')}</span><span>{day.day}</span></div><div className="day-content"><h3>{day.focus}</h3>{day.suggestions?.length ? <ul>{day.suggestions.map((suggestion, i) => <li key={`${i}-${suggestion}`}><Check size={14} />{suggestion}</li>)}</ul> : <p className="no-suggestions">A focus to return to whenever it feels right.</p>}</div><span className="day-leaf" aria-hidden="true"><Leaf size={compact ? 17 : 21} /></span>
  </article>;
}

type FormDraft = {
  ageYears: string; heightCm: string; weightKg: string; sleepHours: string; waterGlasses: string;
  activityLevel: 'low' | 'some' | 'active' | ''; stressLevel: 'low' | 'moderate' | 'high' | '';
  goals: string[]; consentAccepted: boolean;
};
type NullableHealthProfile = {
  ageYears: number | null;
  heightCm: number | null;
  weightKg: number | null;
  sleepHours: number | null;
  waterGlasses: number | null;
  activityLevel: 'low' | 'some' | 'active' | null;
  stressLevel: 'low' | 'moderate' | 'high' | null;
  goals: HealthProfileInput['goals'];
  consentAccepted: boolean;
  consentedAt: string | null;
};
const blankDraft: FormDraft = { ageYears: '', heightCm: '', weightKg: '', sleepHours: '', waterGlasses: '', activityLevel: '', stressLevel: '', goals: [], consentAccepted: false };
function toDraft(profile: NullableHealthProfile): FormDraft {
  return {
    ageYears: profile?.ageYears == null ? '' : String(profile.ageYears),
    heightCm: profile?.heightCm == null ? '' : String(profile.heightCm),
    weightKg: profile?.weightKg == null ? '' : String(profile.weightKg),
    sleepHours: profile?.sleepHours == null ? '' : String(profile.sleepHours),
    waterGlasses: profile?.waterGlasses == null ? '' : String(profile.waterGlasses),
    activityLevel: profile?.activityLevel ?? '', stressLevel: profile?.stressLevel ?? '',
    goals: profile?.goals ?? [], consentAccepted: false,
  };
}
function numberOrNull(value: string) { return value.trim() === '' ? null : Number(value); }
function isValidRange(value: string, min: number, max: number) {
  if (!value.trim()) return true;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
}

export function HealthProfilePage() {
  const profileQuery = useGetHealthProfile();
  const save = useSaveHealthProfile();
  const client = useQueryClient();
  const form = useForm<FormDraft>({ defaultValues: blankDraft, mode: 'onSubmit' });
  const initialized = useRef(false);
  const [saved, setSaved] = useState(false);
  const profile = profileQuery.data;
  useEffect(() => {
    if (!profileQuery.isLoading && !profileQuery.isError && !initialized.current) {
      form.reset(profile ? toDraft(profile) : blankDraft);
      initialized.current = true;
    }
  }, [profile, profileQuery.isLoading, profileQuery.isError, form]);
  const markEdited = () => {
    setSaved(false);
    form.clearErrors();
  };
  const submit = (draft: FormDraft) => {
    form.clearErrors();
    const ranges = [
      { name: 'ageYears' as const, value: draft.ageYears, min: 13, max: 120, message: 'Age must be between 13 and 120.' },
      { name: 'heightCm' as const, value: draft.heightCm, min: 80, max: 250, message: 'Height must be between 80 and 250 cm.' },
      { name: 'weightKg' as const, value: draft.weightKg, min: 20, max: 400, message: 'Weight must be between 20 and 400 kg.' },
      { name: 'sleepHours' as const, value: draft.sleepHours, min: 0, max: 24, message: 'Sleep hours must be between 0 and 24.' },
      { name: 'waterGlasses' as const, value: draft.waterGlasses, min: 0, max: 40, message: 'Water glasses must be between 0 and 40.' },
    ] as const;
    const invalid = ranges.find(({ value, min, max }) => !isValidRange(value, min, max));
    if (invalid) {
      form.setError(invalid.name, { type: 'validate', message: invalid.message });
      return;
    }
    if (!draft.consentAccepted) {
      form.setError('consentAccepted', { type: 'validate', message: 'Please read and accept the consent before saving your health information.' });
      return;
    }
    if (draft.goals.length > 5) {
      form.setError('goals', { type: 'validate', message: 'Choose up to five goals.' });
      return;
    }
    const data: HealthProfileInput = {
      ageYears: numberOrNull(draft.ageYears), heightCm: numberOrNull(draft.heightCm),
      weightKg: numberOrNull(draft.weightKg), sleepHours: numberOrNull(draft.sleepHours),
      waterGlasses: numberOrNull(draft.waterGlasses),
      activityLevel: draft.activityLevel || null, stressLevel: draft.stressLevel || null,
      goals: draft.goals as HealthProfileInput['goals'], consentAccepted: true,
    };
    save.mutate({ data }, {
      onSuccess: (response) => {
        client.setQueryData(getGetHealthProfileQueryKey(), response);
        void client.invalidateQueries({ queryKey: getGetHealthProfileQueryKey() });
        void client.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        void client.invalidateQueries({ queryKey: getGetScheduleQueryKey() });
        form.reset({ ...draft, consentAccepted: false });
        setSaved(true);
      },
    });
  };
  if (profileQuery.isLoading) return <LoadingPanel />;
  if (profileQuery.isError) return <QueryError retry={() => { void profileQuery.refetch(); }} />;
  return <div className="profile-page animate-in">
    <div className="welcome-row profile-welcome"><div><span className="eyebrow">A PROFILE THAT BELONGS TO YOU</span><h1>{profile ? 'Your health profile' : 'A gentle check-in'}</h1><p>Share only what you’re comfortable sharing. Every field is optional.</p></div><div className="profile-shield"><ShieldCheck size={19} /><span>Private & in your control</span></div></div>
    <Form {...form}>
    <form className="profile-form" onSubmit={form.handleSubmit(submit)} noValidate>
      <section className="form-section"><div className="form-section-title"><span className="section-number">01</span><div><h2>A few basics</h2><p>Just what feels useful to include.</p></div></div>
        <div className="fields-grid">
          <NumberField control={form.control} name="ageYears" label="Age" suffix="years" min={13} max={120} testId="input-age" onEdited={markEdited} />
          <NumberField control={form.control} name="heightCm" label="Height" suffix="cm" min={80} max={250} testId="input-height" onEdited={markEdited} />
          <NumberField control={form.control} name="weightKg" label="Weight" suffix="kg" min={20} max={400} testId="input-weight" onEdited={markEdited} />
        </div>
      </section>
      <section className="form-section"><div className="form-section-title"><span className="section-number">02</span><div><h2>Your everyday habits</h2><p>No right answers. This is about your real life.</p></div></div>
        <div className="fields-grid">
          <NumberField control={form.control} name="sleepHours" label="Sleep on a typical night" suffix="hours" min={0} max={24} step="0.5" testId="input-sleep-hours" onEdited={markEdited} />
          <NumberField control={form.control} name="waterGlasses" label="Water on a typical day" suffix="glasses" min={0} max={40} testId="input-water-glasses" onEdited={markEdited} />
        </div>
        <ChoiceGroup control={form.control} name="activityLevel" label="How does movement fit into your life?" items={[['low', 'Not much lately'], ['some', 'Here and there'], ['active', 'A regular part']]} onEdited={markEdited} />
        <ChoiceGroup control={form.control} name="stressLevel" label="How has your stress felt recently?" items={[['low', 'Mostly manageable'], ['moderate', 'Up and down'], ['high', 'A lot to carry']]} onEdited={markEdited} />
      </section>
      <section className="form-section goals-section"><div className="form-section-title"><span className="section-number">03</span><div><h2>What would you like to nurture?</h2><p>Pick any that feel like you. You can change these later.</p></div></div>
        <FormField control={form.control} name="goals" render={({ field }) => <FormItem>
          <FormControl><div className="goal-options">{goalOptions.map(([value, label]) => {
            const checked = field.value.includes(value);
            return <button type="button" key={value} className={`goal-option ${checked ? 'selected' : ''}`} aria-pressed={checked} onClick={() => { markEdited(); field.onChange(checked ? field.value.filter((goal) => goal !== value) : [...field.value, value]); }} data-testid={`toggle-goal-${value}`}><span className="goal-check">{checked && <Check size={13} />}</span>{label}</button>;
          })}</div></FormControl><FormMessage data-testid="error-profile-goals" />
        </FormItem>} />
      </section>
      <section className="consent-card"><div className="consent-heading"><ShieldCheck size={20} /><h2>Before you save</h2></div><p>Happysm uses the information you choose to share to show educational reflections and routine suggestions. This is not medical advice, a diagnosis, or a substitute for care from a health professional. Your information stays associated with your account and you can update it any time.</p>
        <FormField control={form.control} name="consentAccepted" render={({ field }) => <FormItem>
          <label className="consent-check"><FormControl><Checkbox checked={field.value} onCheckedChange={(checked) => { markEdited(); field.onChange(checked === true); }} data-testid="checkbox-health-consent" /></FormControl><span>I understand and consent to saving the health information I’ve chosen to share.</span></label>
          <FormMessage data-testid="error-health-consent" />
        </FormItem>} />
      </section>
      {save.isError && <p className="form-error" role="alert">We couldn’t save your check-in. Your information is unchanged—please try again.</p>}
      {saved && <p className="form-success" role="status"><Check size={16} /> Your profile is saved. You can change it whenever you like.</p>}
      <div className="form-submit-row"><span><ShieldCheck size={14} /> Nothing is sent until you choose to save.</span><Button type="submit" className="button-primary" disabled={save.isPending} data-testid="button-save-profile">{save.isPending ? 'Saving your profile…' : profile ? 'Save changes' : 'Save my check-in'} <ArrowRight size={16} /></Button></div>
    </form>
    </Form>
  </div>;
}

type NumericFieldName = 'ageYears' | 'heightCm' | 'weightKg' | 'sleepHours' | 'waterGlasses';
function NumberField({ control, name, label, suffix, min, max, step = '1', testId, onEdited }: { control: Control<FormDraft>; name: NumericFieldName; label: string; suffix: string; min: number; max: number; step?: string; testId: string; onEdited: () => void }) {
  return <FormField control={control} name={name} render={({ field }) => <FormItem className="number-field">
    <FormLabel className="number-field-label">{label}</FormLabel>
    <div className="input-with-suffix"><FormControl><Input {...field} type="number" inputMode="decimal" min={min} max={max} step={step} placeholder="Optional" onChange={(event) => { onEdited(); field.onChange(event.target.value); }} data-testid={testId} /></FormControl><small>{suffix}</small></div>
    <FormMessage data-testid={`error-${testId.replace('input-', '')}`} />
  </FormItem>} />;
}
type ChoiceFieldName = 'activityLevel' | 'stressLevel';
function ChoiceGroup({ control, name, label, items, onEdited }: { control: Control<FormDraft>; name: ChoiceFieldName; label: string; items: readonly (readonly [string, string])[]; onEdited: () => void }) {
  const identifier = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/-$/, '');
  return <FormField control={control} name={name} render={({ field }) => <FormItem className="choice-field-item">
    <fieldset className="choice-group"><legend>{label}</legend><div className="choice-row">{items.map(([key, text]) => <button type="button" key={key} data-testid={`choice-${identifier}-${key}`} className={`choice-pill ${field.value === key ? 'active' : ''}`} onClick={() => { onEdited(); field.onChange(field.value === key ? '' : key); }} aria-pressed={field.value === key}>{text}</button>)}</div><FormMessage data-testid={`error-${name}`} /></fieldset>
  </FormItem>} />;
}

function formatChoice(value?: string | null) {
  if (!value) return 'Not shared';
  return value === 'low' ? 'A little' : value === 'some' ? 'Some' : value === 'active' ? 'Often' : value === 'moderate' ? 'Up and down' : value === 'high' ? 'A lot' : value;
}
function goalLabel(value: string) {
  return goalOptions.find(([key]) => key === value)?.[1] ?? value;
}
