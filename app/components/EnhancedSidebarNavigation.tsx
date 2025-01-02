import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight, FiFile, FiFolder, FiChevronLeft } from 'react-icons/fi';
import styles from '../styles/EnhancedSidebarNavigation.module.css';

interface File {
  name: string;
  path: string;
}

interface Folder {
  name: string;
  files?: File[];
  subfolders?: Folder[];
}

interface EnhancedSidebarNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => Promise<void>;
  currentPath: string;
  isMobile: boolean;
}

const EnhancedSidebarNavigation: React.FC<EnhancedSidebarNavigationProps> = ({
  isOpen,
  onToggle,
  onNavigate,
  currentPath,
  isMobile
}) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

 // Enhanced folder toggle with smoother animation
 const toggleFolder = useCallback((folderPath: string) => {
  setExpandedFolders(prev => 
    prev.includes(folderPath)
      ? prev.filter(f => f !== folderPath)
      : [...prev, folderPath]
  );
}, []);

const sidebarVariants = {
  hidden: { 
    x: '-100%',
    transition: {
      duration: 0.3,
      ease: [0.2, 0.65, 0.3, 0.9]
    }
  },
  visible: { 
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.2, 0.65, 0.3, 0.9]
    }
  }
};

const folderContentVariants = {
  hidden: { 
    height: 0,
    opacity: 0,
  },
  visible: { 
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        duration: 0.3,
        ease: [0.2, 0.65, 0.3, 0.9]
      },
      opacity: {
        duration: 0.2
      }
    }
  }
};

const renderFile = useCallback((file: File, depth: number) => (
  <motion.li
    key={file.path}
    className={`${styles.file} ${currentPath === file.path ? styles.activePage : ''}`}
    style={{ paddingLeft: `${depth * 16}px` }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
  >
    <button 
      onClick={() => onNavigate(file.path)} 
      className={styles.fileButton}
    >
      <FiFile className={styles.fileIcon} />
      <span className={styles.fileName}>{file.name}</span>
    </button>
  </motion.li>
), [currentPath, onNavigate]);

const renderFolder = useCallback((folder: Folder, parentPath: string = '', depth: number = 0) => {
  const folderPath = parentPath ? `${parentPath}/${folder.name}` : folder.name;
  const isExpanded = expandedFolders.includes(folderPath);

  return (
    <div key={folderPath} className={styles.folder}>
      <button
        className={styles.folderButton}
        onClick={() => toggleFolder(folderPath)}
        style={{ '--depth': depth } as React.CSSProperties} // Use CSS custom property for depth
      >
        <motion.div 
          className={styles.chevronIcon}
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronRight />
        </motion.div>
        <FiFolder className={styles.folderIcon} />
        <span className={styles.folderName}>{folder.name}</span>
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            variants={folderContentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={styles.folderContent}
          >
            <div className={styles.folderContentInner}>
              {folder.subfolders?.map((subfolder) => 
                renderFolder(subfolder, folderPath, depth + 1)
              )}
              {folder.files?.map((file) => 
                renderFile(file, depth + 1)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}, [expandedFolders, renderFile, toggleFolder]);

  const guideStructure: Folder[] = [
    {
      name: 'Text Generation',
      subfolders: [
        {
          name: 'Architectures',
          files: [
            { name: 'GPT', path: 'Text-Generation/Architectures/gpt' },
            { name: 'Llama', path: 'Text-Generation/Architectures/Llama' },
            { name: 'Mistral', path: 'Text-Generation/Architectures/Mistral' },
            { name: 'Mixtral', path: 'Text-Generation/Architectures/Mixtral' },
            { name: 'Phi', path: 'Text-Generation/Architectures/phi' },
          ],
        },
        {
          name: 'Components',
          files: [
            { name: 'Add & Norm', path: 'Text-Generation/Components/AddNorm' },
            { name: 'Feed-Forward', path: 'Text-Generation/Components/FFNs' },
            { name: 'Layer Normalization', path: 'Text-Generation/Components/LayerNorm' },
            { name: 'Linear Layer', path: 'Text-Generation/Components/Linear' },
            { name: 'Multi-layer Perceptron', path: 'Text-Generation/Components/MultiLayerPerceptron' },
            { name: 'Multihead Attention', path: 'Text-Generation/Components/MultiheadAttention' },
            { name: 'Positional Encoding', path: 'Text-Generation/Components/PosEncoding' },
            { name: 'RMS Normalization', path: 'Text-Generation/Components/RMS' },
            { name: 'RoPE', path: 'Text-Generation/Components/RoPE' },
            { name: 'Sliding Window Attention', path: 'Text-Generation/Components/SWA' },
            { name: 'Self Attention', path: 'Text-Generation/Components/SelfAttention' },
            { name: 'Softmax', path: 'Text-Generation/Components/Softmax' },
          ],
        },
        {
          name: 'Fine-Tuning and Training',
          files: [
            { name: 'Axolotl', path: 'Text-Generation/Fine-Tuning-and-Training/Axolotl' },
            { name: 'Llama-Factory', path: 'Text-Generation/Fine-Tuning-and-Training/Llama-Factory' },
            { name: 'LoRAs', path: 'Text-Generation/Fine-Tuning-and-Training/LoRAs' },
            { name: "Mlabonne's LLM Course", path: "Text-Generation/Fine-Tuning-and-Training/Mlabonne's-LLm-Course" },
            { name: 'PEFT', path: 'Text-Generation/Fine-Tuning-and-Training/PEFT' },
          ],
        },
        {
          name: 'Merging Models',
          files: [
            { name: 'DARE', path: 'Text-Generation/Merging-Models/DARE' },
            { name: 'FrankenMoE', path: 'Text-Generation/Merging-Models/FrankenMoE' },
            { name: 'Linear Merge', path: 'Text-Generation/Merging-Models/Linear-Merge' },
            { name: 'Model Stock', path: 'Text-Generation/Merging-Models/Model-Stock' },
            { name: 'Passthrough', path: 'Text-Generation/Merging-Models/Passthrough' },
            { name: 'SLERP', path: 'Text-Generation/Merging-Models/SLERP' },
            { name: 'TIES', path: 'Text-Generation/Merging-Models/TIES' },
            { name: 'Task Arithmetic', path: 'Text-Generation/Merging-Models/Task-Arithmetic' },
          ],
        },
        {
          name: 'Prompt Templates',
          files: [
            { name: 'Alpaca', path: 'Text-Generation/Prompt-Templates/Alpaca' },
            { name: 'ChatML', path: 'Text-Generation/Prompt-Templates/ChatML' },
            { name: 'Llama-2', path: 'Text-Generation/Prompt-Templates/Llama-2' },
            { name: 'Metharme', path: 'Text-Generation/Prompt-Templates/Metharme' },
            { name: 'ShareGPT', path: 'Text-Generation/Prompt-Templates/ShareGPT' },
          ],
        },
        {
          name: 'Quantization',
          files: [
            { name: 'AWQ', path: 'Text-Generation/Quantization/AWQ' },
            { name: 'ExllamaV2', path: 'Text-Generation/Quantization/ExllamaV2' },
            { name: 'GPTQ', path: 'Text-Generation/Quantization/GPTQ' },
            { name: 'Imatrix', path: 'Text-Generation/Quantization/imatrix' },
            { name: 'Llama-cpp', path: 'Text-Generation/Quantization/Llama-cpp' },
          ],
        },
        {
          name: 'Treasure Trove',
          files: [
            { name: 'DPO', path: 'Text-Generation/Treasure-Trove/DPO' },
            { name: 'DPOP', path: 'Text-Generation/Treasure-Trove/DPOP' },
            { name: 'KNN', path: 'Text-Generation/Treasure-Trove/KNN' },
            { name: 'Laser-RMT', path: 'Text-Generation/Treasure-Trove/Laser-RMT' },
            { name: 'ORPO', path: 'Text-Generation/Treasure-Trove/ORPO' },
            { name: 'PPO', path: 'Text-Generation/Treasure-Trove/PPO' },
          ],
        },
      ],
      files: [
        { name: 'SillyTavern', path: 'Text-Generation/SillyTavern' },
        { name: 'Text-Gen Formats', path: 'Text-Generation/Text-Gen-Formats' },
        { name: 'Tokenization', path: 'Text-Generation/Tokenization' },
      ],
    },
    {
      name: 'Image Generation',
      subfolders: [
        {
          name: 'Extensions and Tools',
          files: [
            { name: 'Adetailer', path: 'Image-Generation/Extensions-and-Tools/Adetailer' },
            { name: 'Animation', path: 'Image-Generation/Extensions-and-Tools/Animation' },
            { name: 'Checkpoints', path: 'Image-Generation/Extensions-and-Tools/Checkpoints' },
            { name: 'Embeddings', path: 'Image-Generation/Extensions-and-Tools/Embeddings' },
            { name: 'FreeU', path: 'Image-Generation/Extensions-and-Tools/FreeU' },
            { name: 'LoRA', path: 'Image-Generation/Extensions-and-Tools/LoRA' },
            { name: 'MasterAnimation', path: 'Image-Generation/Extensions-and-Tools/MasterAnimation' },
            { name: 'Upscale-Hiresfix', path: 'Image-Generation/Extensions-and-Tools/Upscale-Hiresfix' },
          ],
        },
      ],
      files: [
        { name: 'SD Architecture', path: 'Image-Generation/SDArch' },
        { name: 'SDXL Architecture', path: 'Image-Generation/SDXLArch' },
        { name: 'Stable Diffusion Prompting', path: 'Image-Generation/Stable-Diffusion-Prompting' },
        { name: 'Installing A1111', path: 'Image-Generation/InstallingA1111' },
      ],
    },
    {
      name: 'Text to Speech',
      files: [
        { name: 'OpenVoice', path: 'Text-to-Speech/OpenVoice' },
        { name: 'RVC', path: 'Text-to-Speech/RVC' },
        { name: 'SadTalker', path: 'Text-to-Speech/SadTalker' },
      ],
    },
  ];


  return (
    <>
      {isMobile && isOpen && (
        <motion.div
          className={styles.sidebarOverlay}
          onClick={onToggle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.nav
            className={`${styles.sidebar} ${isMobile ? styles.mobile : ''}`}
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className={styles.sidebarContent}>
              {guideStructure.map((folder) => renderFolder(folder))}
            </div>
            
            {isMobile && (
              <button 
                className={styles.closeSidebar}
                onClick={onToggle}
              >
                <FiChevronLeft />
              </button>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedSidebarNavigation;