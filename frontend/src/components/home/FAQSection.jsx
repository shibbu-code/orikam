import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import "./FAQSection.css";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How can I place an order?",
      answer:
        "Browse the products, select the required product and quantity, add it to your cart, and proceed to checkout.",
    },
    {
      question: "Do you sell products in bulk?",
      answer:
        "Yes. Our platform supports bulk purchasing for dental clinics, hospitals, distributors, and other businesses.",
    },
    {
      question: "How can I track my order?",
      answer:
        "After placing an order, you can track its status from your orders section.",
    },
    {
      question: "What payment methods are available?",
      answer:
        "You can pay using the payment methods supported during checkout.",
    },
    {
      question: "How can I contact support?",
      answer:
        "You can contact our support team through the Contact Us section.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-header">
        <h2>Frequently Asked Questions</h2>
        <p>Find answers to common questions about our platform.</p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              className={`faq-item ${isOpen ? "faq-item-open" : ""}`}
              key={index}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>

                <ChevronDown
                  size={20}
                  className={`faq-icon ${
                    isOpen ? "faq-icon-open" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="faq-answer">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQSection;