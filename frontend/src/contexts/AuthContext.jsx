import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/*
 * This provider should export a `user` context state that is 
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/user/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                }
            });

            if (!response.ok) {
                localStorage.removeItem('token');
                setUser(null);
                return;
            }

            const data = await response.json();
            setUser(data.user ?? null);
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
        }
    }, [setUser]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        
        localStorage.removeItem('token');
        setUser(null);

        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (username, password, redirectPath = "/profile") => {
        
        const userData = {username: username, password: password};

        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok){
                const error = await response.json(); 
                return error.message;   
            }

            const data = await response.json();
            const token = data.token;

            if (!token) {
                return "Invalid server response.";
            }

            localStorage.setItem("token", token);
            await loadUser();

            navigate(redirectPath);

            return "";
        } catch (error) {
            return "Unable to login. Please try again.";
        }
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async (userData) => {
        try {
            const response = await fetch(`${BACKEND_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                return error.message;
            }

            const { username, password } = userData;
            return await login(username, password, "/");
        } catch (error) {
            return "Unable to register. Please try again.";
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
