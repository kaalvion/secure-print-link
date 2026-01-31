import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaStar, FaPrint, FaDirections } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Container = styled(motion.div)`
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
`;

const SearchSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBar = styled.div`
  position: relative;
  flex: 1;
  max-width: 500px;

  input {
    width: 100%;
    padding: 16px 50px 16px 24px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 1rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
  }

  .icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
  }
`;

const LocationButton = styled(motion.button)`
  padding: 16px 24px;
  border-radius: 16px;
  border: none;
  background: var(--primary-color);
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ShopGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const ShopCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

const ShopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  h3 {
    font-size: 1.25rem;
    margin-bottom: 4px;
    color: white;
  }

  .badge {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
  }
`;

const ShopMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 0.9rem;

  div {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .star {
    color: #fbbf24;
  }
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.primary {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    
    &:hover {
      opacity: 0.9;
    }
  }
`;

// Mock Data for Shops
const MOCK_SHOPS = [
  { id: 1, name: "FastPrint Downtown", rating: 4.8, distance: "0.5 km", status: "Open", address: "123 Main St" },
  { id: 2, name: "Campus Copy Center", rating: 4.5, distance: "1.2 km", status: "Busy", address: "45 University Ave" },
  { id: 3, name: "24/7 Print Hub", rating: 4.9, distance: "2.8 km", status: "Open", address: "789 Night Owl Blvd" },
  { id: 4, name: "Secure Docs Printing", rating: 4.7, distance: "3.5 km", status: "Open", address: "101 Secure Way" },
  { id: 5, name: "Quick Color Prints", rating: 4.2, distance: "5.0 km", status: "Closing Soon", address: "55 Spectrum Rd" },
];

const ShopDiscovery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [shops, setShops] = useState(MOCK_SHOPS);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = MOCK_SHOPS.filter(shop =>
      shop.name.toLowerCase().includes(term) ||
      shop.address.toLowerCase().includes(term)
    );
    setShops(filtered);
  };

  const handleLocateMe = () => {
    setLoading(true);
    toast.info("Finding nearby shops...");

    // Simulate API delay
    setTimeout(() => {
      // For demo, we just shuffle/sort by "distance" (simulated)
      const sorted = [...MOCK_SHOPS].sort(() => Math.random() - 0.5);
      setShops(sorted);
      setLoading(false);
      toast.success("Found 5 shops near you");
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Container
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Header>
        <h1>Find a Print Shop</h1>
        <p>Locate secure printing partners nearby or search by name</p>
      </Header>

      <SearchSection>
        <SearchBar>
          <FaSearch className="icon" />
          <input
            type="text"
            placeholder="Search for shops, address..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchBar>
        <LocationButton
          onClick={handleLocateMe}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {loading ? 'Locating...' : <><FaMapMarkerAlt /> Use My Location</>}
        </LocationButton>
      </SearchSection>

      <ShopGrid>
        <AnimatePresence>
          {shops.map((shop) => (
            <ShopCard
              key={shop.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <ShopHeader>
                <div>
                  <h3>{shop.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {shop.address}
                  </div>
                </div>
                <span className="badge">{shop.status}</span>
              </ShopHeader>

              <ShopMeta>
                <div><FaStar className="star" /> {shop.rating}</div>
                <div><FaDirections /> {shop.distance}</div>
              </ShopMeta>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 'auto' }}>
                <ActionButton onClick={() => toast.info('Directions feature coming soon!')}>
                  Directions
                </ActionButton>
                <ActionButton
                  className="primary"
                  onClick={() => navigate('/submit-job')}
                >
                  <FaPrint /> Print Here
                </ActionButton>
              </div>
            </ShopCard>
          ))}
        </AnimatePresence>
      </ShopGrid>

      {shops.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}
        >
          <p>No shops found matching your criteria.</p>
        </motion.div>
      )}
    </Container>
  );
};

export default ShopDiscovery;
