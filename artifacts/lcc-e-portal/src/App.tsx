import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  useCreateSupportTicket,
  useGetCurrentUser,
  useGetDashboard,
  useGetFinance,
  useListAnnouncements,
  useListCourses,
  useListDocuments,
  useListResults,
  useLogin,
  useLogout,
  useRegisterCourse,
  useVerifyDocument,
  getGetCurrentUserQueryKey,
  getListCoursesQueryKey,
  getVerifyDocumentQueryKey,
  type Announcement,
  type Course,
  type Document as LccDocument,
  type FinanceSummary,
  type Result,
  type SupportTicketInputCategory,
  type User,
} from '@workspace/api-client-react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Menu,
  Printer,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  TrendingUp,
  UserRound,
  WalletCards,
  X,
  Building2,
  CalendarClock,
  ClipboardCheck,
  Database,
  FileChartColumn,
  ListChecks,
  ScrollText,
  Settings,
  SlidersHorizontal,
  UserCog,
  Users,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import lccLogo from '../../../.conversation/attached_assets/lcc-transparent-logo-bOg0OHhF_1789846258578.png';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const fallbackUser: User = {
  id: 'guest',
  name: 'LCC Community',
  email: '',
  role: 'student',
  identifier: '—',
  avatarInitials: 'LC',
};

type PortalRole = User['role'];
type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const roleLabels: Record<PortalRole, string> = {
  student: 'Student Portal',
  staff: 'Staff / Faculty Portal',
  admin: 'Admin Portal',
  super_admin: 'Super Admin',
};

const roleDescriptions: Record<PortalRole, string> = {
  student: 'Your classes, progress, and college life',
  staff: 'Teaching, attendance, and student records',
  admin: 'Academic operations and college administration',
  super_admin: 'Full system control and governance',
};

const roleNavItems: Record<PortalRole, NavItem[]> = {
  student: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/courses', label: 'Course registration', icon: BookOpen },
    { href: '/student/my-courses', label: 'My courses', icon: ClipboardList },
    { href: '/student/class-schedule', label: 'Class schedule', icon: CalendarDays },
    { href: '/results', label: 'Grades / results', icon: GraduationCap },
    { href: '/student/transcript', label: 'Transcript', icon: FileChartColumn },
    { href: '/finance', label: 'Fees & payments', icon: WalletCards },
    { href: '/student/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/student/assignments', label: 'Assignments', icon: ListChecks },
    { href: '/announcements', label: 'Announcements', icon: Bell },
    { href: '/student/notifications', label: 'Notifications', icon: Bell },
    { href: '/student/profile', label: 'Student profile', icon: UserRound },
    { href: '/documents', label: 'Download documents', icon: FileText },
  ],
  staff: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff/assigned-courses', label: 'Assigned courses', icon: BookOpen },
    { href: '/staff/class-lists', label: 'Class lists', icon: Users },
    { href: '/staff/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/staff/grade-submission', label: 'Grade submission', icon: GraduationCap },
    { href: '/staff/course-materials', label: 'Course materials', icon: FileText },
    { href: '/staff/student-records', label: 'Student records', icon: UserRound },
    { href: '/announcements', label: 'Announcements', icon: Bell },
  ],
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/staff', label: 'Staff', icon: UserRound },
    { href: '/admin/departments', label: 'Departments', icon: Building2 },
    { href: '/admin/programs', label: 'Programs', icon: GraduationCap },
    { href: '/admin/courses', label: 'Courses', icon: BookOpen },
    { href: '/admin/academic-periods', label: 'Academic years / semesters', icon: CalendarClock },
    { href: '/admin/registration', label: 'Registration', icon: ClipboardList },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/results', label: 'Results', icon: FileChartColumn },
    { href: '/admin/reports', label: 'Reports', icon: TrendingUp },
    { href: '/announcements', label: 'Announcements', icon: Bell },
  ],
  super_admin: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/staff', label: 'Staff', icon: UserRound },
    { href: '/admin/departments', label: 'Departments', icon: Building2 },
    { href: '/admin/programs', label: 'Programs', icon: GraduationCap },
    { href: '/admin/courses', label: 'Courses', icon: BookOpen },
    { href: '/admin/academic-periods', label: 'Academic years / semesters', icon: CalendarClock },
    { href: '/admin/registration', label: 'Registration', icon: ClipboardList },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/results', label: 'Results', icon: FileChartColumn },
    { href: '/admin/reports', label: 'Reports', icon: TrendingUp },
    { href: '/super-admin/users', label: 'User / role management', icon: UserCog },
    { href: '/super-admin/settings', label: 'System settings', icon: Settings },
    { href: '/super-admin/permissions', label: 'Permissions', icon: SlidersHorizontal },
    { href: '/super-admin/audit-logs', label: 'Audit logs', icon: ScrollText },
    { href: '/super-admin/system', label: 'Database / system management', icon: Database },
    { href: '/announcements', label: 'Announcements', icon: Bell },
  ],
};

const formatCurrency = (amount?: number) =>
  typeof amount === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    : '—';

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const titleCase = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" data-testid="brand-lockup">
      <img src={lccLogo} alt="Liberia Christian College" className={compact ? 'h-9 w-9 object-contain' : 'h-12 w-12 object-contain'} data-testid="img-lcc-logo" />
      {!compact && (
        <div className="min-w-0">
          <div className="display-font text-[15px] font-bold leading-none text-sidebar-foreground">Liberia Christian</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/65">College E-Portal</div>
        </div>
      )}
    </div>
  );
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} aria-hidden="true" />;
}

function QueryState({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3" data-testid="state-loading">
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-20 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-5 py-8 text-center" data-testid="state-error">
        <CircleHelp className="mx-auto mb-3 h-8 w-8 text-destructive" />
        <h3 className="display-font text-lg font-semibold">We could not load this yet</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Please check your connection and try again. Your portal data is safe.</p>
        {onRetry && <button onClick={onRetry} className="focus-ring mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground interactive" data-testid="button-retry">Try again</button>}
      </div>
    );
  }
  if (empty) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-5 py-12 text-center" data-testid="state-empty">
        <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
        <h3 className="display-font text-lg font-semibold">Nothing here yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">When there is something to show, it will appear in this space.</p>
      </div>
    );
  }
  return null;
}

function Sidebar({ user, onLogout, onClose }: { user: User; onLogout: () => void; onClose?: () => void }) {
  const [location] = useLocation();
  const visibleNavItems = roleNavItems[user.role] ?? roleNavItems.student;
  return (
    <aside className="flex h-full w-[264px] shrink-0 flex-col bg-sidebar px-4 py-5 text-sidebar-foreground" data-testid="sidebar">
      <div className="px-3 pb-7"><LogoLockup /></div>
      <div className="mb-4 rounded-xl bg-sidebar-accent/60 px-3 py-3" data-testid="card-role-context">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-primary">{roleLabels[user.role]}</p>
        <p className="mt-1 text-xs leading-5 text-sidebar-foreground/60">{roleDescriptions[user.role]}</p>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1" aria-label={`${roleLabels[user.role]} navigation`}>
        {visibleNavItems.map((item) => {
          const active = location === item.href;
          const Icon = item.icon ?? LayoutDashboard;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' : 'text-sidebar-foreground/68 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
              data-testid={`link-nav-${item.label.toLowerCase()}`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
              {(item.label === 'Announcements' || item.label === 'Notifications') && <span className="ml-auto h-2 w-2 rounded-full bg-sidebar-primary" aria-label="Unread updates" data-testid={`indicator-unread-${item.label.toLowerCase().replaceAll(' ', '-')}`} />}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-2 pt-8">
        <Link href="/support" onClick={onClose} className="focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-sidebar-foreground/68 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" data-testid="link-nav-support">
          <Headphones className="h-[18px] w-[18px]" /><span>Support desk</span>
        </Link>
        <Link href="/verify" onClick={onClose} className="focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-sidebar-foreground/68 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" data-testid="link-nav-verify">
          <ShieldCheck className="h-[18px] w-[18px]" /><span>Verify a document</span>
        </Link>
        <div className="my-4 h-px bg-sidebar-border" />
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/60 p-3" data-testid="card-sidebar-user">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground" data-testid="avatar-sidebar">{user.avatarInitials || 'LC'}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-[11px] text-sidebar-foreground/55">{titleCase(user.role)}</p>
          </div>
          <button onClick={onLogout} aria-label="Sign out" className="focus-ring rounded-lg p-2 text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground" data-testid="button-logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const currentUserQuery = useGetCurrentUser();
  const logout = useLogout();
  const user = currentUserQuery.data ?? fallbackUser;

  const handleLogout = () => {
    logout.mutate(undefined, { onSettled: () => setLocation('/') });
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (search.trim()) setLocation(`/announcements?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="portal-shell flex min-h-[100dvh] w-full text-foreground">
      <div className={`fixed inset-0 z-40 bg-primary/30 backdrop-blur-sm transition-opacity md:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setMobileOpen(false)} aria-hidden="true" />
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform md:relative md:z-0 md:flex ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar user={user} onLogout={handleLogout} onClose={() => setMobileOpen(false)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl sm:px-6 lg:px-10" data-testid="topbar">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="focus-ring rounded-lg p-2 md:hidden" aria-label="Open menu" data-testid="button-open-menu"><Menu className="h-5 w-5" /></button>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><span className="h-2 w-2 rounded-full bg-secondary-foreground" /><span>Monrovia campus</span></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <form onSubmit={submitSearch} className="hidden items-center rounded-xl border border-input bg-card px-3 py-2 sm:flex" data-testid="form-global-search">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search announcements" className="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 lg:w-44" aria-label="Search announcements" data-testid="input-global-search" />
            </form>
            <Link href="/announcements" className="focus-ring relative rounded-xl border border-transparent p-2.5 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground" aria-label="Open announcements" data-testid="link-topbar-announcements">
              <Bell className="h-[18px] w-[18px]" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
            </Link>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="flex items-center gap-2" data-testid="topbar-user">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">{user.avatarInitials || 'LC'}</div>
              <div className="hidden leading-tight lg:block"><p className="text-sm font-semibold">{user.name}</p><p className="text-[11px] text-muted-foreground">{user.identifier}</p></div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
            </div>
          </div>
        </header>
        <main className="paper-grid min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="eyebrow">{eyebrow}</p><h1 className="display-font mt-2 text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl" data-testid="heading-page">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>
      {action}
    </div>
  );
}

function DashboardPage() {
  const dashboardQuery = useGetDashboard();
  const userQuery = useGetCurrentUser();
  const dashboard = dashboardQuery.data;
  const metrics = dashboard?.metrics ?? [];
  return (
    <div className="page-in mx-auto max-w-[1440px]" data-testid="page-dashboard">
      <div className="mb-8 grid gap-6 overflow-hidden rounded-[1.5rem] bg-primary p-6 text-primary-foreground shadow-lg sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
        <div className="relative z-10">
          <p className="eyebrow text-primary-foreground/60">Liberia Christian College · {dashboard?.currentSemester || 'Academic year'} · {titleCase(dashboard?.role || userQuery.data?.role || 'student')}</p>
          <h1 className="display-font mt-3 max-w-2xl text-3xl font-bold tracking-[-0.045em] sm:text-5xl" data-testid="text-dashboard-greeting">{dashboard?.greeting || `Welcome back, ${userQuery.data?.name?.split(' ')[0] || 'there'}.`}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-primary-foreground/68">One clear place for your classes, results, finances, and the next step in your LCC journey.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/courses" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-accent-foreground interactive" data-testid="link-dashboard-courses">View my courses <ArrowRight className="h-4 w-4" /></Link><Link href="/announcements" className="focus-ring inline-flex min-h-11 items-center rounded-xl border border-primary-foreground/20 px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10" data-testid="link-dashboard-announcements">Read announcements</Link></div>
        </div>
        <div className="relative hidden min-w-[190px] items-end justify-end lg:flex"><div className="absolute right-8 top-5 h-40 w-40 rounded-full border border-accent/30" /><div className="absolute right-0 top-14 h-56 w-56 rounded-full border border-primary-foreground/10" /><div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-accent/50 bg-accent/10"><Sparkles className="h-8 w-8 text-accent" /></div></div>
      </div>
      <QueryState loading={dashboardQuery.isLoading} error={!!dashboardQuery.error} onRetry={() => void dashboardQuery.refetch()} />
      {!dashboardQuery.isLoading && !dashboardQuery.error && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.length ? metrics.map((metric, index) => <div key={`${metric.label}-${index}`} className="interactive rounded-2xl border border-border bg-card p-5 shadow-xs" data-testid={`card-metric-${index}`}><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-muted-foreground">{metric.label}</p><TrendingUp className="h-4 w-4 text-secondary-foreground" /></div><p className="display-font mt-4 text-3xl font-bold tracking-[-0.04em]" data-testid={`text-metric-value-${index}`}>{metric.value}</p><p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p></div>) : <div className="sm:col-span-2 xl:col-span-4"><QueryState empty /></div>}
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6" data-testid="section-upcoming">
              <div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">Keep moving</p><h2 className="display-font mt-1 text-xl font-bold">Up next</h2></div><CalendarDays className="h-5 w-5 text-secondary-foreground" /></div>
              <div className="space-y-1">{dashboard?.upcoming?.length ? dashboard.upcoming.map((item, index) => <div className="flex gap-4 rounded-xl px-2 py-3 hover:bg-muted/60" key={`${item.title}-${index}`} data-testid={`row-upcoming-${index}`}><div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"><CalendarDays className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="font-semibold">{item.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p></div><p className="shrink-0 text-xs font-semibold text-muted-foreground">{item.time}</p></div>) : <QueryState empty />}</div>
            </section>
            <section className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6" data-testid="section-progress">
              <div className="flex items-start justify-between"><div><p className="eyebrow">Your momentum</p><h2 className="display-font mt-1 text-xl font-bold">Semester progress</h2></div><GraduationCap className="h-5 w-5 text-secondary-foreground" /></div>
              <div className="mt-8 flex items-end justify-between"><span className="display-font text-5xl font-bold tracking-[-0.05em]" data-testid="text-progress">{dashboard?.progress ?? 0}<span className="text-2xl text-muted-foreground">%</span></span><span className="text-xs font-medium text-muted-foreground">completed</span></div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-secondary-foreground transition-all duration-700" style={{ width: `${Math.min(100, dashboard?.progress ?? 0)}%` }} /></div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">Small, consistent steps add up. Check your next class and keep your academic record current.</p>
            </section>
          </div>
          <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6" data-testid="section-activity">
            <div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">Recent record</p><h2 className="display-font mt-1 text-xl font-bold">Activity</h2></div><ClipboardList className="h-5 w-5 text-secondary-foreground" /></div>
            <div className="grid gap-1 md:grid-cols-2">{dashboard?.activity?.length ? dashboard.activity.map((item, index) => <div className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-muted/60" key={`${item.title}-${index}`} data-testid={`row-activity-${index}`}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-secondary-foreground"><Check className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.title}</p><p className="truncate text-xs text-muted-foreground">{item.detail}</p></div><time className="shrink-0 text-[11px] text-muted-foreground">{item.timestamp}</time></div>) : <div className="md:col-span-2"><QueryState empty /></div>}</div>
          </section>
        </>
      )}
    </div>
  );
}

function CoursesPage() {
  const coursesQuery = useListCourses();
  const registerCourse = useRegisterCourse();
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'registered'>('all');
  const courses = coursesQuery.data ?? [];
  const visible = useMemo(() => courses.filter((course) => (filter === 'all' || course.status === filter) && `${course.code} ${course.title} ${course.instructor}`.toLowerCase().includes(search.toLowerCase())), [courses, filter, search]);
  const handleRegister = (course: Course) => {
    registerCourse.mutate({ courseId: course.id }, { onSuccess: () => void client.invalidateQueries({ queryKey: getListCoursesQueryKey() }) });
  };
  return (
    <div className="page-in mx-auto max-w-[1440px]" data-testid="page-courses">
      <PageHeading eyebrow="Academic record" title="Courses" description="Build a clear view of what you are taking, what is available, and where you need to be." action={<div className="rounded-xl bg-secondary px-4 py-3 text-right"><p className="text-xs font-semibold text-secondary-foreground">Current load</p><p className="display-font text-xl font-bold">{courses.filter((course) => course.status === 'registered').reduce((sum, course) => sum + course.credits, 0)} credits</p></div>} />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-1 rounded-xl bg-muted p-1">{(['all', 'available', 'registered'] as const).map((value) => <button key={value} onClick={() => setFilter(value)} className={`focus-ring rounded-lg px-3 py-2 text-xs font-bold capitalize ${filter === value ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'}`} data-testid={`button-course-filter-${value}`}>{value}</button>)}</div><label className="flex min-h-11 items-center rounded-xl border border-input bg-card px-3 sm:w-72"><Search className="mr-2 h-4 w-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a course" className="w-full bg-transparent text-sm outline-none" aria-label="Find a course" data-testid="input-course-search" /></label></div>
      <QueryState loading={coursesQuery.isLoading} error={!!coursesQuery.error} empty={!coursesQuery.isLoading && !coursesQuery.error && visible.length === 0} onRetry={() => void coursesQuery.refetch()} />
      {!coursesQuery.isLoading && !coursesQuery.error && visible.length > 0 && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((course) => <CourseCard course={course} key={course.id} onRegister={() => handleRegister(course)} pending={registerCourse.isPending && registerCourse.variables?.courseId === course.id} />)}</div>}
      {registerCourse.error && <p className="mt-4 text-sm font-medium text-destructive" data-testid="status-course-register-error">Registration could not be completed. Try again.</p>}
    </div>
  );
}

function CourseCard({ course, onRegister, pending }: { course: Course; onRegister: () => void; pending: boolean }) {
  const accent = { blue: 'bg-secondary', gold: 'bg-accent', purple: 'bg-primary/10', green: 'bg-secondary/70' }[course.accent] || 'bg-secondary';
  return (
    <article className="interactive overflow-hidden rounded-2xl border border-border bg-card shadow-xs" data-testid={`card-course-${course.id}`}>
      <div className={`h-2 ${accent}`} /><div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="mono-font text-xs font-bold tracking-wide text-muted-foreground">{course.code}</p><h2 className="display-font mt-2 text-xl font-bold leading-tight">{course.title}</h2></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${course.status === 'registered' ? 'bg-secondary text-secondary-foreground' : course.status === 'completed' ? 'bg-muted text-muted-foreground' : 'bg-accent/35 text-accent-foreground'}`} data-testid={`status-course-${course.id}`}>{titleCase(course.status)}</span></div><div className="mt-6 space-y-2.5 text-sm text-muted-foreground"><div className="flex gap-3"><UserRound className="h-4 w-4 shrink-0 text-secondary-foreground" /><span>{course.instructor}</span></div><div className="flex gap-3"><CalendarDays className="h-4 w-4 shrink-0 text-secondary-foreground" /><span>{course.schedule}</span></div><div className="flex gap-3"><BookOpen className="h-4 w-4 shrink-0 text-secondary-foreground" /><span>{course.room} · {course.credits} credits</span></div></div>{course.status === 'available' && <button onClick={onRegister} disabled={pending} className="focus-ring mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-60" data-testid={`button-register-course-${course.id}`}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Register course</span><ArrowRight className="h-4 w-4" /></>}</button>}</div>
    </article>
  );
}

function ResultsPage() {
  const resultsQuery = useListResults();
  const results = resultsQuery.data ?? [];
  const average = results.length ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) : 0;
  return (
    <div className="page-in mx-auto max-w-[1200px]" data-testid="page-results">
      <PageHeading eyebrow="Academic record" title="Results" description="Your grades, credits, and progress — together in one reliable record." action={<div className="rounded-xl bg-primary px-5 py-3 text-right text-primary-foreground"><p className="text-xs text-primary-foreground/65">Average score</p><p className="display-font text-2xl font-bold">{average || '—'}{average ? '%' : ''}</p></div>} />
      <QueryState loading={resultsQuery.isLoading} error={!!resultsQuery.error} empty={!resultsQuery.isLoading && !resultsQuery.error && results.length === 0} onRetry={() => void resultsQuery.refetch()} />
      {!resultsQuery.isLoading && !resultsQuery.error && results.length > 0 && <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs"><div className="hidden grid-cols-[1.2fr_1fr_.5fr_.5fr_.5fr_.7fr] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground sm:grid"><span>Course</span><span>Semester</span><span>Credits</span><span>Score</span><span>Grade</span><span className="text-right">Points</span></div><div className="divide-y divide-border">{results.map((result) => <ResultRow result={result} key={result.id} />)}</div></div>}
    </div>
  );
}

function ResultRow({ result }: { result: Result }) {
  return <div className="grid gap-3 px-5 py-4 sm:grid-cols-[1.2fr_1fr_.5fr_.5fr_.5fr_.7fr] sm:items-center sm:gap-4" data-testid={`row-result-${result.id}`}><div><p className="mono-font text-[11px] font-bold text-muted-foreground">{result.courseCode}</p><p className="mt-1 font-semibold">{result.courseTitle}</p></div><p className="text-sm text-muted-foreground">{result.semester}</p><p className="text-sm text-muted-foreground"><span className="sm:hidden">Credits: </span>{result.credits}</p><p className="text-sm font-semibold"><span className="sm:hidden">Score: </span>{result.score}%</p><p><span className="inline-flex rounded-lg bg-secondary px-2.5 py-1 text-sm font-bold text-secondary-foreground" data-testid={`text-grade-${result.id}`}>{result.grade}</span></p><p className="text-left text-sm font-bold sm:text-right">{result.points.toFixed(1)}</p></div>;
}

function FinancePage() {
  const financeQuery = useGetFinance();
  const finance = financeQuery.data;
  return (
    <div className="page-in mx-auto max-w-[1200px]" data-testid="page-finance">
      <PageHeading eyebrow="Student accounts" title="Finance" description="See your fees, payments, and what is still outstanding before the next deadline." action={finance && <div className="rounded-xl bg-accent/40 px-4 py-3 text-right"><p className="text-xs font-semibold text-accent-foreground">Next due</p><p className="font-bold">{formatDate(finance.dueDate)}</p></div>} />
      <QueryState loading={financeQuery.isLoading} error={!!financeQuery.error} empty={!financeQuery.isLoading && !financeQuery.error && !finance} onRetry={() => void financeQuery.refetch()} />
      {!financeQuery.isLoading && !financeQuery.error && finance && <FinanceContent finance={finance} />}
    </div>
  );
}

function FinanceContent({ finance }: { finance: FinanceSummary }) {
  const paidPercent = finance.totalFees ? Math.min(100, Math.round((finance.amountPaid / finance.totalFees) * 100)) : 0;
  return <><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-card p-5 shadow-xs"><p className="text-sm text-muted-foreground">Total fees</p><p className="display-font mt-3 text-3xl font-bold">{formatCurrency(finance.totalFees)}</p></div><div className="rounded-2xl border border-border bg-card p-5 shadow-xs"><p className="text-sm text-muted-foreground">Amount paid</p><p className="display-font mt-3 text-3xl font-bold text-secondary-foreground">{formatCurrency(finance.amountPaid)}</p></div><div className="rounded-2xl border border-primary/15 bg-primary p-5 text-primary-foreground shadow-xs"><p className="text-sm text-primary-foreground/65">Outstanding</p><p className="display-font mt-3 text-3xl font-bold">{formatCurrency(finance.outstanding)}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-primary-foreground/15"><div className="h-full rounded-full bg-accent" style={{ width: `${paidPercent}%` }} /></div><p className="mt-2 text-xs text-primary-foreground/60">{paidPercent}% of fees covered</p></div></div><section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-xs" data-testid="section-payment-history"><div className="flex items-center justify-between border-b border-border px-5 py-5"><div><p className="eyebrow">Account activity</p><h2 className="display-font mt-1 text-xl font-bold">Payment history</h2></div><ReceiptText className="h-5 w-5 text-secondary-foreground" /></div>{finance.payments?.length ? <div className="divide-y divide-border">{finance.payments.map((payment) => <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center" key={payment.id} data-testid={`row-payment-${payment.id}`}><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"><CreditCard className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate font-semibold">{payment.description}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(payment.date)} · <span className="mono-font">{payment.reference}</span></p></div></div><span className="w-fit rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground">{titleCase(payment.status)}</span><p className="font-bold sm:w-28 sm:text-right">{formatCurrency(payment.amount)}</p></div>)}</div> : <div className="p-5"><QueryState empty /></div>}</section></>;
}

function DocumentsPage() {
  const documentsQuery = useListDocuments();
  const documents = documentsQuery.data ?? [];
  const download = (item: LccDocument) => {
    const blob = new Blob([`Liberia Christian College\n${item.title}\nIssued: ${formatDate(item.issueDate)}\nVerification number: ${item.verificationNumber}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `${item.title.replace(/\s+/g, '-').toLowerCase()}.txt`; anchor.click(); URL.revokeObjectURL(url);
  };
  return <div className="page-in mx-auto max-w-[1200px]" data-testid="page-documents"><PageHeading eyebrow="Official records" title="Documents" description="Download official records when you need them. Every document carries a verification number for peace of mind." action={<Link href="/verify" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-bold interactive" data-testid="link-documents-verify"><ShieldCheck className="h-4 w-4 text-secondary-foreground" /> Verify a record</Link>} /><QueryState loading={documentsQuery.isLoading} error={!!documentsQuery.error} empty={!documentsQuery.isLoading && !documentsQuery.error && documents.length === 0} onRetry={() => void documentsQuery.refetch()} />{!documentsQuery.isLoading && !documentsQuery.error && documents.length > 0 && <div className="grid gap-4 md:grid-cols-2">{documents.map((item) => <article className="interactive rounded-2xl border border-border bg-card p-5 shadow-xs" key={item.id} data-testid={`card-document-${item.id}`}><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><FileCheck2 className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="display-font text-lg font-bold">{item.title}</h2><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${item.status === 'available' ? 'bg-secondary text-secondary-foreground' : 'bg-accent/40 text-accent-foreground'}`}>{titleCase(item.status)}</span></div><p className="mt-2 text-sm text-muted-foreground">{titleCase(item.type)} · Issued {formatDate(item.issueDate)}</p><p className="mono-font mt-3 text-[11px] text-muted-foreground" data-testid={`text-verification-${item.id}`}>{item.verificationNumber}</p></div></div><div className="mt-5 flex gap-2 border-t border-border pt-4"><button onClick={() => download(item)} disabled={item.status !== 'available'} className="focus-ring inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40" data-testid={`button-download-document-${item.id}`}><Download className="h-4 w-4" /> Download</button><button onClick={() => window.print()} className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-bold hover:bg-muted" data-testid={`button-print-document-${item.id}`}><Printer className="h-4 w-4" /> Print</button></div></article>)}</div>}</div>;
}

function AnnouncementsPage() {
  const announcementsQuery = useListAnnouncements();
  const announcements = announcementsQuery.data ?? [];
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const visible = announcements.filter((item) => (category === 'all' || item.category === category) && `${item.title} ${item.body}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="page-in mx-auto max-w-[1000px]" data-testid="page-announcements"><PageHeading eyebrow="Stay in the know" title="Announcements" description="Important updates from the college, gathered so you never have to wonder what changed." /><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-muted p-1">{['all', 'academic', 'finance', 'event', 'urgent'].map((value) => <button key={value} onClick={() => setCategory(value)} className={`focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold capitalize ${category === value ? 'bg-card shadow-xs' : 'text-muted-foreground'}`} data-testid={`button-announcement-filter-${value}`}>{value}</button>)}</div><label className="flex min-h-11 items-center rounded-xl border border-input bg-card px-3 sm:w-64"><Search className="mr-2 h-4 w-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search updates" className="w-full bg-transparent text-sm outline-none" aria-label="Search updates" data-testid="input-announcement-search" /></label></div><QueryState loading={announcementsQuery.isLoading} error={!!announcementsQuery.error} empty={!announcementsQuery.isLoading && !announcementsQuery.error && visible.length === 0} onRetry={() => void announcementsQuery.refetch()} />{!announcementsQuery.isLoading && !announcementsQuery.error && visible.length > 0 && <div className="space-y-3">{visible.map((item) => <AnnouncementCard item={item} key={item.id} />)}</div>}</div>;
}

function AnnouncementCard({ item }: { item: Announcement }) {
  const urgent = item.category === 'urgent';
  return <article className={`rounded-2xl border bg-card p-5 shadow-xs sm:p-6 ${urgent ? 'border-accent/65' : 'border-border'}`} data-testid={`card-announcement-${item.id}`}><div className="flex items-start gap-4"><div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${urgent ? 'bg-accent/40 text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`}><Bell className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{titleCase(item.category)}</span>{!item.read && <span className="h-2 w-2 rounded-full bg-accent" aria-label="Unread" data-testid={`indicator-unread-${item.id}`} />}</div><h2 className="display-font mt-3 text-xl font-bold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p><p className="mt-4 text-xs font-semibold text-muted-foreground">{formatDate(item.date)}</p></div></div></article>;
}

function SupportPage() {
  const createTicket = useCreateSupportTicket();
  const [form, setForm] = useState({ subject: '', category: 'academics', message: '' });
  const [submitted, setSubmitted] = useState<string | null>(null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    createTicket.mutate({ data: { ...form, category: form.category as SupportTicketInputCategory } }, { onSuccess: (ticket) => { setSubmitted(ticket.id); setForm({ subject: '', category: 'academics', message: '' }); } });
  };
  return <div className="page-in mx-auto max-w-[1000px]" data-testid="page-support"><PageHeading eyebrow="We are here to help" title="Support desk" description="Tell us what is blocking your academic day. The LCC support team will pick it up and keep you posted." /><div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]"><aside className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg sm:p-7"><Headphones className="h-8 w-8 text-accent" /><h2 className="display-font mt-8 text-2xl font-bold">A clear question gets a clear answer.</h2><p className="mt-3 text-sm leading-6 text-primary-foreground/68">For urgent academic deadlines, include the course code or document number in your message.</p><div className="mt-8 space-y-4 border-t border-primary-foreground/15 pt-5 text-sm"><div className="flex gap-3"><TicketCheck className="h-4 w-4 shrink-0 text-accent" /><span>Trackable ticket reference</span></div><div className="flex gap-3"><LockKeyhole className="h-4 w-4 shrink-0 text-accent" /><span>Your details stay within LCC support</span></div></div></aside><section className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-7"><div className="mb-6"><p className="eyebrow">New request</p><h2 className="display-font mt-1 text-2xl font-bold">Open a support ticket</h2></div>{submitted && <div className="mb-5 flex items-start gap-3 rounded-xl bg-secondary p-4 text-sm text-secondary-foreground" data-testid="status-ticket-created"><Check className="mt-0.5 h-4 w-4 shrink-0" /><p>Your ticket <span className="mono-font font-bold">{submitted}</span> is open. We will be in touch.</p><button onClick={() => setSubmitted(null)} className="ml-auto" aria-label="Dismiss ticket confirmation" data-testid="button-dismiss-ticket-confirmation"><X className="h-4 w-4" /></button></div>}<form className="space-y-5" onSubmit={submit}><label className="block"><span className="mb-2 block text-sm font-semibold">Subject</span><input required minLength={3} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" placeholder="What do you need help with?" data-testid="input-support-subject" /></label><label className="block"><span className="mb-2 block text-sm font-semibold">Category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" data-testid="select-support-category"><option value="academics">Academics</option><option value="finance">Finance</option><option value="account">Account</option><option value="technical">Technical</option><option value="other">Other</option></select></label><label className="block"><span className="mb-2 block text-sm font-semibold">Message</span><textarea required minLength={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} rows={5} className="w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" placeholder="Include the useful details so we can help faster." data-testid="textarea-support-message" /></label>{createTicket.error && <p className="text-sm font-medium text-destructive" data-testid="status-support-error">That ticket could not be submitted. Please try again.</p>}<button disabled={createTicket.isPending} className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-60" data-testid="button-submit-support-ticket">{createTicket.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Send to support</>}</button></form></section></div></div>;
}

type FeatureDefinition = {
  title: string;
  eyebrow: string;
  description: string;
  icon: NavItem['icon'];
  summary: string;
  rows: Array<{ label: string; value: string; detail: string }>;
};

const roleFeatureCatalog: Record<PortalRole, Record<string, FeatureDefinition>> = {
  student: {
    'my-courses': {
      title: 'My courses',
      eyebrow: 'Student academics',
      description: 'Your registered courses, instructors, credits, and current semester commitments.',
      icon: BookOpen,
      summary: 'Fall 2026 registered load',
      rows: [
        { label: 'Registered courses', value: '4', detail: 'Your active course list' },
        { label: 'Credit load', value: '11', detail: 'Credits this semester' },
        { label: 'Next class', value: '10:00 AM', detail: 'CSC 301 · Science 204' },
      ],
    },
    'class-schedule': {
      title: 'Class schedule',
      eyebrow: 'Student academics',
      description: 'Keep every class, room, and meeting time in view throughout the semester.',
      icon: CalendarDays,
      summary: 'This week at Monrovia campus',
      rows: [
        { label: 'Monday', value: 'CSC 301', detail: '10:00 AM · Science 204' },
        { label: 'Tuesday', value: 'BIB 220', detail: '8:00 AM · Faith Hall 102' },
        { label: 'Friday', value: 'ENG 210', detail: '9:00 AM · Humanities 201' },
      ],
    },
    transcript: {
      title: 'Transcript',
      eyebrow: 'Student records',
      description: 'Review your academic history and prepare an official record when you need one.',
      icon: FileChartColumn,
      summary: 'Academic record',
      rows: [
        { label: 'Cumulative average', value: '3.68', detail: 'Current GPA' },
        { label: 'Completed credits', value: '42', detail: 'Across completed semesters' },
        { label: 'Record status', value: 'Current', detail: 'No holds reported' },
      ],
    },
    attendance: {
      title: 'Attendance',
      eyebrow: 'Student progress',
      description: 'See your attendance standing and follow up before missed classes affect your progress.',
      icon: ClipboardCheck,
      summary: 'Excellent standing',
      rows: [
        { label: 'Overall attendance', value: '94%', detail: 'Across registered courses' },
        { label: 'Classes attended', value: '47', detail: 'This semester' },
        { label: 'Follow-up needed', value: '1', detail: 'Review with your instructor' },
      ],
    },
    assignments: {
      title: 'Assignments',
      eyebrow: 'Student work',
      description: 'Track upcoming coursework and the next deadlines across your registered classes.',
      icon: ListChecks,
      summary: 'Keep your deadlines visible',
      rows: [
        { label: 'Open assignments', value: '12', detail: 'Across your courses' },
        { label: 'Due this week', value: '3', detail: 'Plan time before Friday' },
        { label: 'Submitted', value: '18', detail: 'Fall 2026 activity' },
      ],
    },
    notifications: {
      title: 'Notifications',
      eyebrow: 'Student updates',
      description: 'Important reminders from academics, finance, and the LCC community.',
      icon: Bell,
      summary: 'Recent updates',
      rows: [
        { label: 'Registration', value: 'Action needed', detail: 'Closes Friday at 5:00 PM' },
        { label: 'Finance', value: 'Reminder', detail: 'Payment plan support is available' },
        { label: 'Campus', value: 'New', detail: 'Founders Week chapel on Wednesday' },
      ],
    },
    profile: {
      title: 'Student profile',
      eyebrow: 'Account details',
      description: 'Keep your identity and contact details ready for academic and administrative services.',
      icon: UserRound,
      summary: 'Your LCC identity',
      rows: [
        { label: 'Name', value: 'Morris Doe', detail: 'Student account holder' },
        { label: 'Student ID', value: 'LCC-2024-0187', detail: 'Use this for college services' },
        { label: 'Campus', value: 'Monrovia', detail: 'Liberia Christian College' },
      ],
    },
  },
  staff: {
    'assigned-courses': {
      title: 'Assigned courses',
      eyebrow: 'Faculty workspace',
      description: 'Manage the courses assigned to you and stay close to the semester teaching plan.',
      icon: BookOpen,
      summary: 'Fall 2026 teaching load',
      rows: [
        { label: 'Assigned courses', value: '4', detail: 'Active this semester' },
        { label: 'Students total', value: '138', detail: 'Across your classes' },
        { label: 'Next class', value: '10:00 AM', detail: 'CSC 301 · Science 204' },
      ],
    },
    'class-lists': {
      title: 'Class lists',
      eyebrow: 'Faculty workspace',
      description: 'Open the current roster for each assigned course and quickly identify your learners.',
      icon: Users,
      summary: 'Roster overview',
      rows: [
        { label: 'Active rosters', value: '4', detail: 'One per assigned course' },
        { label: 'Largest class', value: '42', detail: 'CSC 301' },
        { label: 'New students', value: '6', detail: 'Added this semester' },
      ],
    },
    attendance: {
      title: 'Attendance',
      eyebrow: 'Faculty workspace',
      description: 'Record attendance and review students who may need an early check-in.',
      icon: ClipboardCheck,
      summary: 'Attendance to review',
      rows: [
        { label: 'Sessions this week', value: '12', detail: 'Across your courses' },
        { label: 'Needs attention', value: '3', detail: 'Students below 80%' },
        { label: 'Last submission', value: 'Today', detail: 'CSC 301 · 10:00 AM' },
      ],
    },
    'grade-submission': {
      title: 'Grade submission',
      eyebrow: 'Faculty workspace',
      description: 'Prepare, review, and submit marks for the courses assigned to you.',
      icon: GraduationCap,
      summary: 'Fall 2026 grading',
      rows: [
        { label: 'Open gradebooks', value: '4', detail: 'One per assigned course' },
        { label: 'Submission window', value: 'Oct 1', detail: 'Next deadline' },
        { label: 'Awaiting review', value: '12', detail: 'Assignments across classes' },
      ],
    },
    'course-materials': {
      title: 'Course materials',
      eyebrow: 'Faculty workspace',
      description: 'Organize the learning resources your classes need for the current semester.',
      icon: FileText,
      summary: 'Teaching resources',
      rows: [
        { label: 'Course folders', value: '4', detail: 'One per assigned course' },
        { label: 'Published materials', value: '28', detail: 'Visible to students' },
        { label: 'Draft uploads', value: '3', detail: 'Ready to review' },
      ],
    },
    'student-records': {
      title: 'Student records',
      eyebrow: 'Faculty workspace',
      description: 'Find the academic context you need to support students in your assigned classes.',
      icon: UserRound,
      summary: 'Teaching support',
      rows: [
        { label: 'Students in scope', value: '138', detail: 'Only your assigned classes' },
        { label: 'At-risk records', value: '8', detail: 'Attendance or grade signals' },
        { label: 'Recent updates', value: '14', detail: 'Since your last visit' },
      ],
    },
  },
  admin: {
    students: { title: 'Students', eyebrow: 'Administration', description: 'Manage student records, identifiers, enrollment status, and academic standing.', icon: Users, summary: 'Student administration', rows: [{ label: 'Total students', value: '1,248', detail: 'Across active programs' }, { label: 'New this year', value: '342', detail: 'Applications and admissions' }, { label: 'Needs review', value: '28', detail: 'Awaiting administrative action' }] },
    staff: { title: 'Staff', eyebrow: 'Administration', description: 'Maintain staff and faculty records across departments and teaching assignments.', icon: UserRound, summary: 'Staff administration', rows: [{ label: 'Active staff', value: '86', detail: 'Across 6 departments' }, { label: 'Faculty', value: '64', detail: 'Teaching and academic staff' }, { label: 'Pending profiles', value: '4', detail: 'Require review' }] },
    departments: { title: 'Departments', eyebrow: 'Academic structure', description: 'Organize the academic departments that own programs, courses, and faculty assignments.', icon: Building2, summary: 'Academic organization', rows: [{ label: 'Departments', value: '6', detail: 'Active academic units' }, { label: 'Programs', value: '18', detail: 'Owned by departments' }, { label: 'Heads to review', value: '1', detail: 'Annual confirmation' }] },
    programs: { title: 'Programs', eyebrow: 'Academic structure', description: 'Manage degree and certificate programs, requirements, and department ownership.', icon: GraduationCap, summary: 'Program catalog', rows: [{ label: 'Active programs', value: '18', detail: 'Published to students' }, { label: 'Program reviews', value: '3', detail: 'Due this academic year' }, { label: 'Departments', value: '6', detail: 'Program owners' }] },
    courses: { title: 'Courses', eyebrow: 'Academic structure', description: 'Maintain course codes, credits, instructors, schedules, rooms, and availability.', icon: BookOpen, summary: 'Course catalog', rows: [{ label: 'Catalog courses', value: '124', detail: 'Across active programs' }, { label: 'Offered this term', value: '48', detail: 'Fall 2026' }, { label: 'Draft changes', value: '7', detail: 'Awaiting approval' }] },
    'academic-periods': { title: 'Academic years / semesters', eyebrow: 'Academic structure', description: 'Control the academic calendar and the periods used for registration, grades, and reports.', icon: CalendarClock, summary: 'Academic calendar', rows: [{ label: 'Current period', value: 'Fall 2026', detail: 'Registration is open' }, { label: 'Next period', value: 'Spring 2027', detail: 'Planning window' }, { label: 'Calendar items', value: '24', detail: 'Important dates' }] },
    registration: { title: 'Registration', eyebrow: 'Academic operations', description: 'Monitor registration activity and resolve enrollment issues before deadlines.', icon: ClipboardList, summary: 'Registration operations', rows: [{ label: 'Registered students', value: '1,102', detail: 'Fall 2026' }, { label: 'Pending reviews', value: '28', detail: 'Need administrative action' }, { label: 'Completion', value: '88%', detail: 'Current registration cycle' }] },
    payments: { title: 'Payments', eyebrow: 'Finance operations', description: 'Review fee collection, payment activity, balances, and finance follow-up.', icon: CreditCard, summary: 'Finance operations', rows: [{ label: 'Fee collection', value: '78%', detail: '$284k this semester' }, { label: 'Transactions', value: '2,486', detail: 'Posted this academic year' }, { label: 'Open balances', value: '164', detail: 'Require follow-up' }] },
    results: { title: 'Results', eyebrow: 'Academic operations', description: 'Review submitted results and maintain a reliable academic record for every student.', icon: FileChartColumn, summary: 'Results administration', rows: [{ label: 'Results submitted', value: '92%', detail: 'Fall 2026 courses' }, { label: 'Awaiting submission', value: '12', detail: 'Faculty action needed' }, { label: 'Exceptions', value: '4', detail: 'Flagged for review' }] },
    reports: { title: 'Reports', eyebrow: 'Administration', description: 'Bring enrollment, finance, academic performance, and operations into one reporting workspace.', icon: TrendingUp, summary: 'Institutional reporting', rows: [{ label: 'Saved reports', value: '16', detail: 'Available to administrators' }, { label: 'Scheduled reports', value: '5', detail: 'Sent to leadership' }, { label: 'Latest report', value: 'Today', detail: 'Fall 2026 enrollment' }] },
  },
  super_admin: {
    users: { title: 'User / role management', eyebrow: 'System governance', description: 'Create, deactivate, and assign roles to every account in the LCC E-Portal.', icon: UserCog, summary: 'Identity administration', rows: [{ label: 'System users', value: '1,338', detail: 'All roles combined' }, { label: 'Roles active', value: '4', detail: 'Student, staff, admin, super admin' }, { label: 'Pending access', value: '6', detail: 'Awaiting approval' }] },
    settings: { title: 'System settings', eyebrow: 'System governance', description: 'Control institution-wide portal settings, defaults, and operational preferences.', icon: Settings, summary: 'Portal configuration', rows: [{ label: 'Configuration groups', value: '12', detail: 'System-wide settings' }, { label: 'Last change', value: 'Today', detail: 'Reviewed by super admin' }, { label: 'Environment', value: 'Development', detail: 'Change before production' }] },
    permissions: { title: 'Permissions', eyebrow: 'System governance', description: 'Define what each role can view, create, edit, approve, and export.', icon: SlidersHorizontal, summary: 'Access control', rows: [{ label: 'Permission groups', value: '4', detail: 'One per portal role' }, { label: 'Protected actions', value: '28', detail: 'Server-enforced rules' }, { label: 'Recent review', value: 'Sep 18', detail: 'No conflicts found' }] },
    'audit-logs': { title: 'Audit logs', eyebrow: 'System governance', description: 'Trace account, data, and system actions for accountability and security review.', icon: ScrollText, summary: 'System activity', rows: [{ label: 'Events this month', value: '482', detail: 'All system areas' }, { label: 'Security alerts', value: '0', detail: 'No action needed' }, { label: 'Last event', value: '2 min ago', detail: 'Successful sign-in' }] },
    system: { title: 'Database / system management', eyebrow: 'System governance', description: 'Monitor database health, background services, backups, and operational readiness.', icon: Database, summary: 'Platform health', rows: [{ label: 'System activity', value: '99.9%', detail: 'Healthy this month' }, { label: 'Database status', value: 'Healthy', detail: 'PostgreSQL connected' }, { label: 'Last backup', value: 'Today', detail: 'Development environment' }] },
  },
};

function RoleFeaturePage() {
  const { feature } = useParams<{ feature: string }>();
  const userQuery = useGetCurrentUser();
  const user = userQuery.data;
  const definition = user ? roleFeatureCatalog[user.role]?.[feature ?? ''] : undefined;
  if (!user || !definition) return <NotFound />;
  const Icon = definition.icon;
  return (
    <div className="page-in mx-auto max-w-[1200px]" data-testid={`page-feature-${feature}`}>
      <PageHeading
        eyebrow={definition.eyebrow}
        title={definition.title}
        description={definition.description}
        action={<div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3"><Icon className="h-5 w-5 text-secondary-foreground" /><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-secondary-foreground/70">{roleLabels[user.role]}</p><p className="text-sm font-bold text-secondary-foreground">{definition.summary}</p></div></div>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {definition.rows.map((row) => (
          <div className="interactive rounded-2xl border border-border bg-card p-5 shadow-xs" key={row.label} data-testid={`card-feature-${row.label.toLowerCase().replaceAll(' ', '-')}`}>
            <p className="text-sm font-medium text-muted-foreground">{row.label}</p>
            <p className="display-font mt-3 text-3xl font-bold tracking-[-.04em]">{row.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{row.detail}</p>
          </div>
        ))}
      </div>
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-7" data-testid="section-feature-workspace">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></div>
          <div><p className="eyebrow">Role-scoped workspace</p><h2 className="display-font mt-1 text-2xl font-bold">{definition.title} at LCC</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">This workspace is available to {roleLabels[user.role]} accounts. Access is checked by the signed-in role before the page is shown.</p></div>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {definition.rows.map((row, index) => <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3" key={`${row.label}-detail`}><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-secondary-foreground"><Check className="h-4 w-4" /></div><div><p className="text-sm font-semibold">{index === 0 ? 'Review current records' : index === 1 ? 'Take the next action' : 'Keep the portal record current'}</p><p className="text-xs text-muted-foreground">{row.label} · {row.detail}</p></div></div>)}
        </div>
      </section>
    </div>
  );
}

function VerifyPage() {
  const [input, setInput] = useState('');
  const [number, setNumber] = useState('');
  const verificationQuery = useVerifyDocument(number, { query: { enabled: Boolean(number), queryKey: getVerifyDocumentQueryKey(number) } });
  const submit = (event: FormEvent) => { event.preventDefault(); setNumber(input.trim()); };
  return <div className="page-in mx-auto max-w-[900px]" data-testid="page-verify"><div className="mx-auto max-w-2xl text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><ShieldCheck className="h-7 w-7" /></div><p className="eyebrow mt-6">Public document check</p><h1 className="display-font mt-2 text-4xl font-bold tracking-[-.04em] sm:text-5xl" data-testid="heading-verify">Verify an LCC document</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">Enter the verification number printed on an official Liberia Christian College document. No sign-in is required.</p><form onSubmit={submit} className="mx-auto mt-8 flex flex-col gap-2 sm:flex-row" data-testid="form-verify"><input required value={input} onChange={(event) => setInput(event.target.value)} className="min-h-12 flex-1 rounded-xl border border-input bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" placeholder="e.g. LCC-2025-00418" aria-label="Verification number" data-testid="input-verification-number" /><button className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground" data-testid="button-verify-document"><Search className="h-4 w-4" /> Check document</button></form></div>{number && <div className="mx-auto mt-8 max-w-2xl"><QueryState loading={verificationQuery.isLoading} error={!!verificationQuery.error} onRetry={() => void verificationQuery.refetch()} />{!verificationQuery.isLoading && !verificationQuery.error && verificationQuery.data && <VerificationResultCard result={verificationQuery.data} />}</div>}<div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card p-5 text-center text-xs leading-5 text-muted-foreground"><LockKeyhole className="mx-auto mb-2 h-4 w-4" />Verification confirms records issued by LCC. If a result looks incorrect, contact the support desk.</div></div>;
}

function VerificationResultCard({ result }: { result: { valid: boolean; documentType: string; issuedDate: string; institution: string; verificationNumber: string; holderName: string | null } }) {
  return <div className={`rounded-2xl border p-6 ${result.valid ? 'border-secondary-foreground/30 bg-secondary/45' : 'border-destructive/25 bg-destructive/5'}`} data-testid="card-verification-result"><div className="flex items-start gap-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${result.valid ? 'bg-secondary-foreground text-secondary' : 'bg-destructive text-destructive-foreground'}`}>{result.valid ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}</div><div><p className="eyebrow">{result.valid ? 'Verified official record' : 'Record not verified'}</p><h2 className="display-font mt-1 text-2xl font-bold">{result.valid ? 'This document is valid.' : 'We could not confirm this number.'}</h2></div></div>{result.valid && <div className="mt-6 grid gap-4 border-t border-secondary-foreground/15 pt-5 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Document</p><p className="mt-1 font-semibold">{titleCase(result.documentType)}</p></div><div><p className="text-xs text-muted-foreground">Issued</p><p className="mt-1 font-semibold">{formatDate(result.issuedDate)}</p></div><div><p className="text-xs text-muted-foreground">Institution</p><p className="mt-1 font-semibold">{result.institution}</p></div><div><p className="text-xs text-muted-foreground">Holder</p><p className="mt-1 font-semibold">{result.holderName || 'Not listed'}</p></div><div className="sm:col-span-2"><p className="text-xs text-muted-foreground">Verification number</p><p className="mono-font mt-1 text-sm font-bold">{result.verificationNumber}</p></div></div>}</div>;
}

function LoginPage() {
  const [, setLocation] = useLocation();
  const client = useQueryClient();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate({ data: { email, password, rememberMe } }, { onSuccess: (session) => { client.setQueryData(getGetCurrentUserQueryKey(), session.user); setLocation('/dashboard'); } });
  };
  return <div className="flex min-h-[100dvh] bg-primary text-primary-foreground" data-testid="page-login"><div className="relative hidden w-[44%] overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between"><div className="absolute -left-32 -top-32 h-96 w-96 rounded-full border border-accent/20" /><div className="absolute bottom-20 right-10 h-72 w-72 rounded-full border border-primary-foreground/10" /><LogoLockup /><div className="relative max-w-lg pb-8"><p className="eyebrow text-accent">Daily academic home</p><h1 className="display-font mt-5 text-6xl font-bold leading-[.98] tracking-[-.06em]">Keep your calling<br /><span className="text-accent">in order.</span></h1><p className="mt-6 max-w-md text-base leading-7 text-primary-foreground/65">Your classes, results, fees, and official records — close at hand, wherever your LCC day takes you.</p><div className="mt-10 flex items-center gap-3 text-xs font-semibold text-primary-foreground/55"><span className="h-px w-10 bg-accent" /> Monrovia · Liberia <span className="h-px w-10 bg-accent" /></div></div></div><div className="flex flex-1 items-center justify-center bg-background px-5 py-10 text-foreground sm:px-10"><div className="w-full max-w-[420px]"><div className="mb-10 lg:hidden"><LogoLockup compact /></div><p className="eyebrow">Welcome back</p><h2 className="display-font mt-2 text-4xl font-bold tracking-[-.04em]">Sign in to E-Portal</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Use your LCC email to continue to your academic home.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="block"><span className="mb-2 block text-sm font-semibold">LCC email</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@lcc.edu.lr" className="min-h-12 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" data-testid="input-login-email" /></label><label className="block"><span className="mb-2 block text-sm font-semibold">Password</span><input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="min-h-12 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" data-testid="input-login-password" /></label><div className="flex items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded accent-primary" data-testid="input-login-remember" /> Remember me</label><span className="text-xs font-semibold text-secondary-foreground">Need help? Visit Support</span></div>{login.error && <p className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive" data-testid="status-login-error">The email or password was not recognized. Try again.</p>}<button disabled={login.isPending} className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-60" data-testid="button-login-submit">{login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue to portal <ArrowRight className="h-4 w-4" /></>}</button></form><div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" /> Secure access for LCC students and staff</div><Link href="/verify" className="mt-5 block text-center text-xs font-bold text-secondary-foreground underline-offset-4 hover:underline" data-testid="link-login-verify">Verify an official document without signing in</Link></div></div></div>;
}

function NotFound() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-5 text-center"><div><p className="eyebrow">404 · Not found</p><h1 className="display-font mt-3 text-5xl font-bold">This page took a wrong turn.</h1><p className="mt-3 text-muted-foreground">The portal page you are looking for does not exist.</p><Link href="/dashboard" className="focus-ring mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground" data-testid="link-not-found-dashboard">Back to overview <ArrowRight className="h-4 w-4" /></Link></div></div>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function PrivateRoute({ children, roles }: { children: ReactNode; roles?: PortalRole[] }) {
  const [, setLocation] = useLocation();
  const currentUserQuery = useGetCurrentUser();
  useEffect(() => {
    if (currentUserQuery.error) setLocation('/');
    if (currentUserQuery.data && roles && !roles.includes(currentUserQuery.data.role)) setLocation('/dashboard');
  }, [currentUserQuery.data, currentUserQuery.error, roles, setLocation]);
  if (currentUserQuery.isLoading) {
    return <div className="flex min-h-[100dvh] items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-secondary-foreground" /></div>;
  }
  if (currentUserQuery.error || !currentUserQuery.data) return null;
  if (roles && !roles.includes(currentUserQuery.data.role)) return null;
  return <AppShell>{children}</AppShell>;
}

function Router() {
  return <RoutedErrorBoundary><Switch>
    <Route path="/" component={LoginPage} />
    <Route path="/dashboard"><PrivateRoute><DashboardPage /></PrivateRoute></Route>
    <Route path="/courses"><PrivateRoute roles={['student']}><CoursesPage /></PrivateRoute></Route>
    <Route path="/results"><PrivateRoute roles={['student', 'staff', 'admin', 'super_admin']}><ResultsPage /></PrivateRoute></Route>
    <Route path="/finance"><PrivateRoute roles={['student', 'admin', 'super_admin']}><FinancePage /></PrivateRoute></Route>
    <Route path="/documents"><PrivateRoute roles={['student', 'admin', 'super_admin']}><DocumentsPage /></PrivateRoute></Route>
    <Route path="/announcements"><PrivateRoute><AnnouncementsPage /></PrivateRoute></Route>
    <Route path="/support"><PrivateRoute><SupportPage /></PrivateRoute></Route>
    <Route path="/student/:feature"><PrivateRoute roles={['student']}><RoleFeaturePage /></PrivateRoute></Route>
    <Route path="/staff/:feature"><PrivateRoute roles={['staff']}><RoleFeaturePage /></PrivateRoute></Route>
    <Route path="/admin/:feature"><PrivateRoute roles={['admin', 'super_admin']}><RoleFeaturePage /></PrivateRoute></Route>
    <Route path="/super-admin/:feature"><PrivateRoute roles={['super_admin']}><RoleFeaturePage /></PrivateRoute></Route>
    <Route path="/verify" component={VerifyPage} />
    <Route component={NotFound} />
  </Switch></RoutedErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;