import React, { useState } from 'react';
import '../css/FAQPage.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: "What types of rentals do you offer?",
      answer:
        "We offer a variety of rental products including bikes, cars, cameras, drones, speakers, and fishing rods.",
    },
    {
      question: "What are the rental rates?",
      answer:
        "Rental rates vary by product and duration. Please check the specific product page for pricing details.",
    },
    {
      question: "Do I need to make a reservation?",
      answer:
        "Yes, we recommend making a reservation in advance to ensure availability.",
    },
    {
      question: "What is the minimum rental period?",
      answer:
        "The minimum rental period is typically one day, but it may vary by product.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept major credit cards, PayPal, and other online payment methods.",
    },
    {
      question: "Is a deposit required?",
      answer:
        "Yes, a security deposit is required for certain rentals, which will be refunded upon the return of the item.",
    },
    {
      question: "What happens if I damage the rented item?",
      answer:
        "If the item is damaged, you will be responsible for repair or replacement costs as outlined in our rental agreement.",
    },
    {
      question: "Can I extend my rental period?",
      answer:
        "Yes, you can extend your rental period. Please contact us as soon as possible to arrange this.",
    },
    {
      question: "What if I need to cancel my reservation?",
      answer:
        "Cancellation policies vary. Please refer to our terms and conditions for specific details.",
    },
    {
      question: "Do you offer delivery and pickup services?",
      answer:
        "Yes, we offer delivery and pickup services for certain products. Please inquire for details.",
    },
    {
      question: "What should I do if I have a problem with the rental?",
      answer:
        "If you encounter any issues with your rental, please contact our support team immediately for assistance.",
    },
    {
      question: "Are there age restrictions for renting?",
      answer: "Yes, you must be at least 18 years old to rent from us.",
    },
    {
      question: "Do you provide insurance for rentals?",
      answer:
        "We do not provide insurance, but we recommend checking with your own insurance provider for coverage options.",
    },
    {
      question: "How do I return the rented item?",
      answer:
        "Items can be returned to our location or arranged for pickup, depending on your rental agreement.",
    },
    {
      question: "What if I lose the rented item?",
      answer:
        "If the item is lost, you will be charged for its full replacement value as specified in our rental agreement.",
    },
    {
      question: "Do you have a customer loyalty program?",
      answer:
        "Yes, we offer a loyalty program with discounts for frequent renters. Please check our website for more information.",
    },
    {
      question: "Can I rent multiple items at once?",
      answer:
        "Absolutely! You can rent multiple items, and discounts may apply.",
    },
    {
      question: "What items are not available for rent?",
      answer:
        "Certain high-value items or specialty equipment may not be available for rent. Please inquire for specific details.",
    },
    {
      question: "Are the rental items maintained and sanitized?",
      answer:
        "Yes, all items are thoroughly cleaned and inspected before each rental to ensure quality and safety.",
    },
    {
      question: "Can I pick up the rented item instead of having it delivered?",
      answer:
        "Yes, you can choose to pick up your rental from our location.",
    },
    {
      question: "Is there a late return fee?",
      answer:
        "Yes, late returns may incur additional fees. Please refer to our rental terms for details.",
    },
    {
      question: "How can I contact customer service?",
      answer:
        "You can reach our customer service team via phone, email, or through our website's contact form.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="page-container">
      <div className="faq-container">
        <h1>FAQ</h1>
        <h2>Frequently Asked Questions</h2>
        <div className="accordion">
          {faqData.map((item, index) => (
            <div
              className={`accordion-item ${activeIndex === index ? "active" : ""}`}
              key={index}
            >
              <div
                className="accordion-title"
                onClick={() => toggleAccordion(index)}
              >
                {item.question}
                <span className="arrow">▼</span>
              </div>
              <div className="accordion-content">
                {activeIndex === index &&
                  item.answer.split(" ").map((word, wordIndex) => (
                    <span
                      key={wordIndex}
                      className="animate-word"
                      style={{
                        animationDelay: `${wordIndex * 0.05}s`,
                      }}
                    >
                      {word}{" "}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;