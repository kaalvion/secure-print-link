import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';


const RequireRole = ({ children, allowedRoles }) => {
    const { user, isLoaded, isSignedIn } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/login');
        }
    }, [isLoaded, isSignedIn, navigate]);

    if (!isLoaded || !isSignedIn) {
        return null; // Or a loading spinner
    }

    const userRole = user.unsafeMetadata?.role;

    // 1. If user has no role, force them to onboarding
    // Exception: If they are already ON the onboarding page (handled by App.js routing usually, but good check)
    if (!userRole && location.pathname !== '/onboarding') {
        return null; // The useEffect below handles navigation, return null to prevent flash
    }

    // Effect to handle redirection to avoid rendering issues
    if (!userRole && location.pathname !== '/onboarding') {
        navigate('/onboarding');
        return null;
    }

    // 2. If user has role but tries to access Onboarding, send them to Dashboard
    if (userRole && location.pathname === '/onboarding') {
        navigate('/dashboard');
        return null;
    }

    // 3. Check if user's role is allowed for this route
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // If not allowed, redirect to their allowed dashboard
        // toast.error(`Access denied. Required role: ${allowedRoles.join(', ')}`);
        navigate('/dashboard');
        return null;
    }

    return children;
};

export default RequireRole;
