import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  BellRing,
  Settings,
  Lock,
  ShieldCheck,
  Users,
  Search,
  MessageCircle,
  Mail,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock3,
  Headphones,
  Upload,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Activity,
  MapPin,
  RadioTower,
} from 'lucide-react';

const helpCategories = [
  {
    title: 'Account Support',
    icon: User,
    description: 'Login, registration, password, profile issues',
    color: 'from-blue-50 to-blue-100',
  },
  {
    title: 'Emergency Reporting Help',
    icon: AlertTriangle,
    description: 'Issues submitting or tracking emergency alerts',
    color: 'from-red-50 to-red-100',
  },
  {
    title: 'Notifications Support',
    icon: BellRing,
    description: 'Alert delivery and notification settings',
    color: 'from-amber-50 to-amber-100',
  },
  {
    title: 'Technical Issues',
    icon: Settings,
    description: 'Bugs, crashes, loading problems',
    color: 'from-slate-50 to-slate-100',
  },
  {
    title: 'Privacy & Security',
    icon: Lock,
    description: 'Account protection and data settings',
    color: 'from-emerald-50 to-emerald-100',
  },
  {
    title: 'Community Assistance',
    icon: Users,
    description: 'Community feature guidance',
    color: 'from-cyan-50 to-cyan-100',
  },
];

const articles = [
  { title: 'How to Report an Emergency', readTime: '4 min read', icon: FileText },
  { title: 'How Nearby Alerts Work', readTime: '5 min read', icon: MapPin },
  { title: 'Managing Notification Settings', readTime: '3 min read', icon: BellRing },
  { title: 'Updating Your Location', readTime: '4 min read', icon: RadioTower },
  { title: 'Tracking Submitted Alerts', readTime: '3 min read', icon: Activity },
  { title: 'Resetting Your Password', readTime: '2 min read', icon: ShieldCheck },
];

const faqs = [
  {
    question: 'Why am I not receiving alerts?',
    answer: 'Check that notifications are enabled, your device sound and permissions are active, and your location is set correctly. If the issue continues, use the support form below and include your device type.',
  },
  {
    question: 'How do I update my location?',
    answer: 'Open your account settings and adjust location permissions. You can also re-verify your current area from the profile or notification settings screen.',
  },
  {
    question: 'Can I delete an emergency report?',
    answer: 'Submitted emergency reports may be retained for safety and legal reasons. If you need a correction, contact support with the report ID and we will review the request.',
  },
  {
    question: 'How is my information protected?',
    answer: 'We use encryption, access controls, and monitoring to protect your data. Review the Privacy Policy for the full breakdown of our safeguards.',
  },
  {
    question: 'How do I contact emergency responders?',
    answer: 'Use the emergency reporting flow to submit an incident. If the situation is urgent and local emergency services are required, contact them directly in addition to using the platform.',
  },
  {
    question: 'Why is my account restricted?',
    answer: 'Restrictions usually happen after repeated security checks, unusual activity, or pending verification. Contact support and include the email address linked to your account.',
  },
];

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#B91C1C]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{subtitle}</p>
    </div>
  );
}

function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  );
}

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [priority, setPriority] = useState('normal');
  const [issueCategory, setIssueCategory] = useState('Account');
  const [attachmentName, setAttachmentName] = useState('No file selected');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    issue: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [systemStatus] = useState([
    'Emergency Reporting',
    'Notifications',
    'Location Services',
    'User Authentication',
  ]);

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return articles;
    return articles.filter((article) =>
      `${article.title} ${article.readTime}`.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFormErrors((current) => ({ ...current, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!formData.email.trim()) errors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email address.';
    if (!formData.issue.trim()) errors.issue = 'Please describe the issue.';
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    setStatusSubmitting(true);
    setSubmitted(false);

    window.setTimeout(() => {
      setStatusSubmitting(false);
      setSubmitted(true);
      setFormData({ fullName: '', email: '', issue: '' });
      setAttachmentName('No file selected');
      setPriority('normal');
      setIssueCategory('Account');
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <motion.div
        className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-[#B91C1C]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8 }}
      />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-1/3 top-0 h-72 w-72 rounded-full bg-red-600 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
          </div>
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-red-300">Support Center</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                How Can We Help You Today?
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
                Find answers, report issues, and get assistance quickly.
              </p>

              <div className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <Search className="h-5 w-5 text-slate-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search for help articles, issues, or support topics..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-300"
                  aria-label="Search support topics"
                />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <motion.a
                  href="#ticket"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100"
                >
                  Contact Support
                </motion.a>
                <motion.a
                  href="#ticket"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center rounded-full border border-red-400/70 bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500"
                >
                  Report an Issue
                </motion.a>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="relative mx-auto flex max-w-md items-center justify-center">
                <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-2xl" />
                <div className="relative w-full rounded-[2rem] border border-white/15 bg-slate-900/60 p-6 shadow-2xl backdrop-blur">
                  <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-5 ring-1 ring-white/10">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Support dashboard</span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 text-red-200">
                        <CheckCircle2 className="h-4 w-4" /> Live
                      </span>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {[
                        { label: 'Account', color: 'bg-blue-500' },
                        { label: 'Emergency Alerts', color: 'bg-red-500' },
                        { label: 'Notifications', color: 'bg-amber-500' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                          <div className={`h-10 w-10 rounded-xl ${item.color}/20 ${item.color.replace('bg-', 'text-')} flex items-center justify-center`}>
                            <Headphones className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">{item.label}</p>
                            <p className="text-xs text-slate-400">Support queue ready</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Quick Help"
              title="Support Categories"
              subtitle="Pick the area that matches your issue and move straight to the right help path."
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {helpCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Reveal key={category.title} delay={index * 0.04}>
                    <article className={`h-full rounded-3xl border border-slate-200 bg-gradient-to-br ${category.color} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-slate-200/80">
                        <Icon className="h-7 w-7 text-slate-900" />
                      </div>
                      <h3 className="mt-5 text-xl font-bold text-slate-950">{category.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Help Articles"
              title="Popular Support Articles"
              subtitle="Browse fast answers for the most common questions."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredArticles.map((article, index) => {
                const Icon = article.icon;
                return (
                  <Reveal key={article.title} delay={index * 0.03}>
                    <article className="group h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-red-50 group-hover:text-red-600">
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {article.readTime}
                        </span>
                      </div>
                      <h3 className="mt-5 text-xl font-bold text-slate-950">{article.title}</h3>
                      <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#B91C1C] transition-colors hover:text-[#991B1B]">
                        Read Article
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Live Support"
              title="Immediate Support Options"
              subtitle="Choose the fastest route based on the urgency of your issue."
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {[
                {
                  icon: MessageCircle,
                  title: 'Live Chat Assistance',
                  badge: '🟢 Online',
                  description: 'Get instant help for general account and product questions.',
                  action: 'Start Chat',
                },
                {
                  icon: Mail,
                  title: 'Send Us a Message',
                  badge: 'Usually within 24 hours',
                  description: 'Use email support for detailed requests or follow-up help.',
                  action: 'Email Support',
                },
                {
                  icon: AlertTriangle,
                  title: 'Urgent Platform Assistance',
                  badge: 'Critical issue',
                  description: 'For emergency reporting failures or urgent platform problems.',
                  action: 'Get Immediate Help',
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} delay={index * 0.05}>
                    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                          <Icon className="h-7 w-7" />
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="mt-6 text-2xl font-bold">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                      <button className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500">
                        {item.action}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section id="ticket" className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Submit Request"
              title="Submit a Support Request"
              subtitle="Use this form to describe your issue and let the support team guide you to a resolution."
            />
            <Reveal>
              <form onSubmit={handleSubmit} className="mt-10 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-300/40 backdrop-blur md:p-8">
                {submitted && (
                  <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    Your support ticket has been received.
                  </div>
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Full Name</span>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                      placeholder="Enter your full name"
                    />
                    {formErrors.fullName && <p className="mt-2 text-sm text-red-600">{formErrors.fullName}</p>}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Email Address</span>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                      placeholder="you@example.com"
                    />
                    {formErrors.email && <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>}
                  </label>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Issue Category</span>
                    <select
                      value={issueCategory}
                      onChange={(event) => setIssueCategory(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    >
                      {['Account', 'Emergency Reporting', 'Notifications', 'Technical Problem', 'Security Concern', 'Other'].map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Priority Level</span>
                    <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      {['Normal', 'Important', 'Urgent'].map((option) => (
                        <label key={option} className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                          <input
                            type="radio"
                            name="priority"
                            value={option.toLowerCase()}
                            checked={priority === option.toLowerCase()}
                            onChange={(event) => setPriority(event.target.value)}
                            className="h-4 w-4 border-slate-300 text-red-600 focus:ring-red-500"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </label>
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Describe the Issue</span>
                  <textarea
                    name="issue"
                    value={formData.issue}
                    onChange={handleChange}
                    rows={6}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    placeholder="Please explain your issue in detail..."
                  />
                  {formErrors.issue && <p className="mt-2 text-sm text-red-600">{formErrors.issue}</p>}
                </label>

                <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Attach Screenshot</span>
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-red-400 hover:bg-red-50/70">
                      <Upload className="h-7 w-7 text-slate-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Drag and drop or click to upload</p>
                        <p className="text-xs text-slate-500">PNG, JPG, or PDF up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(event) => setAttachmentName(event.target.files?.[0]?.name || 'No file selected')}
                      />
                    </label>
                    <p className="mt-2 text-xs text-slate-500">Selected file: {attachmentName}</p>
                  </label>

                  <motion.button
                    type="submit"
                    disabled={statusSubmitting}
                    whileHover={{ scale: statusSubmitting ? 1 : 1.01 }}
                    whileTap={{ scale: statusSubmitting ? 1 : 0.99 }}
                    className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-red-500 px-7 py-4 font-semibold text-white shadow-lg shadow-red-500/25 transition disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    {statusSubmitting ? 'Sending request...' : 'Submit Request'}
                  </motion.button>
                </div>
              </form>
            </Reveal>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="FAQ"
              title="Frequently Asked Questions"
              subtitle="Quick answers to common support questions."
            />
            <div className="mt-10 space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <Reveal key={faq.question} delay={index * 0.04}>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
                      >
                        <span className="text-base font-semibold text-slate-900">{faq.question}</span>
                        {isOpen ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28 }}
                            className="px-5 pb-5 text-sm leading-7 text-slate-600"
                          >
                            {faq.answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr_1fr]">
              <Reveal>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                      <Activity className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold">Platform Status</h3>
                  </div>
                  <div className="mt-6 space-y-3 text-sm text-slate-200">
                    {systemStatus.map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>{item} — Operational</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-red-300 transition hover:text-red-200">
                    View Status Details
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </Reveal>

              <Reveal delay={0.06}>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold">Community Support Network</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Connect with local coordinators and community moderators for guidance.
                  </p>
                  <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                    Find Local Coordinator
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-200">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold">Our Commitment</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    We are committed to keeping Jirani Alert reliable, secure, and available when communities need it most.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-red-600 to-red-500 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-red-100">Fast Support</p>
              <h2 className="mt-4 text-4xl font-bold sm:text-5xl">Support When It Matters Most</h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-red-50">
                We’re here to ensure your safety tools always work.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Contact Support
                </Link>
                <Link
                  to="/resident/dashboard"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Return Dashboard
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Jirani Alert © 2026</p>
            <p className="mt-1 text-sm text-slate-500">Reliable help, available when communities need it most.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
            <Link to="/contact" className="transition-colors hover:text-[#153b82]">Contact</Link>
            <Link to="/privacy" className="transition-colors hover:text-[#153b82]">Privacy Policy</Link>
            <span>Terms</span>
            <Link to="/about" className="transition-colors hover:text-[#153b82]">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
