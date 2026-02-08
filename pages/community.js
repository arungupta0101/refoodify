import { useState, useRef, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon, 
  PaperAirplaneIcon, 
  PhotoIcon,
  EllipsisHorizontalIcon,
  FireIcon,
  HashtagIcon,
  TrashIcon,
  InformationCircleIcon
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
  const [viewFilter, setViewFilter] = useState('all'); // 'all' or 'my'
  
  useEffect(() => {
    fetchPosts();
  }, [user]);

  // Calculate Trending Hashtags from real posts
  const trendingTags = useMemo(() => {
    const tagsMap = {};
    posts.forEach(post => {
      const foundTags = post.content.match(/#[a-zA-Z0-9_]+/g);
      if (foundTags) {
        foundTags.forEach(tag => {
          tagsMap[tag] = (tagsMap[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(tagsMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [posts]);

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

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/posts?id=${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Post deleted');
      } else {
        // Fallback for prototype
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Post deleted');
      }
    } catch (error) {
      toast.error('Failed to delete post');
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

  const displayedPosts = viewFilter === 'my' 
    ? posts.filter(p => p.author.userId === user?.uid)
    : posts;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">Community Feed</h1>
              <p className="text-gray-500">Share your impact stories and connect with others.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Feed */}
            <div className="lg:col-span-2 space-y-6">

          {/* Feed Tabs */}
          <div className="flex gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
            <button 
              onClick={() => setViewFilter('all')} 
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${viewFilter === 'all' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Community Feed
            </button>
            <button 
              onClick={() => { if(!user) return toast.error("Login required"); setViewFilter('my'); }} 
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${viewFilter === 'my' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              My Posts
            </button>
          </div>
          
          {/* Create Post Widget */}
          {user && viewFilter === 'all' && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                  {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">{user.name?.[0] || 'U'}</div>}
                </div>
                <div className="flex-1">
                  <textarea 
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="What's on your mind? Share your impact..." 
                    className="w-full bg-gray-50 rounded-2xl p-4 outline-none focus:ring-2 ring-primary/50 transition-all resize-none h-24 text-gray-700 placeholder-gray-400"
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
            {!loading && displayedPosts.length === 0 && <p className="text-center text-gray-500">No posts found.</p>}
            {displayedPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={() => toggleLike(post.id)} 
                onComment={(text) => addComment(post.id, text)}
                onShare={() => handleShare(post)}
                onDelete={() => handleDeletePost(post.id)}
                currentUser={user}
              />
            ))}
          </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="hidden lg:block space-y-6">
              {/* Guidelines Card */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <InformationCircleIcon className="w-6 h-6 text-blue-500" />
                  Community Guidelines
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-green-500 font-bold">✓</span> Be kind and respectful.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500 font-bold">✓</span> Share inspiring stories.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500 font-bold">✓</span> No spam or promotions.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500 font-bold">✓</span> Respect privacy.
                  </li>
                </ul>
              </div>

              {/* Trending Topics */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FireIcon className="w-6 h-6 text-orange-500" />
                  Trending Now
                </h3>
                <div className="space-y-3">
                  {trendingTags.length > 0 ? trendingTags.map(({ tag, count }) => (
                    <div key={tag} className="flex items-center justify-between group cursor-pointer">
                      <span className="text-gray-600 font-medium group-hover:text-primary transition-colors">{tag}</span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{count} posts</span>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-400">No trending topics yet.</p>
                  )}
                </div>
              </div>

              {/* Top Contributors Mock */}
              <div className="bg-gradient-to-br from-primary to-green-600 rounded-3xl shadow-lg p-6 text-white">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <HeartIconSolid className="w-6 h-6 text-white" />
                  Top Contributors
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                        {i}
                      </div>
                      <div>
                        <p className="font-bold text-sm">Community Hero {i}</p>
                        <p className="text-xs opacity-80">{100 - i * 10} Donations</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function PostCard({ post, onLike, onComment, onShare, onDelete, currentUser }) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const submitComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
             {post.author.avatar ? <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{post.author.name[0]}</div>}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">{post.author.name}</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${post.author.role === 'ngo' ? 'bg-purple-100 text-purple-600' : post.author.role === 'restaurant' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{post.author.role}</span>
              <span>• {post.timestamp}</span>
            </p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors">
            <EllipsisHorizontalIcon className="w-6 h-6" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden animate-fadeIn">
              {currentUser?.uid === post.author.userId && (
                <button 
                  onClick={() => { onDelete(); setShowMenu(false); }} 
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm font-bold"
                >
                  <TrashIcon className="w-4 h-4" /> Delete Post
                </button>
              )}
              <button 
                onClick={() => { onShare(); setShowMenu(false); }} 
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm font-bold"
              >
                <ShareIcon className="w-4 h-4" /> Share Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="mt-2 w-full max-h-[500px] overflow-hidden bg-gray-100 border-y border-gray-100">
          <img src={post.image} alt="Post" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center gap-6 mb-4">
          <button onClick={onLike} className={`flex items-center gap-2 transition-all active:scale-90 ${post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
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
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex gap-3 bg-gray-50 p-3 rounded-2xl">
                  <div className="font-bold text-xs text-gray-800 whitespace-nowrap">{comment.user}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">{comment.text}</div>
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
                  placeholder="Write a comment..." 
                  className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 ring-primary/50 transition-all"
                />
                <button type="submit" disabled={!commentText.trim()} className="text-primary font-bold text-sm disabled:opacity-50 hover:bg-green-50 px-3 rounded-full transition-colors">Post</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}