import React from 'react';
import styled from 'styled-components';
import { SignIn } from "@clerk/clerk-react";
import { motion } from 'framer-motion';
import Auth3D from '../components/Auth3D';

const AuthPageContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  background: var(--bg-dark);
  overflow: hidden;
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const VisualSide = styled.div`
  flex: 1;
  background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (max-width: 1024px) {
    height: 40vh;
    flex: none;
  }
`;

const FormSide = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const GlassCard = styled(motion.div)`
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
`;

const Authentication = () => {
  return (
    <AuthPageContainer>
      <VisualSide>
        <Auth3D />
      </VisualSide>

      <FormSide>
        <GlassCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SignIn />
        </GlassCard>
      </FormSide>
    </AuthPageContainer>
  );
};

export default Authentication;
