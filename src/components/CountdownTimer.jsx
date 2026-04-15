import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const CountdownTimer = ({ endTime, onEnded, forcedEnd }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isAlert, setIsAlert] = useState(false);
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        if (forcedEnd) {
            setIsEnded(true);
            setTimeLeft('Đấu giá đã kết thúc');
            return undefined;
        }

        setIsEnded(false);

        if (!endTime) return undefined;

        const updateTimer = () => {
            const now = dayjs();
            const end = dayjs(endTime);
            const diffMs = end.diff(now);

            if (diffMs <= 0) {
                setIsEnded(true);
                setTimeLeft('Đấu giá đã kết thúc');
                if (onEnded) onEnded();
                return;
            }

            // Chữ số theo yêu cầu eBay style: e.g. 2d 14h, but we use HH:MM:SS for precise
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

            if (days < 1) {
                setIsAlert(true);
            } else {
                setIsAlert(false);
            }

            let timeStr = "";
            if (days > 0) timeStr += `${days}ng `;
            timeStr += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            setTimeLeft(timeStr);
            setIsEnded(false);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [endTime, onEnded, forcedEnd]);

    if (isEnded) {
        return <span className="text-gray-500 font-medium">{timeLeft}</span>;
    }

    return (
        <span className={`font-mono text-lg font-bold tracking-tight ${isAlert ? 'text-red-600' : 'text-gray-800'}`}>
            {timeLeft}
        </span>
    );
};

export default CountdownTimer;
