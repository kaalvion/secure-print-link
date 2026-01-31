import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUser, FaStore } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: #f8f9fa;
`;

const Content = styled(motion.div)`
  max-width: 800px;
  width: 100%;
  text-align: center;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: #6c757d;
    font-size: 1.1rem;
    margin-bottom: 40px;
  }
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const RoleCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 32px;
  cursor: pointer;
  border: 2px solid ${props => props.selected ? '#667eea' : 'transparent'};
  box-shadow: ${props => props.selected ? '0 10px 25px rgba(102, 126, 234, 0.2)' : '0 4px 15px rgba(0,0,0,0.05)'};
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }
  
  .icon {
    font-size: 48px;
    margin-bottom: 20px;
    color: ${props => props.selected ? '#667eea' : '#a0aec0'};
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 12px;
    color: #2d3748;
  }
  
  p {
    font-size: 0.95rem;
    margin-bottom: 0;
  }
`;

const Form = styled(motion.form)`
  max-width: 400px;
  margin: 0 auto;
  text-align: left;
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);

  h3 {
    margin-bottom: 20px;
    color: #2d3748;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #4a5568;
  }
  
  input {
    width: 100%;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Onboarding = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [shopName, setShopName] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
    };

    const calculateGeolocation = () => {
        if (navigator.geolocation) {
            toast.info("Getting location...");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
                    toast.success("Location acquired!");
                },
                (error) => {
                    toast.error("Could not get location. Please enter manually.");
                }
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!role) return;

        setLoading(true);
        try {
            const publicMetadata = {
                role: role,
                onboardingCompleted: true,
            };

            if (role === 'printer') {
                publicMetadata.shopName = shopName;
                publicMetadata.location = location;
            }

            await user.update({
                unsafeMetadata: publicMetadata
            });

            toast.success("Profile set up successfully!");
            navigate('/');
        } catch (error) {
            console.error("Onboarding error:", error);
            toast.error("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Content
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1>Welcome to Secure Print Link</h1>
                <p>How will you be using the platform today?</p>

                <CardsContainer>
                    <RoleCard
                        selected={role === 'user'}
                        onClick={() => handleRoleSelect('user')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FaUser className="icon" />
                        <h3>I want to Print</h3>
                        <p>Find nearby shops, upload documents, and print securely.</p>
                    </RoleCard>

                    <RoleCard
                        selected={role === 'printer'}
                        onClick={() => handleRoleSelect('printer')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FaStore className="icon" />
                        <h3>I am a Print Shop</h3>
                        <p>Receive print jobs, manage your queue, and grow your business.</p>
                    </RoleCard>
                </CardsContainer>

                {role === 'printer' && (
                    <Form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        onSubmit={handleSubmit}
                    >
                        <h3>Shop Details</h3>
                        <FormGroup>
                            <label>Shop Name</label>
                            <input
                                type="text"
                                required
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="e.g. Speedy Prints Downtown"
                            />
                        </FormGroup>

                        <FormGroup>
                            <label>Location (Coordinates or Address)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. 123 Main St"
                                />
                                <button
                                    type="button"
                                    onClick={calculateGeolocation}
                                    style={{ padding: '0 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                                >
                                    📍
                                </button>
                            </div>
                        </FormGroup>

                        <Button type="submit" disabled={loading}>
                            {loading ? 'Setting up...' : 'Complete Setup'}
                        </Button>
                    </Form>
                )}

                {role === 'user' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{ maxWidth: '300px' }}
                        >
                            {loading ? 'Setting up...' : 'Continue as User'}
                        </Button>
                    </motion.div>
                )}

            </Content>
        </Container>
    );
};

export default Onboarding;
