export default function SecurityPage() {
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
            <h1 className="mb-2 text-4xl font-bold tracking-tight">Security</h1>
            <p className="text-muted-foreground">
              Last Updated: November 11, 2025
            </p>
          </div>

          {/* Legal Document Content */}
          <div className="prose prose-sm prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">1. Security Commitment</h2>
              <p>
                MicroPlanner, Inc. is committed to protecting the security, integrity, and confidentiality of your data. We implement comprehensive security measures across all aspects of our operations, from infrastructure and application security to access controls and employee training.
              </p>
              <p>
                Security is not a one-time implementation but an ongoing process. We continuously monitor, update, and improve our security practices to stay ahead of emerging threats.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">2. Data Encryption</h2>
              <p className="font-semibold text-foreground">2.1 Encryption in Transit</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>TLS/SSL:</strong> All data transmitted between your device and our servers is encrypted using TLS 1.2 or higher
                </li>
                <li>
                  <strong>Certificate Management:</strong> We use industry-standard SSL/TLS certificates from trusted Certificate Authorities
                </li>
                <li>
                  <strong>API Encryption:</strong> All API communications are encrypted end-to-end
                </li>
                <li>
                  <strong>Minimum Cipher Strength:</strong> We enforce minimum 256-bit encryption for sensitive operations
                </li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">2.2 Encryption at Rest</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Database Encryption:</strong> All database files are encrypted using AES-256 encryption
                </li>
                <li>
                  <strong>File Storage:</strong> User documents and backups are encrypted at rest
                </li>
                <li>
                  <strong>Key Management:</strong> Encryption keys are securely managed and rotated regularly
                </li>
                <li>
                  <strong>Backup Encryption:</strong> All backup copies are encrypted using the same standards as production data
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">3. Infrastructure Security</h2>
              <p className="font-semibold text-foreground">3.1 Cloud Infrastructure</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Provider:</strong> We host on Amazon Web Services (AWS) in US-EAST-1 region with disaster recovery in US-WEST-2
                </li>
                <li>
                  <strong>ISO 27001 Compliant:</strong> AWS data centers are ISO 27001 and SOC 2 compliant
                </li>
                <li>
                  <strong>DDoS Protection:</strong> AWS Shield and WAF protect against distributed denial-of-service attacks
                </li>
                <li>
                  <strong>Network Isolation:</strong> Our infrastructure is deployed within Virtual Private Clouds (VPCs) with strict network controls
                </li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">3.2 Physical Security</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Physical access to AWS data centers is restricted to authorized personnel</li>
                <li>Biometric access controls and surveillance systems are in place</li>
                <li>We do not maintain on-premises servers; all data is hosted in secure, geographically distributed data centers</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">4. Application Security</h2>
              <p className="font-semibold text-foreground">4.1 Development Practices</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>OWASP Compliance:</strong> We follow OWASP Top 10 security guidelines
                </li>
                <li>
                  <strong>Secure Coding:</strong> All code is developed using secure coding practices
                </li>
                <li>
                  <strong>Code Review:</strong> All changes undergo peer review before deployment
                </li>
                <li>
                  <strong>Dependency Management:</strong> Regular scanning for vulnerable dependencies using tools like Snyk and Dependabot
                </li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">4.2 Testing and Scanning</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Static Application Security Testing (SAST):</strong> Automated scanning for code vulnerabilities
                </li>
                <li>
                  <strong>Dynamic Application Security Testing (DAST):</strong> Runtime vulnerability assessment
                </li>
                <li>
                  <strong>Penetration Testing:</strong> Third-party security firms conduct annual penetration tests
                </li>
                <li>
                  <strong>Security Audits:</strong> Regular third-party security audits and compliance reviews
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">5. Authentication and Access Control</h2>
              <p className="font-semibold text-foreground">5.1 User Authentication</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Password Requirements:</strong> Minimum 8 characters, enforcement of complexity standards
                </li>
                <li>
                  <strong>Password Hashing:</strong> Passwords are hashed using bcrypt with salt, never stored in plain text
                </li>
                <li>
                  <strong>Two-Factor Authentication (2FA):</strong> Optional 2FA using authenticator apps or SMS
                </li>
                <li>
                  <strong>Session Management:</strong> Secure session tokens with automatic expiration
                </li>
                <li>
                  <strong>Single Sign-On (SSO):</strong> Support for enterprise SSO via OAuth 2.0
                </li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">5.2 Internal Access Controls</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Role-based access control (RBAC) limits employee access to necessary systems only</li>
                <li>All administrative access is logged and monitored</li>
                <li>Multi-factor authentication required for all internal system access</li>
                <li>Regular access reviews ensure appropriate privilege levels</li>
                <li>Immediate deprovisioning of access upon employee termination</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">6. Data Protection Measures</h2>
              <p className="font-semibold text-foreground">6.1 User Data Protection</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Data is isolated per user and per workspace</li>
                <li>Cross-user data access is prevented through strict database constraints</li>
                <li>Sensitive fields are masked in logs and monitoring systems</li>
                <li>Data minimization principles limit collection to necessary information</li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">6.2 Backup and Disaster Recovery</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Automated daily backups with geographic redundancy</li>
                <li>Backups are encrypted and stored separately from production systems</li>
                <li>Recovery Point Objective (RPO): 1 hour</li>
                <li>Recovery Time Objective (RTO): 4 hours</li>
                <li>Quarterly disaster recovery drills ensure effectiveness</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">7. Third-Party Security</h2>
              <p>
                All third-party service providers that access customer data are subject to rigorous security assessments:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Security questionnaires and vendor risk assessments before engagement</li>
                <li>Contracts include mandatory data protection and confidentiality clauses</li>
                <li>Regular audits and compliance monitoring of third-party providers</li>
                <li>Immediate notification requirements for security incidents</li>
                <li>Data Processing Agreements (DPAs) in place for GDPR compliance</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">8. Compliance and Certifications</h2>
              <p className="font-semibold text-foreground">8.1 Current Certifications</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>SOC 2 Type II:</strong> Compliant with Service Organization Control standards
                </li>
                <li>
                  <strong>ISO 27001:</strong> Information security management system certified
                </li>
                <li>
                  <strong>GDPR:</strong> Fully compliant with European data protection regulations
                </li>
                <li>
                  <strong>CCPA:</strong> Compliant with California Consumer Privacy Act
                </li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">8.2 Compliance Standards</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>HIPAA-compatible infrastructure (healthcare compliance)</li>
                <li>PCI DSS compliance for payment processing</li>
                <li>NIST Cybersecurity Framework alignment</li>
                <li>Regular compliance audits by independent third parties</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">9. Monitoring and Incident Response</h2>
              <p className="font-semibold text-foreground">9.1 Security Monitoring</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>24/7 security monitoring and threat detection</li>
                <li>Automated alerts for suspicious activities and anomalies</li>
                <li>Web Application Firewall (WAF) protecting against common attacks</li>
                <li>Intrusion Detection System (IDS) for network monitoring</li>
                <li>Security Information and Event Management (SIEM) system aggregating security logs</li>
              </ul>

              <p className="mt-4 font-semibold text-foreground">9.2 Incident Response Plan</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Formal incident response plan with defined roles and procedures</li>
                <li>Immediate investigation of security incidents</li>
                <li>Customer notification within 24 hours of confirmed data breach</li>
                <li>Cooperation with law enforcement as appropriate</li>
                <li>Post-incident review and continuous improvement</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">10. Vulnerability Management</h2>
              <p>
                We maintain a proactive vulnerability management program:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Regular vulnerability assessments and security scans</li>
                <li>Prompt patching of identified vulnerabilities within 48 hours for critical issues</li>
                <li>Bug bounty program to encourage responsible disclosure (see Responsible Disclosure page)</li>
                <li>Coordination with security researchers and industry peers</li>
                <li>Tracking of all vulnerabilities and remediation status</li>
              </ul>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">11. Employee Security</h2>
              <p>
                Our employees receive ongoing security training and are bound by strict confidentiality agreements:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Annual security awareness training for all employees</li>
                <li>Specialized training for developers on secure coding practices</li>
                <li>Background checks for all employees with access to customer data</li>
                <li>Signed non-disclosure agreements and confidentiality commitments</li>
                <li>Clean desk policy for sensitive information</li>
                <li>Secure device management with encryption and automatic locking</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">12. AI and Machine Learning Security</h2>
              <p>
                MicroPlanner uses AI (Claude Sonnet) to provide personalized planning. Security measures for AI systems include:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>No training of public AI models on customer data</li>
                <li>Encrypted transmission of data to AI processing systems</li>
                <li>Immediate deletion of temporary processing data</li>
                <li>No retention of personal information for model improvement</li>
                <li>Audit logging of all AI processing requests</li>
              </ul>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">13. Security Updates and Patches</h2>
              <p>
                We maintain a regular patching schedule:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Operating system and infrastructure patches: Monthly or as needed</li>
                <li>Application updates: Continuous deployment with security releases</li>
                <li>Dependency updates: Weekly scanning with immediate patching for critical vulnerabilities</li>
                <li>Security patches deployed outside normal maintenance windows when necessary</li>
              </ul>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">14. Reporting Security Issues</h2>
              <p>
                If you discover a security vulnerability, please report it responsibly. See our <a href="/legal/disclosure" className="text-primary-500 hover:text-primary-400">Responsible Disclosure Policy</a> for detailed instructions.
              </p>
              <div className="ml-6 mt-4 space-y-2 border-l-2 border-primary-500/50 pl-4">
                <p>
                  <strong>Email:</strong> security@microplanner.ai
                </p>
                <p>
                  Please do not disclose vulnerabilities publicly before we have had time to fix them.
                </p>
              </div>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">15. Contact Information</h2>
              <p>
                For security concerns or questions about our security practices, please contact:
              </p>
              <div className="ml-6 mt-4 space-y-2 border-l-2 border-primary-500/50 pl-4">
                <p className="font-semibold text-foreground">MicroPlanner Security Team</p>
                <p>Email: security@microplanner.ai</p>
                <p>Website: microplanner.ai</p>
                <p>Address: San Francisco, California, USA</p>
              </div>
            </section>
          </div>

          {/* Footer Notice */}
          <div className="mt-12 border-t border-border/40 pt-8">
            <p className="text-xs text-muted-foreground">
              This Security page was last updated on November 11, 2025. We recommend reviewing this page periodically for any updates to our security practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
