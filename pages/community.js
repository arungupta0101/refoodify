import { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon, 
  PaperAirplaneIcon, 
  PhotoIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function Community() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data.map(p => ({
          id: p._id,
          author: p.author,
          content: p.content,
          image: p.image,
          likes: p.likes.length,
          liked: user ? p.likes.includes(user.uid) : false,
          comments: p.comments,
          timestamp: new Date(p.createdAt).toLocaleString()
        }));
        setPosts(formatted);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!postText.trim() && !postImage) return;
    if (!user) return toast.error('Please login to post');

    const newPostData = {
      author: { 
        name: user?.name || 'Anonymous', 
        avatar: user?.photoURL || '', 
        role: user?.userType || 'User',
        userId: user.uid
      },
      content: postText,
      image: postImage
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPostData)
      });
      
      if (res.ok) {
        setPostText('');
        setPostImage(null);
        toast.success('Posted successfully!');
        fetchPosts();
      }
    } catch (error) {
      toast.error('Failed to post');
    }
  };

  const toggleLike = async (postId) => {
    if (!user) return toast.error('Login to like');
    
    // Optimistic UI update
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
          liked: !post.liked
        };
      }
      return post;
    }));

    try {
      await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, action: 'like', userId: user.uid })
      });
    } catch (error) {
      console.error(error);
    }
  };

  const addComment = async (postId, text) => {
    if (!user) return toast.error('Login to comment');
    if (!text.trim()) return;
    
    try {
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: postId, 
          action: 'comment', 
          userId: user.uid,
          userName: user.name || 'User',
          text 
        })
      });
      
      if (res.ok) {
        fetchPosts();
        toast.success('Comment added');
      }
    } catch (error) {
      toast.error('Failed to comment');
    }
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: 'Refoodify Post',
        text: post.content,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Create Post Widget */}
          {user && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                  {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">{user.name?.[0] || 'U'}</div>}
                </div>
                <div className="flex-1">
                  <textarea 
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Share your donation story or volunteer experience..." 
                    className="w-full bg-gray-50 rounded-xl p-4 outline-none focus:ring-2 ring-primary/50 transition-all resize-none h-24"
                  />
                  {postImage && (
                    <div className="relative mt-4 rounded-xl overflow-hidden max-h-64">
                      <img src={postImage} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={() => setPostImage(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">✕</button>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                      <PhotoIcon className="w-6 h-6" />
                      <span className="text-sm font-bold">Photo</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    
                    <button onClick={handlePost} disabled={!postText && !postImage} className="bg-primary text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      <PaperAirplaneIcon className="w-4 h-4" /> Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feed */}
          <div className="space-y-6">
            {loading && <p className="text-center text-gray-500">Loading posts...</p>}
            {!loading && posts.length === 0 && <p className="text-center text-gray-500">No posts yet. Be the first to share!</p>}
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={() => toggleLike(post.id)} 
                onComment={(text) => addComment(post.id, text)}
                onShare={() => handleShare(post)}
                currentUser={user}
              />
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

function PostCard({ post, onLike, onComment, onShare, currentUser }) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const submitComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
             {post.author.avatar ? <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{post.author.name[0]}</div>}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">{post.author.name}</h4>
            <p className="text-xs text-gray-500">{post.author.role} • {post.timestamp}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600"><EllipsisHorizontalIcon className="w-6 h-6" /></button>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="mt-2 w-full max-h-[500px] overflow-hidden bg-gray-100">
          <img src={post.image} alt="Post" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center gap-6 mb-4">
          <button onClick={onLike} className={`flex items-center gap-2 transition-colors ${post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
            {post.liked ? <HeartIconSolid className="w-7 h-7" /> : <HeartIcon className="w-7 h-7" />}
            <span className="font-bold text-sm">{post.likes}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
            <ChatBubbleLeftIcon className="w-7 h-7" />
            <span className="font-bold text-sm">{post.comments.length}</span>
          </button>
          <button onClick={onShare} className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors ml-auto">
            <ShareIcon className="w-7 h-7" />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="pt-4 border-t border-gray-100 animate-fadeIn">
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <div className="font-bold text-xs text-gray-800">{comment.user}:</div>
                  <div className="text-xs text-gray-600">{comment.text}</div>
                </div>
              ))}
              {post.comments.length === 0 && <p className="text-xs text-gray-400 text-center">No comments yet. Be the first!</p>}
            </div>
            
            {currentUser && (
              <form onSubmit={submitComment} className="flex gap-2">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..." 
                  className="flex-1 bg-gray-50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 ring-primary"
                />
                <button type="submit" disabled={!commentText.trim()} className="text-primary font-bold text-sm disabled:opacity-50">Post</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}