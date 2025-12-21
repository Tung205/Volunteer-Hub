import api from './axios';

// Get Channel by Event ID
export const getChannelByEvent = async (eventId) => {
    try {
        const response = await api.get(`api/channels/event/${eventId}`);
        return response.data.channel;
    } catch (error) {
        console.error("Error fetching channel by event:", error);
        throw error;
    }
};

// Get Posts by Channel ID
export const getChannelPosts = async (channelId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`api/channels/${channelId}/posts`, { params: { page, limit } });
        return response.data; // { posts, pagination }
    } catch (error) {
        console.error("Error fetching channel posts:", error);
        throw error;
    }
};

// Create Post
export const createPost = async (channelId, content, attachments = []) => {
    try {
        const response = await api.post(`api/channels/${channelId}/posts`, { content, attachments });
        return response.data.post;
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
};

// Like Post
export const likePost = async (postId) => {
    try {
        await api.post(`api/posts/${postId}/like`);
    } catch (error) {
        console.error("Error liking post:", error);
        throw error;
    }
};

// Unlike Post
export const unlikePost = async (postId) => {
    try {
        await api.delete(`api/posts/${postId}/like`);
    } catch (error) {
        console.error("Error unliking post:", error);
        throw error;
    }
};

// Get Likers
export const getLikers = async (postId) => {
    try {
        // Using the route I created in channel.routes.js: /channels/posts/:pid/likes 
        // Note: route in channel.routes.js is mounted at `/channels` likely?
        // In server configuration (which I haven't seen but assumed standard), 
        // if `channel.routes` is at `/api/channels`, then my route is `/api/channels/posts/:pid/likes`.
        const response = await api.get(`api/channels/posts/${postId}/likes`);
        return response.data.likers;
    } catch (error) {
        console.error("Error fetching likers:", error);
        throw error;
    }
};

// Create Comment
export const createComment = async (postId, content) => {
    try {
        const response = await api.post(`api/posts/${postId}/comments`, { content });
        return response.data.comment;
    } catch (error) {
        console.error("Error creating comment:", error);
        throw error;
    }
};

// Get Comments (if needed separately, though posts usually include some - actually they don't in list view based on standard practice, but let's check)
// My implementation of getPosts populated author but not comments. So we definitely need this.
export const getComments = async (postId, page = 1) => {
    try {
        const response = await api.get(`api/posts/${postId}/comments`, { params: { page } });
        return response.data; // { comments, pagination }
    } catch (error) {
        console.error("Error fetching comments:", error);
        // Fallback or rethrow
        return { comments: [], pagination: {} };
    }
};
