import React, { createContext, useContext, useEffect, useState} from 'react';
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

    const fetchUserProfile = async (token) => {
        try {
            const response = await fetch(`${BACKEND_URL}/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.user;
        }
        catch (error) {
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        let isMounted = true;

        const populateUser = async () => {
            if (!token) {
                if (isMounted) {
                    setUser(null);
                }
                return;
            }

            const profile = await fetchUserProfile(token);

            if (!isMounted) {
                return;
            }

            if (!profile) {
                localStorage.removeItem("token");
                setUser(null);
            }
            else {
                setUser(profile);
            }
        };

        populateUser();

        return () => {
            isMounted = false;
        };
    }, []);

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        localStorage.removeItem("token");
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
    const login = async (username, password) => {
        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                return data.message || "Unable to login";
            }

            localStorage.setItem("token", data.token);

            const profile = await fetchUserProfile(data.token);

            if (!profile) {
                localStorage.removeItem("token");
                return "Unable to retrieve user information";
            }

            setUser(profile);
            navigate("/profile");
            return "";
        }
        catch (error) {
            return "Unable to login right now";
        }
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/success".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async (userData) => {
        try {
            const response = await fetch(`${BACKEND_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                return data.message || "Unable to register";
            }

            navigate("/success");
            return "";
        }
        catch (error) {
            return "Unable to register right now";
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
