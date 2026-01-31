import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useClerk } from '@clerk/clerk-react';
import { usePrintJob } from '../context/PrintJobContext';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import {
  FaQrcode,
  FaKey,
  FaPrint,
  FaCheckCircle,
  FaFileAlt,
  FaArrowLeft
} from 'react-icons/fa';

const ReleaseContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%);
`;

const GlassOrbo = styled(motion.div)`
  width: 100%;
  max-width: 900px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 20px 80px -20px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  min-height: 600px;
  
  @media (max-width: 768px) {
    border-radius: 0;
    min-height: 100vh;
    border: none;
    background: transparent;
  }
`;

const Header = styled.div`
  padding: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .badge {
    padding: 6px 12px;
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }
`;

const ContentArea = styled(motion.div)`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const AuthGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
  max-width: 700px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const AuthMethodCard = styled(motion.button)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: var(--primary);
    transform: translateY(-4px);
  }
  
  .icon {
    font-size: 48px;
    color: var(--primary);
  }
  
  h3 { font-size: 1.25rem; font-weight: 600; }
  p { color: var(--text-secondary); font-size: 0.9rem; }
`;

const PinPad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 300px;
  
  button {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.1s;
    
    &:hover { background: rgba(255, 255, 255, 0.1); }
    &:active { background: var(--primary); transform: scale(0.95); }
    &.wide { grid-column: span 3; border-radius: 16px; height: 60px; font-size: 1rem; }
  }
`;

const Screen = styled(motion.div)`
  width: 100%; 
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const JobsList = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
`;

const JobRow = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  .checkbox {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    margin-right: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--primary);
    
    &.checked {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }
  }
  
  .info {
    flex: 1;
    h4 { color: white; margin-bottom: 4px; font-size: 1.1rem; }
    p { color: var(--text-secondary); font-size: 0.9rem; }
  }
  
  .cost {
    font-weight: 700;
    color: white;
    font-size: 1.1rem;
    letter-spacing: 0.05em;
  }
`;

const ActionButton = styled(motion.button)`
  background: var(--primary-gradient);
  color: white;
  border: none;
  padding: 16px 40px;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const PrinterSelect = styled.select`
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  margin-bottom: 24px;
  width: 100%;
  max-width: 400px;
`;

const PrintRelease = () => {
  // const { loginWithPin, mockUsers } = useAuth(); // REMOVED
  const { user: clerkUser } = useClerk(); // Get Clerk user if available
  const { printJobs, releasePrintJob, printers } = usePrintJob();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState('auth'); // auth, jobs, releasing, success
  const [authMethod, setAuthMethod] = useState(null); // pin, qr
  const [pin, setPin] = useState('');
  const [user, setUser] = useState(null);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');

  // Mock Users for demo functionality
  const mockUsers = React.useMemo(() => [
    { id: 'user_2sN...', name: 'Demo User', role: 'user' }
  ], []);

  // If already signed in via Clerk, use that user
  useEffect(() => {
    if (clerkUser) {
      setUser({ ...clerkUser, name: clerkUser.fullName }); // Adapt to local shape
      setStep('jobs');
    }
  }, [clerkUser]);

  const jobIdFromUrl = params.jobId;
  const tokenFromUrl = new URLSearchParams(location.search).get('token');


  // Effect: Check for URL mode (Link Redemption)
  useEffect(() => {
    if (jobIdFromUrl && tokenFromUrl) {
      // Validate
      const job = printJobs.find(j => j.id === jobIdFromUrl && j.secureToken === tokenFromUrl);
      if (job) {
        // Mock login user from job
        const jobUser = mockUsers.find(u => String(u.id) === String(job.userId));
        if (jobUser) {
          setUser(jobUser);
          setStep('jobs');
          setSelectedJobs([job.id]);
        }
      } else {
        // Try to validate via backend or just show invalid
        toast.error("Invalid or expired print link.");
      }
    }
  }, [jobIdFromUrl, tokenFromUrl, printJobs, mockUsers]);

  // Handle PIN input
  const handlePinPress = async (val) => {
    if (val === 'clear') {
      setPin('');
      return;
    }
    if (val === 'enter') {
      if (pin.length !== 4) return toast.error('PIN must be 4 digits');
      // Mock PIN Login
      if (pin === '1234') {
        setUser({ id: 'demo_user', name: 'Kiosk User', role: 'user' });
        setStep('jobs');
      } else {
        toast.error('Invalid PIN');
        setPin('');
      }
      return;
    }
    if (pin.length < 4) setPin(prev => prev + val);
  };

  const getUserJobs = () => {
    if (!user) return [];
    // If URL mode, only show that job? Or all user jobs?
    // Let's show all user jobs for convenience if they authenticated fully, 
    // but if it was just a link "auto-login", maybe restrict?
    // For now, show all.
    return printJobs.filter(j => j.userId === user.id && j.status === 'pending');
  };

  const toggleJob = (id) => {
    if (selectedJobs.includes(id)) setSelectedJobs(prev => prev.filter(j => j !== id));
    else setSelectedJobs(prev => [...prev, id]);
  };

  const handleRelease = async () => {
    if (selectedJobs.length === 0) return;
    const printerId = selectedPrinter || printers.find(p => p.status === 'online')?.id;
    if (!printerId) return toast.error('No online printer available');

    setStep('releasing');

    try {
      // Release all selected
      for (const jid of selectedJobs) {
        // If we have a token from URL and it matches the job, use it. Otherwise use job's stored token (if implementing fully)
        // For simulation, we just call release
        const job = printJobs.find(j => j.id === jid); // Need token?
        await releasePrintJob(jid, printerId, user.id, job?.secureToken || 'session-token');
      }
      setTimeout(() => setStep('success'), 1500); // Fake delay for animation
    } catch (e) {
      toast.error(e.message);
      setStep('jobs');
    }
  };

  return (
    <ReleaseContainer>
      <GlassOrbo layout>
        <Header>
          <h1><FaPrint /> Print Release Station</h1>
          {user && <span className="badge">User: {user.name}</span>}
        </Header>

        <AnimatePresence mode="wait">
          {step === 'auth' && (
            <ContentArea key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!authMethod ? (
                <>
                  <h2 style={{ color: 'white', marginBottom: '32px' }}>Select Authentication Method</h2>
                  <AuthGrid>
                    <AuthMethodCard onClick={() => setAuthMethod('pin')}>
                      <div className="icon"><FaKey /></div>
                      <h3>PIN Code</h3>
                      <p>Enter your 4-digit security PIN</p>
                    </AuthMethodCard>
                    <AuthMethodCard onClick={() => setAuthMethod('qr')}>
                      <div className="icon"><FaQrcode /></div>
                      <h3>Scan Badge/QR</h3>
                      <p>Scan your ID badge or mobile app</p>
                    </AuthMethodCard>
                  </AuthGrid>
                </>
              ) : authMethod === 'pin' ? (
                <Screen>
                  <h2 style={{ color: 'white', marginBottom: '24px' }}>Enter PIN</h2>
                  <div style={{ fontSize: '32px', color: 'white', marginBottom: '32px', letterSpacing: '10px' }}>
                    {pin.padEnd(4, '•').replace(/./g, (c, i) => i < pin.length ? '*' : '•')}
                  </div>
                  <PinPad>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <button key={n} onClick={() => handlePinPress(String(n))}>{n}</button>
                    ))}
                    <button onClick={() => handlePinPress('clear')} style={{ color: '#f87171' }}>C</button>
                    <button onClick={() => handlePinPress('0')}>0</button>
                    <button onClick={() => setAuthMethod(null)} style={{ color: '#94a3b8' }}><FaArrowLeft /></button>
                    <button className="wide" onClick={() => handlePinPress('enter')}
                      style={{ background: 'var(--primary)' }}>Enter</button>
                  </PinPad>
                </Screen>
              ) : (
                <Screen>
                  <h2 style={{ color: 'white', marginBottom: '24px' }}>Scan QR Code</h2>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '16px' }}>
                    <QRCodeCanvas value="simulate-scan-here" size={200} />
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>
                    Waiting for scan... (Click 'PIN' for demo)
                  </p>
                  <button onClick={() => setAuthMethod(null)}
                    style={{ marginTop: '20px', background: 'none', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </Screen>
              )}
            </ContentArea>
          )}

          {step === 'jobs' && (
            <ContentArea key="jobs" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <div style={{ width: '100%', maxWidth: '800px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <h2 style={{ color: 'white' }}>Select Jobs to Print</h2>
                <button onClick={() => { setSelectedJobs(getUserJobs().map(j => j.id)) }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                  Select All
                </button>
              </div>

              <JobsList>
                {getUserJobs().length > 0 ? getUserJobs().map(job => (
                  <JobRow key={job.id} onClick={() => toggleJob(job.id)}>
                    <div className={`checkbox ${selectedJobs.includes(job.id) ? 'checked' : ''}`}>
                      {selectedJobs.includes(job.id) && <FaCheckCircle />}
                    </div>
                    <div className="icon" style={{ marginRight: '16px', fontSize: '24px', color: 'var(--text-secondary)' }}>
                      <FaFileAlt />
                    </div>
                    <div className="info">
                      <h4>{job.documentName}</h4>
                      <p>{job.pages} pages • {new Date(job.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="cost">${job.cost.toFixed(2)}</div>
                  </JobRow>
                )) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                    No pending jobs found.
                  </div>
                )}
              </JobsList>

              <PrinterSelect
                value={selectedPrinter}
                onChange={(e) => setSelectedPrinter(e.target.value)}
              >
                <option value="">-- Select Printer --</option>
                {printers.filter(p => p.status === 'online').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </PrinterSelect>

              <ActionButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRelease}
                disabled={selectedJobs.length === 0}
              >
                <FaPrint /> Release {selectedJobs.length} Jobs
              </ActionButton>
            </ContentArea>
          )}

          {step === 'releasing' && (
            <ContentArea key="releasing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ fontSize: '64px', color: 'var(--primary)', marginBottom: '24px' }}
              >
                <FaPrint />
              </motion.div>
              <h2 style={{ color: 'white' }}>Releasing Jobs...</h2>
            </ContentArea>
          )}

          {step === 'success' && (
            <ContentArea key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div style={{ fontSize: '80px', color: '#10b981', marginBottom: '24px' }}>
                <FaCheckCircle />
              </div>
              <h2 style={{ color: 'white', marginBottom: '16px' }}>Print Jobs Released!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Please collect your documents from the printer.
              </p>
              <ActionButton onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </ActionButton>
            </ContentArea>
          )}
        </AnimatePresence>

      </GlassOrbo>
    </ReleaseContainer>
  );
};

export default PrintRelease;
