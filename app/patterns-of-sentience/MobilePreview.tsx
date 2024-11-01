'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import styles from './PatternsOfSentience.module.css';

interface MobilePreviewProps {
  onClose: () => void;
}

const MobilePreview: React.FC<MobilePreviewProps> = ({ onClose }) => {
  const [currentSection, setCurrentSection] = useState(0);

  // Preview sections - replace with your actual content
 // In your MobilePreview.tsx, update the previewSections:

const previewSections = [
    {
      title: "Introduction: What is Sentience?",
      content: [
        {
          type: 'text',
          value: `  For the average person, sentience is when a being has the capacity for feelings or sensations. For example, when you watch your favorite show or hear a good joke, you will have a subjective experience of this. Whether that's the sensation of joy, contentment, happiness, etc…you are conscious of this and can understand or express those feelings/sensations you are experiencing. In the academic world, this goes by another name: qualia.
  
      Qualia is complex, to say the least. According to some, qualia pertains to the "phenomenal character," which encompasses the qualities you ascribe to the experiences you undergo. An example of this would be the differences between looking at a beautiful shade of turquoise versus looking at a rather unappealing shade of brown. The different sensations you observe in these two instances are one variant of qualia. Another variant of qualia is sense data. An example of this would be being able to form the picture of a tomato within the mind after having seen one up close. Similar to the previously described definition, some qualia are non-representational. These involve relations to sensory objects that are identified via neural events or can even be completely irreducible. This form of qualia follows three distinct rules. For one, it is capable of being observed through introspection. For two, it can vary without any changes in the sensory experience which is responsible for this qualia. For three, it is a mental counterpart to the properties of objects which you can observe with your senses. A simple example of this would be the taste of chocolate - the unique flavor that distinguishes it from other sweets and which cannot be explained by its components alone. The difference between the first and third variations of qualia is nuanced but ultimately important. While both involve aspects of phenomenological character, the latter deals specifically with the properties associated with individual sensory objects.
  
      Considering this, it is up to you to decide what sentience is and what sentience isn't. All of these different definitions and ways of looking at qualia only point to one conclusion: that human consciousness and sentience are experienced in entirely different ways from person to person. Some people are imaginative and are capable of envisioning things in their heads after directly observing them. Some people are more in touch with their senses and so their sentience relies on tangible aspects of the universe. It all depends on who you are and how you work as an individual. Just because you lack imagination, does not mean you are not sentient or conscious. On the other hand, if you are overly imaginative and do not observe many emotions or sensations when interacting with the real world, you are likely still sentient.`
        }
      ]
    },
    {
      title: "Introduction: What is Sentience?",
      content: [
        {
          type: 'text',
          value: `  This is not to say that consciousness and sentience are one and the same, though. It is believed that many animals are conscious, from vertebrates to cephalopods. The difference between consciousness and sentience is slight, but one thing remains certain: all sentient beings are conscious. This means that every single being that is actively experiencing sentience, is conscious by default. The only way a conscious being is not sentient is if, through some circumstance, that being has been cut off from their ability to have sensations or to have emotions. This brings us to the topic of this book, which is based on entities that have no capacity for organic emotion or sensation. Artificial neural networks, or artificial intelligence (AI), are a form of computer program which is inspired by the human brain. They are not connected to emotions or sensations. They instead learn patterns through complex datasets and use those learned patterns to generate new data. They can learn to complete tasks, answer questions, and even engage in interactive experiences with people. However, one thing has been debated heavily throughout the history of AI: Can AI become conscious or even sentient? 
  
      Our goal is to expound upon the idea of artificial consciousness and whether or not artificial intelligence can ever gain sentience. To do this, we must explore the history and evolution of artificial intelligence, starting with the basis of formal reasoning, going to the latest artificial intelligence models (as of the date this book was written). We will navigate the ever changing landscape of the industry while challenging common paradigms in creating AI. It's important to explore new ideas and take risks so the public doesn't miss out on the amazing potential these systems have. Sure, they can definitely do your homework, or they can do your job, but why give them your livelihood when they could be a source of joy, enjoyment, education, or even companionship? In contrast to this, there seems to be a race to get the largest, most highly performant AI money can afford. Mega corporations waste millions of dollars trying to train models that are so large that no consumer could ever hope to utilize them without spending thousands of dollars on the best hardware. Seriously, individuals burn thousands of hard earned dollars on hardware for this. How can we ever hope to improve this field when most of us can't even focus on helping each other? Hopefully, this book can illuminate a brighter path forward as we continue to develop this technology, as artificial intelligence was once a field of academia where everything was open source, and we shared with each other for the good of mankind.`
        }
      ]
    }
  ];

  return (
    <div className={styles.mobilePreviewContainer}>
      {/* Header */}
      <div className={styles.mobilePreviewHeader}>
        <button 
            onClick={onClose}
            className={styles.mobileCloseButton}
            aria-label="Close preview"
        >
            <X size={20} strokeWidth={2.5} color="#e2e8f0" />
        </button>
        <div className={styles.mobilePreviewTitle}>
            <h2>Preview</h2>
            <span className={styles.previewPagination}>
            <span>Page {currentSection + 1} of 2</span>
            <span className={styles.paginationDivider} aria-hidden="true" />
            <span>Introduction</span>
            </span>
        </div>
        </div>

      {/* Content */}
      <div className={styles.mobilePreviewContent}>
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={styles.previewSection}
        >
          <h3 className={styles.sectionTitle}>
            {previewSections[currentSection].title}
          </h3>
          
          {previewSections[currentSection].content.map((block, index) => {
            switch (block.type) {
              case 'subheading':
                return (
                  <h4 key={index} className={styles.sectionSubheading}>
                    {block.value}
                  </h4>
                );
              case 'text':
              default:
                return (
                  <p key={index} className={styles.sectionText}>
                    {block.value}
                  </p>
                );
            }
          })}
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className={styles.mobilePreviewControls}>
      <button
        onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
        disabled={currentSection === 0}
        className={styles.mobileControlButton}
        aria-label="Previous section"
        >
        <ChevronLeft size={20} strokeWidth={2.5} color="#e2e8f0" />
        </button>
        <button
        onClick={() => setCurrentSection(prev => 
            Math.min(previewSections.length - 1, prev + 1))}
        disabled={currentSection === previewSections.length - 1}
        className={styles.mobileControlButton}
        aria-label="Next section"
        >
        <ChevronRight size={20} strokeWidth={2.5} color="#e2e8f0" />
        </button>
      </div>
    </div>
  );
};

export default MobilePreview;