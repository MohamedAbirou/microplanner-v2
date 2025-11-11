export default function TermsPage() {
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
            <h1 className="mb-2 text-4xl font-bold tracking-tight">Terms of Use</h1>
            <p className="text-muted-foreground">
              Last Updated: November 11, 2025
            </p>
          </div>

          {/* Legal Document Content */}
          <div className="prose prose-sm prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">1. Agreement to Terms</h2>
              <p>
                These Terms of Use ("Terms") constitute a legal agreement between you and MicroPlanner, Inc. ("Company," "we," "us," or "our"). By accessing and using the MicroPlanner platform, website, and services (collectively, the "Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Service. Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">2. Eligibility and Registration</h2>
              <p>
                By using MicroPlanner, you represent that you are at least 18 years of age and possess the legal authority to enter into this agreement. If you are registering on behalf of a company or organization, you represent that you have the authority to bind that entity to these Terms.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your account login credentials and password. You agree to provide accurate, current, and complete information during registration and to promptly update information to maintain its accuracy. You are solely responsible for all activities that occur under your account.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">3. Acceptable Use Policy</h2>
              <p>You agree not to use the Service in any way that:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Violates any applicable laws or regulations</li>
                <li>Infringes upon the intellectual property rights of others</li>
                <li>Contains malware, viruses, or any code of destructive nature</li>
                <li>Harasses, threatens, or harms others</li>
                <li>Impersonates any person or entity</li>
                <li>Attempts to gain unauthorized access to our systems or networks</li>
                <li>Disrupts the normal operation of the Service</li>
                <li>Uses the Service to send unsolicited messages or spam</li>
                <li>Involves any form of automated scraping or data collection without permission</li>
                <li>Reverse engineers, decompiles, or attempts to discover the source code</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">4. User Content and Rights</h2>
              <p>
                You retain all rights to any content you upload, create, or submit to the Service ("User Content"). By submitting User Content, you grant MicroPlanner a worldwide, non-exclusive, royalty-free, perpetual license to use, reproduce, modify, publish, and distribute your User Content solely for the purpose of providing and improving the Service.
              </p>
              <p>
                You represent and warrant that your User Content does not infringe upon the rights of any third party, including intellectual property rights, privacy rights, or publicity rights. You assume all liability for User Content and agree to indemnify us against any claims arising from your User Content.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">5. Intellectual Property Rights</h2>
              <p>
                The Service, including all content, features, functionality, software, designs, and materials, is owned by MicroPlanner or our licensors and is protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                Except as expressly permitted in these Terms, you may not reproduce, distribute, transmit, adapt, or create derivative works of the Service without our prior written consent. You may not use our trademarks, logos, or brand names without our express written permission.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">6. Payment Terms and Billing</h2>
              <p>
                Some features of the Service require payment ("Paid Services"). By selecting a paid plan, you authorize us to charge your payment method for the fees associated with your selected plan, plus any applicable taxes.
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>All fees are in US Dollars unless otherwise specified</li>
                <li>Billing occurs monthly on the date you selected your plan</li>
                <li>You are responsible for providing accurate payment information</li>
                <li>Failed payments may result in service suspension</li>
                <li>We may increase prices with 30 days' notice</li>
                <li>All sales are final; refunds are not available except as required by law</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">7. Subscription and Cancellation</h2>
              <p>
                Paid subscriptions automatically renew at the end of each billing period unless you cancel. You can cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period, and no refund will be issued for unused portions of the billing period.
              </p>
              <p>
                If you request a refund within 14 days of your initial purchase and have not used the Service, we may issue a full refund at our discretion.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">8. Third-Party Services and Integrations</h2>
              <p>
                The Service may integrate with or include links to third-party services, including Google Calendar, Slack, Zoom, Notion, and others. Your use of these third-party services is governed by their respective terms of service and privacy policies. MicroPlanner is not responsible for the content, functionality, or security of third-party services.
              </p>
              <p>
                You are responsible for maintaining your own security credentials for integrated services and assume all liability for unauthorized access through third-party integrations.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">9. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. MICROPLANNER MAKES NO WARRANTIES, EXPRESS OR IMPLIED, REGARDING THE SERVICE, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p>
                We do not warrant that the Service will be uninterrupted, error-free, secure, or free from viruses or other harmful components. Your use of the Service is at your sole risk.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">10. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MICROPLANNER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF DATA, REVENUE, OR PROFITS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p>
                OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU TO MICROPLANNER IN THE 12 MONTHS PRECEDING THE CLAIM. Some jurisdictions do not allow limitations on liability, so this limitation may not apply to you.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">11. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless MicroPlanner and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from or related to your use of the Service, your violation of these Terms, or your violation of any rights of third parties.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">12. Termination</h2>
              <p>
                Either party may terminate the use of the Service at any time. MicroPlanner may terminate or suspend your account immediately if you violate these Terms or engage in conduct harmful to MicroPlanner or other users. Upon termination, your right to use the Service ceases immediately.
              </p>
              <p>
                Following termination, some data may be deleted or archived in accordance with our privacy policy and backup retention procedures.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">13. Governing Law and Dispute Resolution</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of California, USA, without regard to its conflict of law principles. Any legal action or proceeding arising under these Terms shall be brought exclusively in the state or federal courts located in California.
              </p>
              <p>
                Before filing a claim, you agree to attempt to resolve any dispute informally by contacting us at legal@microplanner.ai.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">14. Severability</h2>
              <p>
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">15. Contact Information</h2>
              <p>
                If you have questions about these Terms of Use, please contact us at:
              </p>
              <div className="ml-6 mt-4 space-y-2 border-l-2 border-primary-500/50 pl-4">
                <p className="font-semibold text-foreground">MicroPlanner, Inc.</p>
                <p>Email: legal@microplanner.ai</p>
                <p>Website: microplanner.ai</p>
                <p>Address: San Francisco, California, USA</p>
              </div>
            </section>
          </div>

          {/* Footer Notice */}
          <div className="mt-12 border-t border-border/40 pt-8">
            <p className="text-xs text-muted-foreground">
              These Terms of Use were last updated on November 11, 2025. We recommend reviewing this page periodically for any changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
