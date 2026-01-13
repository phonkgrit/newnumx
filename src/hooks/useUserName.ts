import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'numberx_user';
const EXPIRY_HOURS = 10;

interface StoredUser {
    name: string;
    expiry: number;
}

export const useUserName = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            try {
                const data: StoredUser = JSON.parse(stored);
                const now = Date.now();

                if (now < data.expiry) {
                    // Still valid
                    setUserName(data.name);
                } else {
                    // Expired, remove it
                    localStorage.removeItem(STORAGE_KEY);
                }
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        setIsLoading(false);
    }, []);

    const saveName = useCallback((name: string) => {
        const expiry = Date.now() + (EXPIRY_HOURS * 60 * 60 * 1000); // 10 hours in ms
        const data: StoredUser = { name, expiry };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setUserName(name);
    }, []);

    const clearName = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setUserName(null);
    }, []);

    return {
        userName,
        isLoading,
        saveName,
        clearName,
        needsName: !isLoading && !userName,
    };
};
