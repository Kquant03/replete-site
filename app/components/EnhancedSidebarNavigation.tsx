import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  onNavigate: (path: string) => void;
  currentPath: string;
  isMobile: boolean;
}

const EnhancedSidebarNavigation: React.FC<EnhancedSidebarNavigationProps> = ({
  isOpen,
  onToggle,
  onNavigate,
  currentPath,
  isMobile,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [animatingFolders, setAnimatingFolders] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set isReady to true after a short delay to allow for initial render
    const timer = setTimeout(() => setIsReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen && overlayRef.current && overlayRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle, isMobile]);

  const toggleFolder = useCallback((folderPath: string) => {
    setExpandedFolders((prev) => {
      const isExpanding = !prev.includes(folderPath);
      if (isExpanding) {
        setAnimatingFolders((animating) => [...animating, folderPath]);
        setTimeout(() => {
          setAnimatingFolders((animating) => animating.filter(path => path !== folderPath));
        }, 800); // This should match the transition duration in CSS
      }
      return isExpanding ? [...prev, folderPath] : prev.filter(f => f !== folderPath);
    });
  }, []);

  const renderFile = useCallback((file: File, folderPath: string, depth: number) => (
    <li
      key={`${folderPath}/${file.name}`}
      className={`${styles.file} ${currentPath === file.path ? styles.activePage : ''}`}
      style={{ paddingLeft: `${depth * 16}px` }}
    >
      <button onClick={() => onNavigate(file.path)} className={styles.fileButton}>
        <FiFile className={styles.fileIcon} />
        <span className={styles.fileName}>{file.name}</span>
      </button>
    </li>
  ), [currentPath, onNavigate]);

  const renderFolder = useCallback((folder: Folder, parentPath: string = '', depth: number = 0) => {
    const folderPath = parentPath ? `${parentPath}/${folder.name}` : folder.name;
    const isExpanded = expandedFolders.includes(folderPath);
    const isAnimating = animatingFolders.includes(folderPath);

    return (
      <div key={folderPath} className={styles.folder}>
        <button
          className={styles.folderButton}
          onClick={() => toggleFolder(folderPath)}
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          <div className={`${styles.folderIcon} ${isExpanded ? styles.expanded : ''}`}>
            <FiChevronRight />
          </div>
          <FiFolder className={styles.folderIcon} />
          <span className={styles.folderName}>{folder.name}</span>
        </button>
        <div className={`${styles.folderContent} ${isExpanded || isAnimating ? styles.expanded : ''}`}>
          {folder.subfolders?.map((subfolder) => renderFolder(subfolder, folderPath, depth + 1))}
          {folder.files && (
            <ul className={styles.fileList}>
              {folder.files.map((file) => renderFile(file, folderPath, depth + 1))}
            </ul>
          )}
        </div>
      </div>
    );
  }, [expandedFolders, animatingFolders, renderFile, toggleFolder]);

  const guideStructure: Folder[] = [
    {
      name: 'Text-Generation',
      subfolders: [
        {
          name: 'Architectures',
          files: [
            { name: 'GPT', path: 'Text-Generation/Architectures/gpt' },
            { name: 'Llama', path: 'Text-Generation/Architectures/Llama' },
            { name: 'Mistral', path: 'Text-Generation/Architectures/Mistral' },
            { name: 'Mixtral', path: 'Text-Generation/Architectures/Mixtral' },
            { name: 'phi', path: 'Text-Generation/Architectures/phi' },
          ],
        },
        {
          name: 'Components',
          files: [
            { name: 'AddNorm', path: 'Text-Generation/Components/AddNorm' },
            { name: 'FFNs', path: 'Text-Generation/Components/FFNs' },
            { name: 'LayerNorm', path: 'Text-Generation/Components/LayerNorm' },
            { name: 'Linear', path: 'Text-Generation/Components/Linear' },
            { name: 'MultiLayerPerceptron', path: 'Text-Generation/Components/MultiLayerPerceptron' },
            { name: 'MultiheadAttention', path: 'Text-Generation/Components/MultiheadAttention' },
            { name: 'PosEncoding', path: 'Text-Generation/Components/PosEncoding' },
            { name: 'RMS', path: 'Text-Generation/Components/RMS' },
            { name: 'RoPE', path: 'Text-Generation/Components/RoPE' },
            { name: 'SWA', path: 'Text-Generation/Components/SWA' },
            { name: 'SelfAttention', path: 'Text-Generation/Components/SelfAttention' },
            { name: 'Softmax', path: 'Text-Generation/Components/Softmax' },
          ],
        },
        {
          name: 'Fine-Tuning-and-Training',
          files: [
            { name: 'Axolotl', path: 'Text-Generation/Fine-Tuning-and-Training/Axolotl' },
            { name: 'Llama-Factory', path: 'Text-Generation/Fine-Tuning-and-Training/Llama-Factory' },
            { name: 'LoRAs', path: 'Text-Generation/Fine-Tuning-and-Training/LoRAs' },
            { name: "Mlabonne's LLM Course", path: "Text-Generation/Fine-Tuning-and-Training/Mlabonne's-LLm-Course" },
            { name: 'PEFT', path: 'Text-Generation/Fine-Tuning-and-Training/PEFT' },
          ],
        },
        {
          name: 'Merging-Models',
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
          name: 'Prompt-Templates',
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
            { name: 'Llama-cpp', path: 'Text-Generation/Quantization/Llama-cpp' },
            { name: 'Quip-Sharp', path: 'Text-Generation/Quantization/Quip-Sharp' },
          ],
        },
        {
          name: 'Treasure-Trove',
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
        { name: 'Text-Gen-Formats', path: 'Text-Generation/Text-Gen-Formats' },
        { name: 'Tokenization', path: 'Text-Generation/Tokenization' },
      ],
    },
    {
      name: 'Image-Generation',
      subfolders: [
        {
          name: 'Extensions-and-Tools',
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
        { name: 'SDArch', path: 'Image-Generation/SDArch' },
        { name: 'SDXLArch', path: 'Image-Generation/SDXLArch' },
        { name: 'Stable Diffusion Prompting', path: 'Image-Generation/Stable-Diffusion-Prompting' },
      ],
    },
    {
      name: 'Text-to-Speech',
      files: [
        { name: 'OpenVoice', path: 'Text-to-Speech/OpenVoice' },
        { name: 'RVC', path: 'Text-to-Speech/RVC' },
        { name: 'SadTalker', path: 'Text-to-Speech/SadTalker' },
      ],
    },
  ];

  if (!isReady) {
    return null; // Return null until the component is ready to render
  }

  return (
    <>
      {isMobile && (
        <div
          ref={overlayRef}
          className={`${styles.sidebarOverlay} ${isOpen ? styles.visible : ''}`}
          onClick={onToggle}
        />
      )}
      <AnimatePresence mode="sync">
        {(isOpen || !isMobile) && (
          <motion.nav
            ref={sidebarRef}
            className={`${styles.sidebar} ${isMobile ? styles.mobile : styles.desktop} ${isOpen ? styles.visible : ''}`}
            initial={isMobile ? { x: '-100%' } : false}
            animate={isOpen ? { x: 0 } : { x: '-100%' }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className={styles.sidebarContent}>
              {guideStructure.map((folder) => renderFolder(folder))}
            </div>
            {isMobile && (
              <button className={styles.closeSidebar} onClick={onToggle}>
                <FiChevronLeft className={styles.closeIcon} />
              </button>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedSidebarNavigation;