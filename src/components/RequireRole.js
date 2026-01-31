import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';


const RequireRole = ({ children, allowedRoles }) => {
    const { user, isLoaded, isSignedIn } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Wait for Clerk to load
        if (!isLoaded) return;

        // If not signed in, redirect to login
        if (!isSignedIn) {
            navigate('/login');
            return;
        }

        const userRole = user.unsafeMetadata?.role;

        // If user has no role and not on onboarding page, redirect to onboarding
        if (!userRole && location.pathname !== '/onboarding') {
            console.log('[RequireRole] No role found, redirecting to onboarding');
            navigate('/onboarding');
            return;
        }

        // If user has role but tries to access onboarding, send them to dashboard
        if (userRole && location.pathname === '/onboarding') {
            console.log('[RequireRole] User has role, redirecting from onboarding to dashboard');
            navigate('/dashboard');
            return;
        }

        // Check if user's role is allowed for this route
        if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
            console.log('[RequireRole] User role not allowed, redirecting to dashboard');
            navigate('/dashboard');
            return;
        }
    }, [isLoaded, isSignedIn, user, navigate, location.pathname, allowedRoles]);

    // Show nothing while loading or redirecting
    if (!isLoaded || !isSignedIn) {
        return null;
    }

    const userRole = user.unsafeMetadata?.role;

    // Don't render if no role and not on onboarding page
    if (!userRole && location.pathname !== '/onboarding') {
        return null;
    }

    // Don't render if user has role but we're redirecting from onboarding
    if (userRole && location.pathname === '/onboarding') {
        return null;
    }

    // Don't render if role not allowed
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        return null;
    }

    return children;
};

export default RequireRole;
