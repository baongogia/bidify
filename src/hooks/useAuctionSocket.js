import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const useAuctionSocket = (productId, onNewBid, onAuctionExtended, onAuctionEnded) => {
    const onNewBidRef = useRef(onNewBid);
    const onAuctionExtendedRef = useRef(onAuctionExtended);
    const onAuctionEndedRef = useRef(onAuctionEnded);

    useEffect(() => {
        onNewBidRef.current = onNewBid;
    }, [onNewBid]);

    useEffect(() => {
        onAuctionExtendedRef.current = onAuctionExtended;
    }, [onAuctionExtended]);

    useEffect(() => {
        onAuctionEndedRef.current = onAuctionEnded;
    }, [onAuctionEnded]);

    useEffect(() => {
        if (!productId) return;

        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
        });

        socket.on('connect', () => {
            socket.emit('join_product_room', productId);
        });

        // Bất kỳ ai vừa bid mới
        socket.on('new_bid', (data) => {
            if (onNewBidRef.current) onNewBidRef.current(data);
        });

        // Event chống bắn tỉa (Anti-sniping)
        socket.on('auction_extended', (data) => {
            if (onAuctionExtendedRef.current) onAuctionExtendedRef.current(data);
        });

        // Event khi CronJob quét và đóng đấu giá
        socket.on('auction_ended', (data) => {
            if (onAuctionEndedRef.current) onAuctionEndedRef.current(data);
        });

        return () => {
            socket.disconnect();
        };
    }, [productId]);
};

export default useAuctionSocket;
