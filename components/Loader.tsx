
import React from 'react';
import { Translations } from '../localization';

interface LoaderProps {
    t: Translations;
}

export const Loader: React.FC<LoaderProps> = ({ t }) => {
    const [message, setMessage] = React.useState(t.loaderMessages[0]);

    React.useEffect(() => {
        const messages = t.loaderMessages;
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = messages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % messages.length;
                return messages[nextIndex];
            });
        }, 2500);

        return () => clearInterval(intervalId);
    }, [t]);


    return (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-semibold text-gray-700 transition-opacity duration-500">{message}</p>
        </div>
    );
};
