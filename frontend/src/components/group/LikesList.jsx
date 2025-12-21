import React, { useEffect, useState } from 'react';
import { Heart, X } from 'lucide-react';
import { getLikers } from '../../api/channelApi'; // Import API

const LikesList = ({ post, onClose }) => {
    const [likers, setLikers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (post) {
            document.body.style.overflow = 'hidden';
            fetchLikers();
        }
        return () => {
            document.body.style.overflow = 'auto';
        }
    }, [post]);

    const fetchLikers = async () => {
        if (!post) return;
        setLoading(true);
        try {
            const data = await getLikers(post._id); // Assuming getLikers returns { likers: [...] } OR array directly?
            // Checking channelApi.js: returns response.data.likers
            setLikers(data || []);
        } catch (error) {
            console.error("Failed to load likers", error);
        } finally {
            setLoading(false);
        }
    };

    if (!post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
                <div className="border-b p-3 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <div className="bg-red-500 p-1 rounded-full"><Heart size={12} className="text-white fill-white" /></div>
                        Những người đã thích
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-0 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <p className="text-center py-6 text-gray-500 text-sm">Đang tải...</p>
                    ) : likers && likers.length > 0 ? (
                        likers.map((liker, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition cursor-pointer">
                                <img src={liker.avatar || `https://ui-avatars.com/api/?name=${liker.name}`} alt={liker.name} className="w-10 h-10 rounded-full border border-gray-100" />
                                <span className="font-medium text-gray-700 text-sm">{liker.name}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-6 text-gray-500 text-sm">Chưa có lượt thích nào.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LikesList;
