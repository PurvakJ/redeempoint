import React from "react";
import { Link } from "react-router-dom";
import "./PrivacyPolicy.css";

export default function PrivacyPolicy() {
  return (
    <main className="privacy-page">
      <div className="privacy-container">
        <header className="privacy-header">
          <Link to="/" className="privacy-back-link">← Back to GREYSTONE</Link>
          <h1>Privacy Policy</h1>
          <p>Last updated: September 4, 2026</p>
        </header>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to Greystone Ply. We respect your privacy and are committed
            to protecting the personal information you provide while using our
            website, products, and services.
          </p>
          <p>
            This Privacy Policy explains what information we may collect, how
            we use it, how we protect it, and your choices regarding your
            information.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>We may collect information that you voluntarily provide to us, including:</p>
          <ul>
            <li>Your name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Company or business name</li>
            <li>Delivery or contact address</li>
            <li>Product enquiries and requirements</li>
            <li>Any other information you submit through our forms</li>
          </ul>
          <p>
            We may also automatically collect limited technical information,
            such as browser type, device information, IP address, pages visited,
            and general website usage information.
          </p>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We may use the information we collect to:</p>
          <ul>
            <li>Respond to your enquiries and requests</li>
            <li>Provide information about our products and services</li>
            <li>Process and manage orders or business enquiries</li>
            <li>Contact you regarding your enquiry</li>
            <li>Improve our website and customer experience</li>
            <li>Maintain website security and prevent misuse</li>
            <li>Comply with applicable legal requirements</li>
          </ul>
        </section>

        <section>
          <h2>4. Communication</h2>
          <p>
            If you provide your phone number or email address through our
            website, we may contact you regarding your enquiry, products,
            services, quotations, or other information related to your request.
          </p>
          <p>You may request that we stop sending promotional communications at any time.</p>
        </section>

        <section>
          <h2>5. Cookies</h2>
          <p>
            Our website may use cookies and similar technologies to improve
            website functionality, understand website traffic, remember
            preferences, and improve the user experience.
          </p>
          <p>
            You can control or disable cookies through your browser settings.
            Disabling certain cookies may affect some website functionality.
          </p>
        </section>

        <section>
          <h2>6. Sharing of Information</h2>
          <p>We do not sell or rent your personal information to third parties.</p>
          <p>
            We may share information with trusted service providers when
            necessary to operate our website, respond to enquiries, provide
            services, process transactions, or comply with legal obligations.
          </p>
        </section>

        <section>
          <h2>7. Data Security</h2>
          <p>
            We take reasonable administrative, technical, and organizational
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction.
          </p>
          <p>
            However, no method of transmission or electronic storage is
            completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>8. Data Retention</h2>
          <p>
            We retain personal information only for as long as reasonably
            necessary for the purposes described in this Privacy Policy, to
            provide our services, resolve disputes, maintain business records,
            or comply with applicable legal obligations.
          </p>
        </section>

        <section>
          <h2>9. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites or services.
            We are not responsible for the privacy practices, content, or
            security of third-party websites.
          </p>
        </section>

        <section>
          <h2>10. Children's Privacy</h2>
          <p>
            Our website and services are not specifically directed toward
            children. We do not knowingly collect personal information from
            children without appropriate consent where required by law.
          </p>
        </section>

        <section>
          <h2>11. Your Rights</h2>
          <p>
            Depending on applicable law, you may have the right to request
            access to, correction of, or deletion of your personal information.
          </p>
        </section>

        <section>
          <h2>12. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices, services, or legal requirements.
          </p>
          <p>
            Any updated version will be published on this page with a revised
            "Last updated" date.
          </p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>
            If you have questions, concerns, or requests regarding this Privacy
            Policy or your personal information, please contact Greystone Ply.
          </p>
          <div className="contact-box">
            <p><strong>Greystone Ply</strong></p>
            <p>Email: greystoneply@gmail.com</p>
            <p>Phone: +91 88378 22231</p>
            <p>Website: https://greystoneply.vercel.app/</p>
          </div>
        </section>

        <footer className="privacy-footer">
          © 2026 Greystone Ply. All rights reserved.
        </footer>
      </div>
    </main>
  );
}