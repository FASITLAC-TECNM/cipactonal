import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';

export function useViewTransitionNavigate() {
    const navigate = useNavigate();

    return (to, options) => {
        if (!document.startViewTransition) {
            navigate(to, options);
        } else {
            document.startViewTransition(() => {
                flushSync(() => {
                    navigate(to, options);
                });
            });
        }
    };
}
