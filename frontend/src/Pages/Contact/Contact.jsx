import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
} from "lucide-react";

import Footer from "../../components/home/Footer";
import Navbar from "../../components/commen/Navbar";
import "./Contact.css";


const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
const [status, setStatus] = useState({
  type: "",
  message: "",
});
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

 
const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setStatus({ type: "", message: "" });

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send your inquiry.");
    }

    setStatus({
      type: "success",
      message: data.message || "Your inquiry has been sent successfully!",
    });

    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  } catch (error) {
    console.error("Contact form error:", error);

    setStatus({
      type: "error",
      message: error.message || "Unable to send your inquiry. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="contact-page">
      <Navbar />

      <main className="contact-container">
        <section className="contact-hero">
          <span>GET IN TOUCH</span>

          <h1>
            Let's talk about
            <br />
            your <strong>business.</strong>
          </h1>

          <p>
            Have a question about products, bulk orders,
            brands, delivery, or anything else? We're here
            to help.
          </p>
        </section>

        <section className="contact-layout">

          {/* Contact Information */}

          <div className="contact-info">

            <div className="contact-info-header">
              <h2>Contact Information</h2>

              <p>
                Reach out to us through any of the
                channels below.
              </p>
            </div>

            <div className="contact-info-list">

              <div className="contact-info-item">
                <div className="contact-icon">
                  <Mail size={19} />
                </div>

                <div>
                  <span>Email</span>
                  <p>support@orikam.com</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon">
                  <Phone size={19} />
                </div>

                <div>
                  <span>Phone</span>
                  <p>+91 00000 00000</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon">
                  <MapPin size={19} />
                </div>

                <div>
                  <span>Office</span>
                  <p>
                    ORIKAM Business Center,
                    <br />
                    India
                  </p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon">
                  <Clock size={19} />
                </div>

                <div>
                  <span>Business Hours</span>
                  <p>
                    Monday – Saturday
                    <br />
                    9:00 AM – 6:00 PM
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Form */}

          <div className="contact-form-wrapper">

            <div className="contact-form-header">
              <h2>Send us a message</h2>
              <p>
                Fill out the form and our team will get
                back to you.
              </p>
            </div>

            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >

              <div className="contact-form-row">

                <div className="contact-field">
                  <label>Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="contact-form-row">

                <div className="contact-field">
                  <label>Phone</label>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="contact-field">
                  <label>Subject</label>

                  <input
                    type="text"
                    name="subject"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="contact-field">
                <label>Message</label>

                <textarea
                  name="message"
                  placeholder="Tell us more about your requirement..."
                  value={form.message}
                  onChange={handleChange}
                  rows="6"
                  required
                />
              </div>
              {status.message && (
  <p
    className={`contact-status ${status.type}`}
    role="status"
    aria-live="polite"
  >
    {status.message}
  </p>
)}

              <button
  className="contact-submit"
  type="submit"
  disabled={loading}
>
  {loading ? "Sending..." : "Send Message"}
  {!loading && <Send size={16} />}
</button>

            </form>

          </div>

        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;