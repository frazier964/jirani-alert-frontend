import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  FileText,
  Settings,
  MapPin,
  AlertTriangle,
  Lock,
  Users,
  User,
  Archive,
  Cookie,
  RotateCw,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';

export default function Privacy() {
  const [activeSection, setActiveSection] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [controlToggles, setControlToggles] = useState({
    location: true,
    alerts: true,
    notifications: true,
    visibility: false,
  });
  const contentRef = useRef(null);

  const sections = [
    {
      id: 'collect',
      title: 'Information We Collect',
      icon: FileText,
      content: `We collect information to deliver Jirani Alert's safety and emergency coordination features. This includes:

• Account Information: Name, email address, phone number, and account credentials
• Location Data: Your location when you enable location services (with your permission)
• Device Information: Device type, operating system, app version, and device identifiers
• Emergency Report Details: Incident category, time, description, and approximate location when you submit a report
• Notification Preferences: Your choices about what alerts and notifications you receive
• Communication Records: Messages, support tickets, and feedback you send us
• Usage Data: How you interact with the platform and which features you use`,
    },
    {
      id: 'use',
      title: 'How We Use Your Information',
      icon: Settings,
      content: `Your information helps us deliver life-saving emergency alert services:

• Deliver Emergency Alerts: Route urgent alerts to nearby users in real-time
• Verify Incident Reports: Validate emergency reports to prevent false alarms
• Notify Nearby Users: Identify and alert community members of incidents in their area
• Improve Platform Reliability: Analyze data to enhance speed and accuracy
• Provide Support Services: Help users with account issues and platform questions
• Enhance Safety Features: Use aggregated data to improve detection and response capabilities
• Legal Compliance: Meet regulatory requirements and law enforcement requests
• Community Safety Analytics: Track trends to help emergency responders prepare better`,
    },
    {
      id: 'location',
      title: 'Location Data',
      icon: MapPin,
      content: `Location data is critical for Jirani Alert's core mission. Here's how we handle it:

Location data is only used to:
• Detect nearby incidents and deliver relevant alerts to your area
• Route emergency information to responders and nearby users
• Improve emergency response speed and accuracy
• Calculate proximity for emergency contact notifications

Important: You control location permissions. You can:
• Enable or disable location sharing at any time in Settings
• Switch between always, while-using, and never location access
• Delete location history from your account
• Use Jirani Alert without location services (with reduced alert accuracy)

Location data is encrypted in transit and at rest. We do not sell location information to third parties.`,
    },
    {
      id: 'emergency',
      title: 'Emergency Reporting Data',
      icon: AlertTriangle,
      content: `When you submit an emergency report, we collect and handle that information with utmost care:

Emergency reports may include:
• Incident category (medical, security, fire, traffic, utility, other)
• Time of incident
• Detailed description of the emergency
• Approximate location
• Attached evidence (photos or videos)
• Your contact information
• Report status and resolution

This information is used solely for:
• Emergency coordination with local responders
• Alerting nearby community members
• Improving emergency response protocols
• Training and analytics (anonymized)
• Legal protection and documentation

Anonymous Reporting: You can submit emergency reports anonymously. Anonymous reports are handled with priority to protect your identity while ensuring rapid response.`,
    },
    {
      id: 'security',
      title: 'Data Security',
      icon: Lock,
      content: `Your data security is our highest priority. We implement multiple layers of protection:

Technical Protections:
• End-to-end encryption for location and emergency data
• AES-256 encryption for data at rest
• TLS 1.3 encryption for all data in transit
• Secure authentication with bcrypt password hashing
• Multi-factor authentication (MFA) options

Operational Protections:
• Regular security audits and penetration testing
• Strict access controls and role-based permissions
• Background checks for employees with data access
• Incident response team and breach notification protocols
• Continuous monitoring for suspicious activity

Compliance:
• GDPR and privacy regulation compliance
• Regular compliance audits
• Security certifications and standards (ISO 27001)
• Annual third-party security assessments

We maintain a responsible disclosure program for security researchers. Please report vulnerabilities to security@jiranialert.com.`,
    },
    {
      id: 'sharing',
      title: 'Information Sharing',
      icon: Users,
      content: `We respect your privacy and limit data sharing strictly:

We do NOT:
• Sell your personal data to advertisers or third parties
• Share email addresses or phone numbers for marketing
• Use your data for purposes beyond platform operations
• Share location history with non-emergency contacts

We MAY share information with:
• Emergency Response Authorities: Police, fire, and medical services when responding to reports you submit
• Verified Community Coordinators: Official emergency management personnel (with explicit user consent for some data)
• Legal Obligations: Law enforcement with valid legal process (warrant, subpoena)
• Service Providers: Cloud hosting, payment processors, and analytics (under strict data processing agreements)
• Research Partners: Anonymized, aggregated data only (never personal information)

Third-Party Services:
• We use third-party services for hosting, email delivery, and analytics
• All service providers sign data processing agreements
• You can request details about specific third parties`,
    },
    {
      id: 'rights',
      title: 'Your Privacy Rights',
      icon: User,
      content: `You have important rights regarding your personal information:

Access & Portability:
• Request a copy of all your personal data
• Export your data in a readable format
• Understand what data we hold about you

Correction & Deletion:
• Update inaccurate information
• Delete your account and associated data
• Request deletion of specific data types (with exceptions for legal/safety reasons)

Control & Preferences:
• Enable or disable location sharing
• Adjust notification preferences
• Modify emergency contact information
• Control account visibility settings
• Manage communication preferences

Data Processing:
• Restrict how we process your data
• Object to certain data uses
• Withdraw consent for data processing

Special Protections:
• Right to be forgotten (with some legal exceptions)
• Right to not be subject to automated decisions
• Right to lodge complaints with data protection authorities

To exercise these rights:
1. Visit your Account Settings
2. Use the "Manage Privacy Settings" option
3. Contact privacy@jiranialert.com for complex requests

Most requests are processed within 30 days.`,
    },
    {
      id: 'retention',
      title: 'Data Retention',
      icon: Archive,
      content: `We keep data only as long as necessary:

Account Data:
• Retained while your account is active
• Deleted within 30 days of account deletion
• Some data retained for legal/compliance reasons (max 7 years)

Emergency Reports:
• Kept for 2 years for emergency response analysis
• Kept for 7 years if involved in legal proceedings
• Anonymized data kept longer for safety pattern analysis

Location Data:
• Real-time location not stored permanently
• Location history retained for 90 days
• Incident location data retained per emergency report schedule

Deleted Data:
• Securely purged from all systems
• Backups purged according to retention schedule
• Third parties notified to delete their copies

Exceptions:
• Legal obligations may require longer retention
• We may retain anonymized data indefinitely
• Court orders may prevent timely deletion

You can request immediate deletion of your data at any time, subject to legal obligations.`,
    },
    {
      id: 'cookies',
      title: 'Cookies & Analytics',
      icon: Cookie,
      content: `We use cookies and analytics to improve your experience:

Necessary Cookies:
• Session cookies for authentication
• Security tokens for account protection
• Preference cookies for language/theme settings
• Required for platform functionality

Analytics Cookies:
• Track page views and user flows
• Measure feature usage and performance
• Identify bugs and usability issues
• Understand how you interact with alerts

We use:
• Google Analytics (anonymized)
• Custom event tracking
• Crash reporting tools
• Performance monitoring

You can:
• Disable non-essential cookies in Settings
• Clear cookies anytime from your browser
• Opt out of analytics collection
• Use browser privacy mode for anonymous browsing

Note: Disabling cookies may reduce functionality. Essential cookies cannot be disabled as they're required for security.`,
    },
    {
      id: 'updates',
      title: 'Policy Updates',
      icon: RotateCw,
      content: `We may update this Privacy Policy as our platform evolves:

Changes:
• Significant changes will be announced via email
• You'll have 30 days to review before changes take effect
• Continued use constitutes acceptance of updated policy

Last Updated: May 2026

Notification:
• Major changes: Email notification + in-app notification
• Minor clarifications: Updated with notice on this page
• Critical security updates: Immediate notification

Your Options:
• Review the updated policy before it takes effect
• Contact us with questions or concerns
• Delete your account if you disagree with changes

Historical Versions:
• Previous privacy policies available upon request
• We maintain a change log of policy updates

We recommend reviewing this policy periodically to stay informed about how we protect your privacy.`,
    },
  ];

  const sectionIcons = {
    collect: FileText,
    use: Settings,
    location: MapPin,
    emergency: AlertTriangle,
    security: Lock,
    sharing: Users,
    rights: User,
    retention: Archive,
    cookies: Cookie,
    updates: RotateCw,
  };

  const scrollToSection = (index) => {
    setActiveSection(index);
    setMobileMenuOpen(false);
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleControl = (key) => {
    setControlToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-28"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Privacy Policy
              </h1>
              <p className="text-xl text-slate-200 mb-4 leading-relaxed">
                Your privacy and security are fundamental to how Jirani Alert operates.
              </p>
              <p className="text-sm text-slate-400">Last Updated: May 2026</p>
            </motion.div>

            <motion.div
              className="hidden lg:flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full blur-3xl opacity-20"></div>
                <div className="relative bg-blue-500/10 backdrop-blur border border-blue-400/20 rounded-full w-full h-full flex items-center justify-center">
                  <Shield className="w-32 h-32 text-blue-300" strokeWidth={1.5} />
                </div>
                <motion.div
                  className="absolute top-8 right-8 w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Privacy Commitment Banner */}
      <motion.section
        className="bg-slate-50 py-8 lg:py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 backdrop-blur border border-blue-200/50 rounded-2xl p-8 lg:p-10 flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Your Safety Includes Your Data Privacy
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Jirani Alert is committed to protecting your personal information while enabling effective emergency communication. We believe that trust is earned through transparency, security, and respect for your privacy rights.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Content with Sticky Sidebar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Mobile Menu Button */}
          <motion.div
            className="lg:hidden mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-4 hover:bg-slate-100 transition-colors"
            >
              <span className="font-semibold text-slate-900">Table of Contents</span>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </motion.div>

          {/* Sidebar Navigation */}
          <AnimatePresence>
            <motion.div
              className={`lg:col-span-1 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="lg:sticky lg:top-8 space-y-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4 px-3">
                  Sections
                </h3>
                {sections.map((section, index) => {
                  const IconComponent = sectionIcons[section.id];
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => scrollToSection(index)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                        activeSection === index
                          ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                          : 'text-slate-700 hover:bg-slate-50 border-l-2 border-transparent'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8" ref={contentRef}>
            {sections.map((section, index) => {
              const IconComponent = sectionIcons[section.id];
              return (
                <motion.div
                  key={section.id}
                  id={`section-${index}`}
                  className="bg-white border border-slate-200 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true, margin: '-100px' }}
                  onViewportEnter={() => setActiveSection(index)}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 pt-1">
                      {section.title}
                    </h2>
                  </div>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </motion.div>
              );
            })}

            {/* Privacy Control Center */}
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                Privacy Control Center
              </h3>
              <p className="text-slate-700 mb-8">
                Preview your privacy settings. Full controls available in your account settings.
              </p>

              <div className="space-y-4">
                {[
                  { key: 'location', label: 'Share Location', description: 'Enable location sharing for better alert accuracy' },
                  { key: 'alerts', label: 'Receive Nearby Alerts', description: 'Get notified of incidents in your area' },
                  { key: 'notifications', label: 'Emergency Contact Notifications', description: 'Receive notifications about emergency contacts' },
                  { key: 'visibility', label: 'Account Visibility', description: 'Allow others to see your profile' },
                ].map((control) => (
                  <motion.div
                    key={control.key}
                    className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-100"
                    whileHover={{ x: 4 }}
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{control.label}</p>
                      <p className="text-sm text-slate-600">{control.description}</p>
                    </div>
                    <button
                      onClick={() => toggleControl(control.key)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        controlToggles[control.key] ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                    >
                      <motion.span
                        className="inline-block h-6 w-6 transform rounded-full bg-white"
                        animate={{
                          x: controlToggles[control.key] ? 28 : 4,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    </button>
                  </motion.div>
                ))}
              </div>

              <motion.button
                className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Manage Privacy Settings
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Contact Privacy Team */}
            <motion.div
              className="bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl p-8 lg:p-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Questions About Privacy?
              </h3>
              <p className="text-slate-700 mb-8">
                Our privacy team is here to help. Reach out with any concerns or requests.
              </p>
              <div className="bg-white rounded-lg p-6 inline-block mb-8 border border-slate-200">
                <p className="text-slate-600 text-sm mb-2">Email</p>
                <p className="text-2xl font-bold text-blue-600">privacy@jiranialert.com</p>
              </div>
              <motion.button
                className="block mx-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Privacy Team
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Agreement Section */}
            <motion.div
              className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-6">
                <motion.div
                  className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-500"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Your Agreement
              </h3>
              <p className="text-slate-700 leading-relaxed">
                By using Jirani Alert, you acknowledge and agree to this Privacy Policy. If you do not agree with our practices, please do not use our platform.
              </p>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 lg:p-12 text-center text-white overflow-hidden relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  Protected by Design
                </h2>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Jirani Alert is built to protect both your community and your personal information. Your trust is our responsibility.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/"
                      className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                      Return Home
                    </Link>
                  </motion.div>
                  <motion.button
                    className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Manage Settings
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-sm">
              © 2026 Jirani Alert. All rights reserved. | Privacy-First Emergency Response Platform
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
