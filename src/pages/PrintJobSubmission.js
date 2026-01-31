import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useUser } from '@clerk/clerk-react';
import { usePrintJob } from '../context/PrintJobContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUpload,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaPrint,
  FaTimes,
  FaCheck,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
`;

const GlassCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 80px -20px rgba(0,0,0,0.5);
  
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const Steps = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 20%;
    right: 20%;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    z-index: 0;
  }
`;

const Step = styled.div`
  position: relative;
  z-index: 1;
  background: var(--bg-dark);
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  .circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${props => props.active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    transition: all 0.3s;
    border: 2px solid ${props => props.completed ? 'var(--success)' : props.active ? 'var(--primary)' : 'transparent'};
  }
  
  .label {
    font-size: 0.9rem;
    color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
    font-weight: ${props => props.active ? '600' : '400'};
  }
`;

const UploadZone = styled(motion.div)`
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s;
  
  &:hover, &.active {
    border-color: var(--primary);
    background: rgba(59, 130, 246, 0.05);
  }
  
  .icon {
    font-size: 48px;
    color: var(--primary);
    margin-bottom: 24px;
  }
  
  h3 { color: white; margin-bottom: 8px; font-size: 1.2rem; }
  p { color: var(--text-secondary); font-size: 0.95rem; }
`;

const FilePreview = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  
  .icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: rgba(59, 130, 246, 0.1);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }
  
  .info {
    flex: 1;
    h4 { color: white; margin-bottom: 4px; }
    p { color: var(--text-secondary); font-size: 0.9rem; }
  }
  
  button {
     background: rgba(239, 68, 68, 0.1);
     color: #ef4444;
     border: none;
     width: 40px;
     height: 40px;
     border-radius: 10px;
     cursor: pointer;
     transition: all 0.2s;
     &:hover { background: rgba(239, 68, 68, 0.2); }
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin: 32px 0;
  
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const InputGroup = styled.div`
  label {
    display: block;
    color: var(--text-secondary);
    margin-bottom: 8px;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  input, select {
    width: 100%;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: var(--primary);
      background: rgba(0, 0, 0, 0.3);
    }
  }
  
  &.full { grid-column: 1 / -1; }
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  
  input {
    width: 20px;
    height: 20px;
  }
  
  span { color: white; font-weight: 500; }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
`;

const Button = styled(motion.button)`
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &.primary {
    background: var(--primary-gradient);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SuccessState = styled(motion.div)`
  text-align: center;
  padding: 40px 0;
  
  .icon {
    font-size: 80px;
    color: #10b981;
    margin-bottom: 24px;
  }
  
  .link-box {
    background: rgba(0, 0, 0, 0.2);
    padding: 16px;
    border-radius: 12px;
    border: 1px dashed rgba(255, 255, 255, 0.2);
    margin: 24px 0;
    word-break: break-all;
    font-family: monospace;
    color: var(--primary);
  }
`;

const PrintJobSubmission = () => {
  const { user } = useUser();
  const { submitPrintJob, isSubmitting } = usePrintJob();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [settings, setSettings] = useState({
    documentName: '',
    pages: 1,
    copies: 1,
    color: false,
    duplex: true,
    priority: 'normal',
    expiration: 15,
    paperSize: 'a4',
    orientation: 'portrait',
    pageRange: 'all',
    printQuality: 'normal',
    collate: true
  });
  const [result, setResult] = useState(null);

  const onDrop = (acceptedFiles) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      setSettings(prev => ({ ...prev, documentName: f.name }));
      setStep(2);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ maxFiles: 1, onDrop });

  const handleSubmit = async () => {
    if (!file) return;
    try {
      const payload = {
        ...settings,
        userId: user.id,
        userName: user.fullName || user.username || 'Unknown',
        file: file
      };
      const res = await submitPrintJob(payload);
      setResult(res);
      setStep(3);
    } catch (e) {
      toast.error(e.message || 'Submission failed');
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('pdf')) return FaFilePdf;
    if (fileName.match(/(doc|docx)$/)) return FaFileWord;
    if (fileName.match(/(xls|xlsx)$/)) return FaFileExcel;
    return FaFileAlt;
  };

  const FileIcon = file ? getFileIcon(file.name) : FaFileAlt;

  return (
    <Container>
      <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Submit Print Job</h1>
        <p>Securely upload and configure your print job</p>
      </Header>

      <Steps>
        {[1, 2, 3].map(s => (
          <Step key={s} active={step === s} completed={step > s}>
            <div className="circle">{step > s ? <FaCheck /> : s}</div>
            <div className="label">
              {s === 1 ? 'Upload' : s === 2 ? 'Configure' : 'Complete'}
            </div>
          </Step>
        ))}
      </Steps>

      <GlassCard
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        key={step}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="step1">
              <UploadZone {...getRootProps()} className={isDragActive ? 'active' : ''}>
                <input {...getInputProps()} />
                <FaUpload className="icon" />
                <h3>Drag & Drop your document</h3>
                <p>Supports PDF, Word, Excel, Images</p>
              </UploadZone>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} key="step2">
              <FilePreview>
                <div className="icon"><FileIcon /></div>
                <div className="info">
                  <h4>{file?.name}</h4>
                  <p>{(file?.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={() => { setFile(null); setStep(1); }}><FaTimes /></button>
              </FilePreview>

              <FormGrid>
                <InputGroup className="full">
                  <label>Document Name</label>
                  <input
                    value={settings.documentName}
                    onChange={e => setSettings({ ...settings, documentName: e.target.value })}
                  />
                </InputGroup>

                <InputGroup>
                  <label>Copies</label>
                  <input
                    type="number" min="1"
                    value={settings.copies}
                    onChange={e => setSettings({ ...settings, copies: parseInt(e.target.value) })}
                  />
                </InputGroup>

                <InputGroup>
                  <label>Paper Size</label>
                  <select
                    value={settings.paperSize}
                    onChange={e => setSettings({ ...settings, paperSize: e.target.value })}
                  >
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="legal">Legal</option>
                    <option value="a3">A3</option>
                  </select>
                </InputGroup>

                <InputGroup>
                  <label>Orientation</label>
                  <select
                    value={settings.orientation}
                    onChange={e => setSettings({ ...settings, orientation: e.target.value })}
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </InputGroup>

                <InputGroup>
                  <label>Page Range</label>
                  <input
                    placeholder="e.g. 1-5, 8, 11-13"
                    value={settings.pageRange === 'all' ? '' : settings.pageRange}
                    onChange={e => setSettings({ ...settings, pageRange: e.target.value || 'all' })}
                  />
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    Leave empty for all pages
                  </small>
                </InputGroup>

                <InputGroup>
                  <label>Print Quality</label>
                  <select
                    value={settings.printQuality}
                    onChange={e => setSettings({ ...settings, printQuality: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </InputGroup>

                <InputGroup>
                  <label>Link Expiration (mins)</label>
                  <select
                    value={settings.expiration}
                    onChange={e => setSettings({ ...settings, expiration: parseInt(e.target.value) })}
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={1440}>24 Hours</option>
                  </select>
                </InputGroup>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', gridColumn: '1 / -1' }}>
                  <Toggle>
                    <input
                      type="checkbox"
                      checked={settings.color}
                      onChange={e => setSettings({ ...settings, color: e.target.checked })}
                    />
                    <span>Color</span>
                  </Toggle>
                  <Toggle>
                    <input
                      type="checkbox"
                      checked={settings.duplex}
                      onChange={e => setSettings({ ...settings, duplex: e.target.checked })}
                    />
                    <span>Double Sided</span>
                  </Toggle>
                  <Toggle>
                    <input
                      type="checkbox"
                      checked={settings.collate}
                      onChange={e => setSettings({ ...settings, collate: e.target.checked })}
                    />
                    <span>Collate</span>
                  </Toggle>
                </div>
              </FormGrid>

              <ButtonRow>
                <Button className="secondary" onClick={() => setStep(1)}><FaArrowLeft /> Back</Button>
                <Button
                  className="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Job'} <FaPrint />
                </Button>
              </ButtonRow>
            </motion.div>
          )}

          {step === 3 && (
            <SuccessState initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="icon"><FaCheckCircle /></div>
              <h2>Submission Successful!</h2>
              <p>Your secure print link is ready.</p>

              {result?.releaseLink && (
                <div className="link-box">
                  {result.releaseLink}
                </div>
              )}

              <ButtonRow style={{ justifyContent: 'center', gap: '16px' }}>
                <Button className="secondary" onClick={() => { setFile(null); setStep(1); }}>
                  Submit Another
                </Button>
                <Button className="primary" onClick={() => window.location.href = '/dashboard'}>
                  Go to Dashboard <FaArrowRight />
                </Button>
              </ButtonRow>
            </SuccessState>
          )}
        </AnimatePresence>
      </GlassCard>
    </Container>
  );
};

export default PrintJobSubmission;
