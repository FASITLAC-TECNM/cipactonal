import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Mode: 'light' or 'dark'
    const [theme, setTheme] = useState(() => {
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
            try {
                const prefs = JSON.parse(savedPreferences);
                return prefs.darkMode ? 'dark' : 'light';
            } catch (error) {
                return 'light';
            }
        }
        return 'light';
    });

    // Color: 'orange' or 'blue'
    const [colorTheme, setColorTheme] = useState(() => {
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
            try {
                const prefs = JSON.parse(savedPreferences);
                return prefs.colorTheme || 'orange'; // default to orange
            } catch (error) {
                return 'orange';
            }
        }
        return 'orange';
    });

    // Apply classes and data-theme to HTML root immediately
    useEffect(() => {
        const root = document.documentElement;
        
        // Apply Mode
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Apply Color
        root.setAttribute('data-theme', colorTheme);

        // Save to localStorage
        const savedPreferences = localStorage.getItem('userPreferences');
        let parsed = {};
        if (savedPreferences) {
            try {
                parsed = JSON.parse(savedPreferences);
            } catch (e) {}
        }
        
        parsed.darkMode = theme === 'dark';
        parsed.colorTheme = colorTheme;
        localStorage.setItem('userPreferences', JSON.stringify(parsed));

    }, [theme, colorTheme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const setDarkMode = (isDark) => {
        setTheme(isDark ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ 
            theme, toggleTheme, setDarkMode, isDarkMode: theme === 'dark',
            colorTheme, setColorTheme 
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
    }
    return context;
};
