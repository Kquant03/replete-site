'use client';

import { useState } from 'react';
import styles from './Contact.module.css';

// Form types and their specific fields
type FormCategory = 
  | 'technical'
  | 'business'
  | 'research'
  | 'safety'
  | 'general';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface CategoryInfo {
  title: string;
  description: string;
  fields: FormField[];
}

const CATEGORY_INFO: Record<FormCategory, CategoryInfo> = {
  technical: {
    title: 'Technical Support',
    description: 'Get help with Pneuma, account issues, or technical problems.',
    fields: [
      {
        id: 'issueType',
        label: 'Type of Issue',
        type: 'select',
        required: true,
        options: ['Pneuma Issues', 'Account Problems', 'Website Bugs', 'Other Technical Issue']
      },
      {
        id: 'urgency',
        label: 'Urgency Level',
        type: 'select',
        required: true,
        options: ['Low - Minor inconvenience', 'Medium - Affects functionality', 'High - Service unavailable']
      },
      {
        id: 'description',
        label: 'Describe the Issue',
        type: 'textarea',
        required: true,
        placeholder: 'Please provide as much detail as possible about the issue you\'re experiencing...'
      }
    ]
  },
  business: {
    title: 'Business Inquiries',
    description: 'Connect with us about partnerships, press, or investment opportunities.',
    fields: [
      {
        id: 'inquiryType',
        label: 'Type of Inquiry',
        type: 'select',
        required: true,
        options: ['Partnership Proposal', 'Media/Press', 'Investment Opportunity', 'Other Business Inquiry']
      },
      {
        id: 'organization',
        label: 'Organization Name',
        type: 'text',
        required: true
      },
      {
        id: 'proposal',
        label: 'Your Proposal',
        type: 'textarea',
        required: true,
        placeholder: 'Please describe your business proposal or inquiry in detail...'
      }
    ]
  },
  research: {
    title: 'Research Collaboration',
    description: 'Discuss AI development or dataset contributions.',
    fields: [
      {
        id: 'collaborationType',
        label: 'Type of Collaboration',
        type: 'select',
        required: true,
        options: ['AI Development', 'Dataset Contribution', 'Other Research Topic']
      },
      {
        id: 'background',
        label: 'Technical Background',
        type: 'textarea',
        required: true,
        placeholder: 'Please briefly describe your technical background and expertise...'
      },
      {
        id: 'proposal',
        label: 'Collaboration Proposal',
        type: 'textarea',
        required: true,
        placeholder: 'Describe your research proposal or contribution idea...'
      }
    ]
  },
  safety: {
    title: 'Safety & Ethics',
    description: 'Report concerns about content, behavior, or ethical issues.',
    fields: [
      {
        id: 'concernType',
        label: 'Type of Concern',
        type: 'select',
        required: true,
        options: ['Harmful Behavior', 'Content Moderation', 'Ethics Concern', 'Other Safety Issue']
      },
      {
        id: 'urgency',
        label: 'Urgency Level',
        type: 'select',
        required: true,
        options: ['Low - General concern', 'Medium - Potential issue', 'High - Immediate attention needed']
      },
      {
        id: 'description',
        label: 'Describe the Concern',
        type: 'textarea',
        required: true,
        placeholder: 'Please provide details about your safety or ethical concern...'
      }
    ]
  },
  general: {
    title: 'General Inquiries',
    description: 'Share feedback, request features, or ask general questions.',
    fields: [
      {
        id: 'inquiryType',
        label: 'Type of Inquiry',
        type: 'select',
        required: true,
        options: ['Feature Request', 'General Feedback', 'Question', 'Other']
      },
      {
        id: 'message',
        label: 'Your Message',
        type: 'textarea',
        required: true,
        placeholder: 'What would you like to tell us?'
      }
    ]
  }
};

export default function Contact() {
  const [category, setCategory] = useState<FormCategory | ''>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const categoryInfo = category ? CATEGORY_INFO[category] : null;
    if (!categoryInfo) return;

    // Prepare email content with clear structure
    const emailContent = {
      name,
      email,
      category: categoryInfo.title,
      formData
    };

    const res = await fetch('/api/contact/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailContent),
    });

    if (res.ok) {
      setSubmitted(true);
      setCategory('');
      setFormData({});
      setName('');
      setEmail('');
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className={`${styles.contactContainer} ${styles.visible}`}>
      <h1 className={styles.heading}>Contact Us</h1>
      
      {submitted ? (
        <div className={styles.successMessage}>
          <h2>Thank you for your message!</h2>
          <p>We&apos;ll get back to you as soon as possible.</p>
          <button 
            className={styles.button}
            onClick={() => setSubmitted(false)}
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.contactForm}>
          <div className={styles.formSection}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formSection}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formSection}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as FormCategory)}
              required
              className={styles.select}
            >
              <option value="">Select a category</option>
              {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                <option key={key} value={key}>{info.title}</option>
              ))}
            </select>
          </div>

          {category && CATEGORY_INFO[category] && (
            <div className={styles.categoryForm}>
              <p className={styles.categoryDescription}>
                {CATEGORY_INFO[category].description}
              </p>
              
              {CATEGORY_INFO[category].fields.map((field) => (
                <div key={field.id} className={styles.formSection}>
                  <label htmlFor={field.id}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      id={field.id}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      className={styles.select}
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      id={field.id}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      className={styles.textarea}
                    />
                  ) : (
                    <input
                      type={field.type}
                      id={field.id}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      className={styles.input}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <button type="submit" className={styles.submitButton}>
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}