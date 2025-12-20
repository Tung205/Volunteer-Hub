import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, ShieldCheck, X } from 'lucide-react';

const PostDetail = ({ post, onClose, onCommentSubmit, currentUser }) => {
    const [commentText, setCommentText] = useState("");

    // Lock body scroll when modal is open
    useEffect(() => {
        if (post) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto'; // Fallback
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [post]);

    if (!post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">

                {/* Header */}
                <div className="border-b p-4 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Bài viết của {post.author}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="overflow-y-auto p-4 flex-1 custom-scrollbar">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-4">
                        <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full border border-gray-200" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900">{post.author}</h4>
                                {post.role === 'manager' && (
                                    <ShieldCheck size={16} className="text-blue-500" />
                                )}
                            </div>
                            <span className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4 text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                    </div>
                    {post.image && (
                        <div className="mb-6 rounded-lg overflow-hidden border border-gray-100">
                            <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
                        </div>
                    )}

                    <hr className="my-4 border-gray-100" />

                    {/* Comments List */}
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <MessageCircle size={18} /> Bình luận ({post.comments.length})
                    </h4>

                    <div className="space-y-4 mb-4">
                        {post.comments.length > 0 ? post.comments.map(comment => (
                            <div key={comment.id} className="flex gap-3 items-start">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                    {/* Placeholder for comment avatar if not in data, using initial */}
                                    {/* In real app, includes avatar in comment data */}
                                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-xs">
                                        {comment.author.charAt(0)}
                                    </div>
                                </div>
                                <div className="bg-gray-100/80 rounded-2xl px-4 py-2 flex-1">
                                    <p className="font-bold text-xs text-gray-900">{comment.author}</p>
                                    <p className="text-sm text-gray-800 mt-0.5">{comment.content}</p>
                                    <span className="text-[10px] text-gray-400 mt-1 block">{new Date(comment.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-400 italic py-4">Chưa có bình luận nào.</p>
                        )}
                    </div>
                </div>

                {/* Footer Input */}
                <div className="p-4 border-t bg-white flex gap-2 items-center">
                    <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-gray-200" />
                    <div className="flex-1 relative">
                        <input
                            className="w-full bg-gray-100 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-200 transition"
                            placeholder="Viết bình luận công khai..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onCommentSubmit(post.id, commentText);
                                    setCommentText("");
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                onCommentSubmit(post.id, commentText);
                                setCommentText("");
                            }}
                            className="absolute right-2 top-2 text-green-600 hover:text-green-700 p-1 bg-green-50 rounded-full"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
