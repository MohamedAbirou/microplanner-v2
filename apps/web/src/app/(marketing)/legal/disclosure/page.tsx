export default function DisclosurePage() {
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
            <h1 className="mb-2 text-4xl font-bold tracking-tight">Responsible Disclosure Policy</h1>
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
                MicroPlanner, Inc. is committed to ensuring the security of our platform and protecting our users' data. We recognize that security researchers and ethical hackers play a vital role in identifying vulnerabilities that could compromise our systems. This Responsible Disclosure Policy outlines how we request that security vulnerabilities be reported to us and how we will respond to such reports.
              </p>
              <p>
                We appreciate your efforts to responsibly disclose security vulnerabilities and commit to working transparently with you to resolve any issues.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">2. Scope</h2>
              <p>
                This Responsible Disclosure Policy applies to all security vulnerabilities discovered in:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>microplanner.ai and all subdomains</li>
                <li>MicroPlanner web application</li>
                <li>MicroPlanner mobile applications (iOS and Android)</li>
                <li>MicroPlanner APIs and backend services</li>
                <li>Third-party integrations provided by MicroPlanner</li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">Out of Scope:</p>
              <p>
                The following are explicitly out of scope for this disclosure program:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Third-party services integrated with MicroPlanner (Google, Slack, Zoom, etc.)</li>
                <li>Social engineering attacks or phishing</li>
                <li>Attacks on infrastructure not owned or controlled by MicroPlanner</li>
                <li>Brute force attacks on user accounts</li>
                <li>Issues affecting only deprecated or unsupported platforms</li>
                <li>Vulnerabilities in end-user misconfiguration</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">3. Vulnerability Categories</h2>
              <p>
                We prioritize the following types of vulnerabilities, from highest to lowest severity:
              </p>

              <p className="mt-4 font-semibold text-foreground">Critical (0-48 hours to fix)</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Remote code execution (RCE)</li>
                <li>Authentication bypass</li>
                <li>Unauthorized data access across user accounts</li>
                <li>SQL injection or NoSQL injection</li>
                <li>Server-side request forgery (SSRF)</li>
                <li>Cryptographic vulnerabilities affecting user data</li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">High (7 days to fix)</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Information disclosure of sensitive data</li>
                <li>Cross-site scripting (XSS) in sensitive areas</li>
                <li>Cross-site request forgery (CSRF)</li>
                <li>Insecure deserialization</li>
                <li>Privilege escalation</li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">Medium (30 days to fix)</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Reflected XSS in non-sensitive areas</li>
                <li>Open redirect vulnerabilities</li>
                <li>Missing security headers</li>
                <li>Insecure configuration issues</li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">Low (90 days to fix)</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Verbose error messages</li>
                <li>Weak password policies</li>
                <li>Informational issues</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">4. How to Report a Vulnerability</h2>
              <p className="font-semibold text-foreground">4.1 Reporting Channel</p>
              <p>
                Please report security vulnerabilities directly to our Security Team at:
              </p>
              <div className="ml-6 mt-4 space-y-2 border-l-2 border-primary-500/50 pl-4">
                <p className="font-semibold text-foreground">Email: security@microplanner.ai</p>
                <p>PGP Key available upon request for encrypted communication</p>
              </div>

              <p className="mt-6 font-semibold text-foreground">4.2 What to Include in Your Report</p>
              <p>
                Please provide the following information with your vulnerability report:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Vulnerability Description:</strong> Clear and detailed description of the vulnerability
                </li>
                <li>
                  <strong>Affected Components:</strong> Which parts of MicroPlanner are affected (URLs, APIs, features)
                </li>
                <li>
                  <strong>Vulnerability Type:</strong> Category (e.g., XSS, SQL injection, authentication bypass)
                </li>
                <li>
                  <strong>Steps to Reproduce:</strong> Detailed, step-by-step instructions to reproduce the issue
                </li>
                <li>
                  <strong>Proof of Concept:</strong> If applicable, a proof of concept or screenshot demonstrating the vulnerability
                </li>
                <li>
                  <strong>Impact Assessment:</strong> Explanation of the potential impact and severity
                </li>
                <li>
                  <strong>Your Information:</strong> Your name, email, and preferred contact method
                </li>
                <li>
                  <strong>Researcher Details:</strong> Your organization (if applicable) and website/blog
                </li>
              </ul>

              <p className="mt-6 font-semibold text-foreground">4.3 Good Practices</p>
              <p>
                To help us resolve issues efficiently, please:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Be specific and detailed in your descriptions</li>
                <li>Use clear, concise language</li>
                <li>Provide screenshots or videos if helpful</li>
                <li>Test your findings thoroughly before reporting</li>
                <li>Avoid causing any damage to the system or data</li>
                <li>Do not attempt to access other users' accounts or data</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">5. Expected Response Timeline</h2>
              <p className="font-semibold text-foreground">5.1 Initial Acknowledgment</p>
              <p>
                We aim to acknowledge receipt of your vulnerability report within 24 hours. This acknowledgment will include a ticket number for tracking your report.
              </p>

              <p className="mt-4 font-semibold text-foreground">5.2 Investigation and Assessment</p>
              <p>
                Our security team will investigate the vulnerability and assess its severity. You can expect:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Initial assessment within 48 hours of receipt</li>
                <li>Regular updates on the status of our investigation</li>
                <li>Clarifying questions if we need additional information</li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">5.3 Remediation Timeline</p>
              <p>
                We commit to fixing vulnerabilities according to the severity classification outlined in Section 3.
              </p>

              <p className="mt-4 font-semibold text-foreground">5.4 Disclosure Coordination</p>
              <p>
                Once a fix has been implemented, we will:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Notify you of the fix and deployment timeline</li>
                <li>Coordinate a disclosure date with you (typically 30 days after fix deployment)</li>
                <li>Request your approval before disclosing publicly</li>
                <li>Provide credit in our security advisory if you wish to be named</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">6. Responsible Disclosure Expectations</h2>
              <p>
                To participate in this program, we ask that you:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Do Not Disclose Publicly:</strong> Do not disclose the vulnerability publicly or to third parties without MicroPlanner's written permission
                </li>
                <li>
                  <strong>Give Us Time:</strong> Provide MicroPlanner a reasonable amount of time (30-90 days depending on severity) to fix the vulnerability before public disclosure
                </li>
                <li>
                  <strong>No Unauthorized Access:</strong> Do not access, modify, or destroy data; limit testing to reproduction of the vulnerability
                </li>
                <li>
                  <strong>No Malicious Activity:</strong> Do not engage in any illegal activity, disruption of services, or harm to users
                </li>
                <li>
                  <strong>Maintain Confidentiality:</strong> Do not discuss the vulnerability with others without our permission
                </li>
                <li>
                  <strong>Follow the Law:</strong> Comply with all applicable laws and regulations in your jurisdiction
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">7. Safe Harbor</h2>
              <p>
                MicroPlanner will not pursue legal action against researchers who:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Follow this Responsible Disclosure Policy</li>
                <li>Report vulnerabilities in good faith</li>
                <li>Do not intentionally damage systems or data</li>
                <li>Do not access unauthorized data</li>
                <li>Do not disclose vulnerabilities publicly without permission</li>
                <li>Comply with all applicable laws during testing</li>
              </ul>
              <p className="mt-4">
                This safe harbor applies only to activities directly related to reporting and responding to a vulnerability.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">8. Bug Bounty Program</h2>
              <p>
                MicroPlanner may offer rewards for valid vulnerability reports through our bug bounty program. Reward amounts are determined based on:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Severity:</strong> Critical vulnerabilities receive higher rewards
                </li>
                <li>
                  <strong>Impact:</strong> Vulnerabilities with broader impact receive higher rewards
                </li>
                <li>
                  <strong>Quality of Report:</strong> Clear, well-documented reports are valued
                </li>
                <li>
                  <strong>Cooperation:</strong> Researchers who work closely with our team may receive higher rewards
                </li>
              </ul>
              <p className="mt-4">
                Bug bounty eligibility and amounts are at MicroPlanner's sole discretion. Not all vulnerabilities may qualify for bounties.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">9. Vulnerability Disclosure Process</h2>
              <p>
                Our vulnerability disclosure process follows these steps:
              </p>
              <ol className="ml-6 list-decimal space-y-2">
                <li>Researcher submits vulnerability report to security@microplanner.ai</li>
                <li>We acknowledge receipt within 24 hours with a ticket number</li>
                <li>Our security team investigates and assesses severity</li>
                <li>We develop and test a fix</li>
                <li>Fix is deployed to production</li>
                <li>We notify the researcher of the fix and deployment date</li>
                <li>We coordinate a public disclosure date (typically 30 days after fix)</li>
                <li>Public advisory is published with credit to the researcher (if approved)</li>
              </ol>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">10. Public Disclosure</h2>
              <p>
                Once a vulnerability has been fixed, we will publish a security advisory that includes:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Description of the vulnerability</li>
                <li>Affected versions and components</li>
                <li>Severity assessment (Critical, High, Medium, Low)</li>
                <li>Recommended actions for affected users</li>
                <li>Details about the fix and deployment date</li>
                <li>Credit to the researcher (if approved)</li>
              </ul>
              <p className="mt-4">
                Public disclosure will not occur before a fix is deployed and users have been given time to update.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">11. Third-Party Vulnerability Disclosure</h2>
              <p>
                If you discover a vulnerability in a third-party service integrated with MicroPlanner (Google Calendar, Slack, Zoom, etc.), please report it directly to that service's security team, not to MicroPlanner. Most major services have their own responsible disclosure programs.
              </p>
              <p>
                If you believe the vulnerability may impact MicroPlanner users through the integration, please also notify us at security@microplanner.ai so we can assess the impact.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">12. Non-Disclosure Agreement (NDA)</h2>
              <p>
                Researchers working on particularly sensitive vulnerabilities may be asked to sign a mutual NDA. This protects both parties and ensures that vulnerability details remain confidential until a fix is deployed.
              </p>
              <p>
                An NDA does not prevent you from discussing your general security research or the patching process with others, only the specific vulnerability details.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">13. Policy Changes</h2>
              <p>
                MicroPlanner reserves the right to update this Responsible Disclosure Policy at any time. Significant changes will be announced on our website and via email to active security researchers.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">14. Frequently Asked Questions</h2>

              <p className="mt-4 font-semibold text-foreground">Q: Will you prosecute me for testing the vulnerability?</p>
              <p>
                A: No. As long as you follow this Responsible Disclosure Policy and comply with applicable laws, we will not take legal action. We appreciate your work in identifying and responsibly reporting vulnerabilities.
              </p>

              <p className="mt-4 font-semibold text-foreground">Q: How long will it take you to fix the vulnerability?</p>
              <p>
                A: This depends on severity (see Section 3). Critical vulnerabilities are fixed within 48 hours, while lower-severity issues may take longer. We'll keep you updated throughout the process.
              </p>

              <p className="mt-4 font-semibold text-foreground">Q: Can I disclose the vulnerability after you've fixed it?</p>
              <p>
                A: Yes, after we've deployed a fix and coordinated a disclosure date with you (typically 30 days after fix deployment), you're welcome to discuss the vulnerability publicly.
              </p>

              <p className="mt-4 font-semibold text-foreground">Q: Will I be credited for finding the vulnerability?</p>
              <p>
                A: Yes, if you wish to be named. You can choose to be credited as an individual, your organization, or anonymously. We'll include your name, blog, or social media handle in the security advisory if you prefer.
              </p>

              <p className="mt-4 font-semibold text-foreground">Q: What if I find multiple vulnerabilities?</p>
              <p>
                A: Please report them separately with individual ticket numbers. This helps us track and prioritize each issue appropriately.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">15. Contact Information</h2>
              <p>
                For security vulnerabilities, questions about this policy, or to initiate responsible disclosure:
              </p>
              <div className="ml-6 mt-4 space-y-2 border-l-2 border-primary-500/50 pl-4">
                <p className="font-semibold text-foreground">MicroPlanner Security Team</p>
                <p>
                  <strong>Email:</strong> security@microplanner.ai
                </p>
                <p>
                  <strong>Response Time:</strong> Within 24 hours
                </p>
                <p>
                  <strong>Website:</strong> microplanner.ai
                </p>
                <p>
                  <strong>Address:</strong> San Francisco, California, USA
                </p>
              </div>
            </section>
          </div>

          {/* Footer Notice */}
          <div className="mt-12 border-t border-border/40 pt-8">
            <p className="text-xs text-muted-foreground">
              This Responsible Disclosure Policy was last updated on November 11, 2025. We appreciate your contributions to making MicroPlanner more secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
