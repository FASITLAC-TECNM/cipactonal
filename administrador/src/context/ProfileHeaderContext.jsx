import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Contexto que coordina la animación del header al entrar a un perfil de usuario.
 * PerfilUsuario notifica cuando los datos están listos → MainLayout expande el header.
 */
const ProfileHeaderContext = createContext(null);

export const ProfileHeaderProvider = ({ children }) => {
    // 'idle' | 'loading' | 'ready'
    const [headerState, setHeaderState] = useState('idle');

    const startProfileLoad = useCallback(() => {
        setHeaderState('loading');
    }, []);

    const profileDataReady = useCallback(() => {
        setHeaderState('ready');
    }, []);

    const resetProfileHeader = useCallback(() => {
        setHeaderState('idle');
    }, []);

    return (
        <ProfileHeaderContext.Provider value={{ headerState, startProfileLoad, profileDataReady, resetProfileHeader }}>
            {children}
        </ProfileHeaderContext.Provider>
    );
};

export const useProfileHeader = () => {
    const ctx = useContext(ProfileHeaderContext);
    if (!ctx) throw new Error('useProfileHeader must be used within ProfileHeaderProvider');
    return ctx;
};
