import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, ShieldCheck, X } from 'lucide-react';
import { getComments } from '../../api/channelApi'; // Import API

const PostDetail = ({ post, onClose, onCommentSubmit, currentUser }) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]); // Local state for comments
    const [loading, setLoading] = useState(false);

    // Lock body scroll when modal is open and fetch comments
    useEffect(() => {
        if (post) {
            document.body.style.overflow = 'hidden';
            fetchComments();
        } else {
            document.body.style.overflow = 'auto'; // Fallback
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [post]);

    const fetchComments = async () => {
        if (!post) return;
        setLoading(true);
        try {
            // We can use the API or rely on what's passed if we trust it, but list view usually lacks comments.
            const data = await getComments(post._id); // Use post._id
            setComments(data.comments || []);
        } catch (error) {
            console.error("Failed to load comments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendComment = async () => {
        if (!commentText.trim()) return;

        // Optimistic update or wait for parent?
        // Parent `onCommentSubmit` does re-fetch.
        // We can just call parent and let parent updated 'post' prop propagate? 
        // BUT 'post' prop might not update automatically if it's `selectedPost` state in parent that just holds the object.
        // Parent `handleCommentSubmit` updates `posts` state AND `selectedPost` state.

        // Let's call parent, and ALSO refresh local comments if parent doesn't force re-mount.
        // Actually, if parent updates `selectedPost`, this component re-renders with new `post` prop?
        // Let's check parent logic:
        /*
        const updatedPost = updatedPosts.find(p => p.id === postId);
        setSelectedPost(updatedPost);
        */
        // Yes, parent updates `selectedPost`. So `post` prop changes.
        // However, `getChannelPosts` (parent's source) DOES NOT include comments. 
        // So parent updating `selectedPost` with `post.comments` only works if `post` had comments to begin with or we manually appended.
        // Parent logic: `post.comments: [...post.comments, newComment]`.
        // This assumes `post.comments` existed. But `getChannelPosts` returns posts without comments array (it's unpopulated or empty?).
        // If empty array, it works.
        // BUT, we want to see ALL comments, not just new ones.
        // So `fetchComments` is crucial.
        // If we rely on parent, parent only knows new comments + whatever old ones (which are none).

        // BETTER STRATEGY: 
        // 1. We fetch comments here.
        // 2. We submit comment via parent (API call).
        // 3. We re-fetch comments here OR append locally.

        await onCommentSubmit(post._id, commentText);
        setCommentText("");
        // Re-fetch to be sure or append local
        // Let's append local for speed if we know structure
        const newCommentStub = {
            _id: Date.now(),
            content: commentText,
            authorId: currentUser, // simplified
            author: currentUser.name, // needed for display?
            createdAt: new Date().toISOString()
        };
        // Ideally fetch real comment from response but `onCommentSubmit` doesn't return it to us easily unless we change signature.
        // Let's just re-fetch.
        fetchComments();
    };

    if (!post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">

                {/* Header */}
                <div className="border-b p-4 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Bài viết của {post.authorId?.name || post.author || 'User'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="overflow-y-auto p-4 flex-1 custom-scrollbar">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-4">
                        <img src={post.authorId?.avatar || post.avatar || "https://ui-avatars.com/api/?name=User"} alt={post.author} className="w-10 h-10 rounded-full border border-gray-200" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900">{post.authorId?.name || post.author}</h4>
                                {post.role === 'manager' && (
                                    <ShieldCheck size={16} className="text-blue-500" />
                                )}
                            </div>
                            <span className="text-xs text-gray-500">{new Date(post.createdAt || post.timestamp).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4 text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                    </div>
                    {post.attachments && post.attachments.length > 0 && (
                        <div className="mb-6 rounded-lg overflow-hidden border border-gray-100">
                            <img src={post.attachments[0]} alt="Post content" className="w-full h-auto object-cover" />
                        </div>
                    )}

                    <hr className="my-4 border-gray-100" />

                    {/* Comments List */}
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <MessageCircle size={18} /> Bình luận ({comments.length})
                    </h4>

                    <div className="space-y-4 mb-4">
                        {loading ? <p className="text-center text-gray-400">Đang tải bình luận...</p> :
                            comments.length > 0 ? comments.map(comment => (
                                <div key={comment._id} className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                        <img src={comment.authorId?.avatar || "https://ui-avatars.com/api/?name=" + (comment.authorId?.name || "U")} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="bg-gray-100/80 rounded-2xl px-4 py-2 flex-1">
                                        <p className="font-bold text-xs text-gray-900">{comment.authorId?.name || "Unknown"}</p>
                                        <p className="text-sm text-gray-800 mt-0.5">{comment.content}</p>
                                        <span className="text-[10px] text-gray-400 mt-1 block">{new Date(comment.createdAt).toLocaleString()}</span>
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
                                    handleSendComment();
                                }
                            }}
                        />
                        <button
                            onClick={handleSendComment}
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
