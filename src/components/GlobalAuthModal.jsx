import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AuthModal from './AuthModal';

function GlobalAuthModal() {
    const { authModalOpen, closeAuthModal } = useContext(AuthContext);
    if (!authModalOpen) return null;
    return <AuthModal onClose={closeAuthModal} />;
}

export default GlobalAuthModal;