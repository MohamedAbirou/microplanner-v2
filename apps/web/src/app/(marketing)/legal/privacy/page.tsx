export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-secondary-700/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="mb-2 text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last Updated: November 11, 2025
            </p>
          </div>

          {/* Legal Document Content */}
          <div className="prose prose-sm prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">1. Introduction</h2>
              <p>
                MicroPlanner, Inc. ("Company," "we," "us," "our," or "MicroPlanner") is committed to protecting your privacy and ensuring you have a positive experience on our website and platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, web application, mobile application, and related services (collectively, the "Service").
              </p>
              <p>
                Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">2. Information We Collect</h2>
              <p className="font-semibold text-foreground">2.1 Information You Provide Directly</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Account Information:</strong> Name, email address, phone number, company name, job title, and billing information
                </li>
                <li>
                  <strong>Profile Information:</strong> Profile picture, timezone, preferences, and communication settings
                </li>
                <li>
                  <strong>Calendar and Task Data:</strong> Goals, tasks, events, schedules, notes, and productivity data you upload or create
                </li>
                <li>
                  <strong>Communications:</strong> Messages, feedback, support requests, and correspondence you send to us
                </li>
                <li>
                  <strong>Payment Information:</strong> Billing address, payment method details (processed securely by our payment provider)
                </li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">2.2 Information Collected Automatically</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Device Information:</strong> Device type, operating system, browser type, IP address, and device identifiers
                </li>
                <li>
                  <strong>Usage Information:</strong> Pages visited, features used, time spent, clicks, and interactions with the Service
                </li>
                <li>
                  <strong>Location Information:</strong> Approximate location based on IP address (not precise GPS)
                </li>
                <li>
                  <strong>Cookies and Similar Technologies:</strong> Tracking technologies to remember your preferences and usage patterns
                </li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">2.3 Information from Third-Party Services</p>
              <p>
                When you integrate your MicroPlanner account with third-party services (Google Calendar, Slack, Zoom, etc.), we collect information as necessary to provide the integration, including:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Calendar events and availability</li>
                <li>User profile information from integrated services</li>
                <li>Authentication tokens and permissions you grant</li>
                <li>Any data you authorize us to access from these services</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
              <p>MicroPlanner uses the information we collect for the following purposes:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>To provide, maintain, and improve the Service</li>
                <li>To personalize and optimize your experience</li>
                <li>To generate AI-powered planning recommendations using Claude Sonnet</li>
                <li>To process payments and send billing-related communications</li>
                <li>To send service announcements and updates</li>
                <li>To respond to support requests and customer inquiries</li>
                <li>To analyze usage patterns and service performance</li>
                <li>To prevent fraud, security breaches, and abuse</li>
                <li>To comply with legal obligations and enforce our agreements</li>
                <li>To conduct marketing and promotional activities (with your consent)</li>
                <li>To improve our AI models and machine learning algorithms</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">4. Data Sharing and Disclosure</h2>
              <p>
                MicroPlanner does not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Service Providers:</strong> With vendors who assist us in operating the Service (hosting providers, payment processors, analytics providers) under confidentiality agreements
                </li>
                <li>
                  <strong>Third-Party Integrations:</strong> With services you've authorized (Google, Slack, Zoom, etc.) only as necessary for the integration to function
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law, court order, or government request
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of merger, acquisition, or sale of assets, user information may be transferred as part of that transaction
                </li>
                <li>
                  <strong>Aggregated Data:</strong> We may share anonymized, aggregated analytics and insights
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">5. Cookies and Similar Technologies</h2>
              <p>
                MicroPlanner uses cookies and similar tracking technologies to enhance your experience. These include:
              </p>
              <p className="mt-2 font-semibold text-foreground">5.1 Types of Cookies</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Essential Cookies:</strong> Necessary for authentication, security, and basic functionality
                </li>
                <li>
                  <strong>Performance Cookies:</strong> Track usage patterns to improve Service performance and reliability
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Collect data about how you use the Service (Google Analytics, Mixpanel)
                </li>
                <li>
                  <strong>Marketing Cookies:</strong> Used to deliver targeted advertising and track marketing effectiveness
                </li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">5.2 Cookie Management</p>
              <p>
                You can control cookies through your browser settings. Most browsers allow you to refuse cookies or alert you when cookies are being sent. However, blocking essential cookies may impair the functionality of the Service.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">6. Data Security</h2>
              <p>
                MicroPlanner implements comprehensive security measures to protect your information from unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>All data transmitted between your device and our servers is encrypted using industry-standard TLS/SSL encryption</li>
                <li>User passwords are hashed using bcrypt or similar algorithms and never stored in plain text</li>
                <li>Data at rest is encrypted using AES-256 encryption or equivalent</li>
                <li>We maintain physical, electronic, and procedural safeguards</li>
                <li>Access to personal information is restricted to authorized employees on a need-to-know basis</li>
                <li>Regular security audits and penetration testing are conducted</li>
                <li>We comply with SOC 2 Type II standards and maintain relevant security certifications</li>
              </ul>
              <p className="mt-4">
                While we implement robust security measures, no system is completely secure. We cannot guarantee absolute security of your information.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">7. GDPR Compliance (European Users)</h2>
              <p>
                If you are located in the European Union, United Kingdom, or European Economic Area, the General Data Protection Regulation (GDPR) applies to your personal data:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Legal Basis for Processing:</strong> We process your data based on your consent, contractual necessity, legitimate business interests, and legal compliance
                </li>
                <li>
                  <strong>Your Rights:</strong> You have the right to access, correct, delete, and port your personal data
                </li>
                <li>
                  <strong>Data Subject Requests:</strong> You can submit requests to exercise your rights at privacy@microplanner.ai
                </li>
                <li>
                  <strong>Data Protection Officer:</strong> You can contact our DPO at dpo@microplanner.ai
                </li>
                <li>
                  <strong>Data Transfers:</strong> We use Standard Contractual Clauses to comply with GDPR requirements for international data transfers
                </li>
                <li>
                  <strong>Right to Lodge a Complaint:</strong> You have the right to file a complaint with your local data protection authority
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">8. CCPA Compliance (California Users)</h2>
              <p>
                If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with the following rights:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Right to Know:</strong> You can request what personal information we collect and how it is used
                </li>
                <li>
                  <strong>Right to Delete:</strong> You can request deletion of personal information we have collected
                </li>
                <li>
                  <strong>Right to Opt-Out:</strong> You can opt out of the sale or sharing of your personal information (we do not sell your data)
                </li>
                <li>
                  <strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA rights
                </li>
              </ul>
              <p className="mt-4">
                To exercise your CCPA rights, please submit a request to privacy@microplanner.ai with verification of your identity.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">9. Data Retention</h2>
              <p>
                We retain your personal information as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Account data is retained while your account is active and for 30 days after deletion</li>
                <li>Calendar and task data is retained for the duration of your subscription</li>
                <li>Backup copies may be retained for up to 90 days for disaster recovery purposes</li>
                <li>Payment and billing records are retained for 7 years for tax and legal compliance</li>
                <li>Analytics and usage data are retained for 24 months</li>
              </ul>
              <p className="mt-4">
                You can request permanent deletion of your account and associated data at any time.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">10. Children's Privacy</h2>
              <p>
                MicroPlanner is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected information from a child under 18, we will take steps to delete such information and terminate the child's account.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">11. Third-Party Links</h2>
              <p>
                The Service may contain links to third-party websites and services. MicroPlanner is not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party services before providing your information.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">12. AI and Machine Learning</h2>
              <p>
                MicroPlanner uses artificial intelligence, including Claude Sonnet, to provide personalized planning recommendations. Your data is processed to:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Generate AI-powered weekly plans based on your goals and preferences</li>
                <li>Improve AI model accuracy through anonymized usage patterns</li>
                <li>Provide predictive insights about your productivity</li>
              </ul>
              <p className="mt-4">
                We do not use your personal data to train public AI models. All AI processing is performed securely, and your data remains confidential.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">13. Contact Information and Privacy Requests</h2>
              <p>
                If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us at:
              </p>
              <div className="ml-6 mt-4 space-y-2 border-l-2 border-primary-500/50 pl-4">
                <p className="font-semibold text-foreground">MicroPlanner, Inc. Privacy Team</p>
                <p>Email: privacy@microplanner.ai</p>
                <p>DPO: dpo@microplanner.ai</p>
                <p>Website: microplanner.ai</p>
                <p>Address: San Francisco, California, USA</p>
              </div>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">14. Changes to This Privacy Policy</h2>
              <p>
                MicroPlanner reserves the right to modify this Privacy Policy at any time. Changes will be effective immediately upon posting. Your continued use of the Service constitutes acceptance of the revised Privacy Policy. We will notify users of significant changes via email or prominent notice on the Service.
              </p>
            </section>
          </div>

          {/* Footer Notice */}
          <div className="mt-12 border-t border-border/40 pt-8">
            <p className="text-xs text-muted-foreground">
              This Privacy Policy was last updated on November 11, 2025. We recommend reviewing this policy periodically for any changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
