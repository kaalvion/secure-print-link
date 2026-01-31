import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const UserContext = createContext();

export const useUsers = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    // const [loading, setLoading] = useState(false);

    // Load initial users
    useEffect(() => {
        const initialUsers = [
            { id: 1, name: 'John Smith', username: 'admin', role: 'admin', department: 'IT', email: 'john.smith@company.com', pin: '1234' },
            { id: 2, name: 'Sarah Johnson', username: 'sarah.j', role: 'user', department: 'Marketing', email: 'sarah.j@company.com', pin: '5678' },
            { id: 3, name: 'Mike Davis', username: 'mike.d', role: 'user', department: 'Sales', email: 'mike.d@company.com', pin: '9012' },
            { id: 4, name: 'Emily Chen', username: 'emily.c', role: 'user', department: 'Design', email: 'emily.c@company.com', pin: '3456' }
        ];
        setUsers(initialUsers);
    }, []);

    const addUser = async (userData) => {
        const previousUsers = [...users];

        // Optimistic update
        const newUser = {
            id: Date.now(),
            ...userData,
            pin: Math.floor(1000 + Math.random() * 9000).toString() // Generate random 4-digit PIN
        };

        setUsers(prev => [...prev, newUser]);

        try {
            // In real app: await api.post('/api/users', userData);
            toast.success(`User ${newUser.name} added successfully`);
            return newUser;
        } catch (error) {
            console.error('Error adding user:', error);
            setUsers(previousUsers);
            toast.error('Failed to add user');
            throw error;
        }
    };

    const updateUser = async (userId, userData) => {
        const previousUsers = [...users];

        // Optimistic update
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, ...userData } : u
        ));

        try {
            // In real app: await api.put(`/api/users/${userId}`, userData);
            toast.success('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            setUsers(previousUsers);
            toast.error('Failed to update user');
            throw error;
        }
    };

    const deleteUser = async (userId) => {
        const previousUsers = [...users];
        const user = users.find(u => u.id === userId);

        // Prevent deleting admin user
        if (user && user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
            toast.error('Cannot delete the last admin user');
            return;
        }

        // Optimistic update
        setUsers(prev => prev.filter(u => u.id !== userId));

        try {
            // In real app: await api.delete(`/api/users/${userId}`);
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            setUsers(previousUsers);
            toast.error('Failed to delete user');
            throw error;
        }
    };

    const getUsersByRole = (role) => {
        return users.filter(u => u.role === role);
    };

    const getUserByUsername = (username) => {
        return users.find(u => u.username === username);
    };

    const value = {
        users,
        addUser,
        updateUser,
        deleteUser,
        getUsersByRole,
        getUserByUsername
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
