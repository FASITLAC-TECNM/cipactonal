import { useState, useEffect, useRef } from 'react';

const TypewriterTitle = ({ text, className = '' }) => {
    const [displayedText, setDisplayedText] = useState(text);
    const [isTyping, setIsTyping] = useState(false);
    
    // Maintain a ref to the current string to handle rapid text changes mid-animation
    const currentTextRef = useRef(text);

    useEffect(() => {
        // If the target text is already displayed, do nothing
        if (text === currentTextRef.current) return;

        let isMounted = true;

        const animate = async () => {
            setIsTyping(true);
            // 1. Borrado letra por letra de lo que haya actualmente
            while (currentTextRef.current.length > 0) {
                if (!isMounted) return;
                currentTextRef.current = currentTextRef.current.slice(0, -1);
                setDisplayedText(currentTextRef.current);
                await new Promise(r => setTimeout(r, 20)); // Velocidad de borrado
            }

            // Pequeña pausa antes de escribir
            if (!isMounted) return;
            await new Promise(r => setTimeout(r, 100));

            // 2. Escritura letra por letra del nuevo texto
            let newStr = '';
            for (let i = 0; i < text.length; i++) {
                if (!isMounted) return;
                newStr += text[i];
                currentTextRef.current = newStr;
                setDisplayedText(newStr);
                await new Promise(r => setTimeout(r, 40)); // Velocidad de escritura
            }
            
            if (isMounted) setIsTyping(false);
        };

        animate();

        return () => { isMounted = false; };
    }, [text]); // Solo reaccionar cuando el target `text` cambie

    return (
        <span className={`${className} inline-flex items-center`}>
            {displayedText}
            {isTyping && (
                <span className="w-[2px] h-[1em] bg-blue-500 ml-[2px] animate-pulse"></span>
            )}
        </span>
    );
};

export default TypewriterTitle;
