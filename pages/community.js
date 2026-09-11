import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import StoryHighlights from '../components/community/StoryHighlights';
import PostCard from '../components/community/PostCard';
import ProfileModal from '../components/community/ProfileModal';
import ClaimModal from '../components/community/ClaimModal';
import { CreatePostModal, EditProfileModal } from '../components/community/CreatePostModal';
import {
  SparklesIcon,
  FireIcon,
  InformationCircleIcon,
  PlusIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  UserIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [dbStories, setDbStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState('all'); // 'all', 'ngo', 'restaurant', 'my'
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(user);
  const [claimPost, setClaimPost] = useState(null);
  const [isClaimOpen, setIsClaimOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setCurrentUserData(prev => ({ ...prev, ...user }));
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
    fetchStories();
  }, [user]);

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      if (data.success && Array.isArray(data.stories)) {
        setDbStories(data.stories);
      }
    } catch (err) {
      console.error('Fetch stories error:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data.map(p => ({
          id: p._id || p.id,
          _id: p._id || p.id,
          author: p.author || { name: 'Anonymous', role: 'individual' },
          content: p.content,
          image: p.image,
          postType: p.postType || 'story',
          claimed: p.claimed || false,
          claimedBy: p.claimedBy || null,
          likes: (p.likes || []).length,
          liked: user ? (p.likes || []).includes(user.uid) : false,
          savedBy: p.savedBy || [],
          comments: p.comments || [],
          timestamp: new Date(p.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setPosts(formatted);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract Hashtags
  const trendingTags = useMemo(() => {
    const tagsMap = {};
    posts.forEach(post => {
      const foundTags = post.content?.match(/#[a-zA-Z0-9_]+/g);
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

  // Handle Post Creation
  const handleCreatePost = async ({ content, image, postType }) => {
    if (!user) return toast.error('Please login to post');

    const newAuthor = {
      name: currentUserData?.name || user?.name || 'Community Member',
      handle: currentUserData?.handle || `@${(user?.name || 'user').toLowerCase().replace(/\s+/g, '_')}`,
      avatar: currentUserData?.avatar || user?.photoURL || '',
      role: currentUserData?.role || currentUserData?.userType || user?.userType || 'individual',
      userId: user.uid,
      points: (currentUserData?.points || 250) + 50,
      location: currentUserData?.location || 'India'
    };

    const newPostData = {
      author: newAuthor,
      content,
      image,
      postType
    };

    const tempPost = {
      id: `post-${Date.now()}`,
      ...newPostData,
      likes: 1,
      liked: true,
      savedBy: [],
      comments: [],
      timestamp: 'Just now'
    };

    setPosts([tempPost, ...posts]);
    toast.success('Post shared to Instagram Feed! +50 Points earned 🌟');

    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPostData)
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle 24-Hour Story Creation
  const handleCreateStory = async ({ image, caption }) => {
    if (!user) return toast.error('Please login to post a story');
    const author = {
      userId: user.uid,
      name: currentUserData?.name || user?.name || 'Community Member',
      handle: currentUserData?.handle || `@${(user?.name || 'user').toLowerCase().replace(/\s+/g, '_')}`,
      avatar: currentUserData?.avatar || user?.photoURL || '',
      role: currentUserData?.role || currentUserData?.userType || user?.userType || 'individual',
      points: currentUserData?.points || 0
    };
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, caption, author })
      });
      const data = await res.json();
      if (data.success && data.story) {
        setDbStories(prev => [data.story, ...prev]);
        toast.success('24-Hour Story uploaded! Expires tomorrow ⚡');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload story');
    }
  };

  // Toggle Like
  const toggleLike = async (postId) => {
    if (!user) return toast.error('Please login to like');
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.liked ? p.likes - 1 : p.likes + 1,
          liked: !p.liked
        };
      }
      return p;
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

  // Toggle Save / Bookmark
  const toggleSave = async (postId) => {
    if (!user) return toast.error('Please login to save');
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isSaved = p.savedBy?.includes(user.uid);
        const updatedSaved = isSaved
          ? p.savedBy.filter(id => id !== user.uid)
          : [...(p.savedBy || []), user.uid];
        return { ...p, savedBy: updatedSaved };
      }
      return p;
    }));

    try {
      await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, action: 'save', userId: user.uid })
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Add Comment
  const addComment = async (postId, text) => {
    if (!user) return toast.error('Please login to comment');
    const newComment = {
      user: currentUserData?.name || user?.name || 'User',
      text,
      timestamp: new Date().toISOString()
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...(p.comments || []), newComment] };
      }
      return p;
    }));

    toast.success('Comment added!');

    try {
      await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: postId,
          action: 'comment',
          userId: user.uid,
          userName: currentUserData?.name || user?.name || 'User',
          text
        })
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Delete Post
  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast.success('Post deleted');

    try {
      await fetch(`/api/posts?id=${postId}`, { method: 'DELETE' });
    } catch (error) {
      console.error(error);
    }
  };

  // Share Link
  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: 'Refoodify Community Post',
        text: post.content,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Post link copied to clipboard!');
    }
  };

  // Open Profile Modal for clicked author
  const handleOpenProfile = (author) => {
    setSelectedProfileUser(author);
    setIsProfileOpen(true);
  };

  // Dynamic Top Champions from database posts
  const topChampions = useMemo(() => {
    const authorsMap = {};
    posts.forEach(p => {
      if (p.author && p.author.name) {
        const key = p.author.userId || p.author.name;
        if (!authorsMap[key]) {
          authorsMap[key] = {
            name: p.author.name,
            role: p.author.role === 'ngo' ? 'Verified NGO' : p.author.role === 'restaurant' ? 'Restaurant Partner' : 'Citizen Hero',
            pts: p.author.points || 250
          };
        }
        authorsMap[key].pts += 50;
      }
    });
    const ranks = ['🥇', '🥈', '🥉'];
    return Object.values(authorsMap)
      .sort((a, b) => b.pts - a.pts)
      .slice(0, 3)
      .map((hero, idx) => ({ ...hero, rank: ranks[idx] || '⭐' }));
  }, [posts]);

  // Filtered Posts List
  const displayedPosts = useMemo(() => {
    if (viewFilter === 'my') {
      return posts.filter(p => p.author?.userId === user?.uid);
    } else if (viewFilter === 'ngo') {
      return posts.filter(p => (p.author?.role || '').toLowerCase() === 'ngo');
    } else if (viewFilter === 'restaurant') {
      return posts.filter(p => (p.author?.role || '').toLowerCase() === 'restaurant');
    }
    return posts;
  }, [posts, viewFilter, user]);

  const userSavedPosts = useMemo(() => {
    return posts.filter(p => p.savedBy?.includes(user?.uid));
  }, [posts, user]);

  const currentUserPosts = useMemo(() => {
    return posts.filter(p => p.author?.userId === (selectedProfileUser?.userId || user?.uid));
  }, [posts, selectedProfileUser, user]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 transition-colors">
        <div className="max-w-5xl mx-auto">

          {/* Top Title & Quick Post Button */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📸</span>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Instagram Community Feed
                </h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Share zero-waste meals, food donation drives & earn Impact Points!
              </p>
            </div>

            <button
              onClick={() => {
                if (!user) return toast.error('Please login to create posts');
                setIsCreatePostOpen(true);
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4 stroke-[3]" />
              <span>Create Post</span>
            </button>
          </div>

          {/* Instagram Story Highlights Bar */}
          <StoryHighlights
            stories={dbStories}
            onOpenCreatePost={() => {
              if (!user) return toast.error('Please login first');
              setIsCreatePostOpen(true);
            }}
            onOpenProfile={handleOpenProfile}
          />

          {/* Feed Filter Navigation Tabs */}
          <div className="flex items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${viewFilter === 'all' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
              >
                🌐 All Posts ({posts.length})
              </button>

              <button
                onClick={() => setViewFilter('ngo')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${viewFilter === 'ngo' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                  }`}
              >
                <UserGroupIcon className="w-3.5 h-3.5" /> Verified NGOs
              </button>

              <button
                onClick={() => setViewFilter('restaurant')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${viewFilter === 'restaurant' ? 'bg-amber-500 text-white shadow-md' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  }`}
              >
                <BuildingStorefrontIcon className="w-3.5 h-3.5" /> Restaurants
              </button>

              <button
                onClick={() => { if (!user) return toast.error("Login required"); setViewFilter('my'); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${viewFilter === 'my' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
              >
                👤 My Posts
              </button>
            </div>

            {/* Profile Drawer Button */}
            {user && (
              <button
                onClick={() => handleOpenProfile({ ...currentUserData, userId: user.uid })}
                className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex-shrink-0"
              >
                <UserIcon className="w-4 h-4" />
                <span>My Profile</span>
              </button>
            )}
          </div>

          {/* Main Grid: Feed & Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Feed Posts */}
            <div className="lg:col-span-2 space-y-6">
              {loading && (
                <div className="text-center py-12 text-gray-400">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold">Loading Instagram Feed...</p>
                </div>
              )}

              {!loading && displayedPosts.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-gray-100 dark:border-slate-800 space-y-3">
                  <span className="text-4xl">📸</span>
                  <h3 className="font-bold text-gray-800 dark:text-white">No posts found in this feed</h3>
                  <p className="text-xs text-gray-400">Be the first hero to post food donation alerts or impact stories!</p>
                  <button
                    onClick={() => setIsCreatePostOpen(true)}
                    className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-600"
                  >
                    + Create First Post
                  </button>
                </div>
              )}

              {displayedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => toggleLike(post.id)}
                  onSave={() => toggleSave(post.id)}
                  onComment={(text) => addComment(post.id, text)}
                  onShare={() => handleShare(post)}
                  onDelete={() => handleDeletePost(post.id)}
                  currentUser={user}
                  onOpenProfile={handleOpenProfile}
                  onOpenClaim={(p) => {
                    if (!user) return toast.error('Please login to claim food');
                    setClaimPost(p);
                    setIsClaimOpen(true);
                  }}
                />
              ))}
            </div>

            {/* Right Column: Sidebar (Guidelines, Leaderboard, Trending Tags) */}
            <div className="hidden lg:block space-y-6">
              {/* Leaderboard Card */}
              <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl shadow-xl p-6 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5 text-amber-300" />
                    Top Impact Champions
                  </h3>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Today</span>
                </div>

                <div className="space-y-3">
                  {topChampions.length > 0 ? (
                    topChampions.map((hero, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{hero.rank}</span>
                          <div>
                            <p className="font-bold text-xs leading-tight">{hero.name}</p>
                            <p className="text-[10px] opacity-80">{hero.role}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-amber-300">⭐ {hero.pts}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/70 text-center py-2 font-medium">
                      Be the first to post & lead the community leaderboard! 🌟
                    </p>
                  )}
                </div>
              </div>

              {/* Trending Tags Widget */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-2">
                  <FireIcon className="w-5 h-5 text-orange-500" />
                  Trending Impact Topics
                </h3>
                <div className="space-y-2.5">
                  {trendingTags.length > 0 ? (
                    trendingTags.map(({ tag, count }) => (
                      <div key={tag} className="flex items-center justify-between group cursor-pointer">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">{tag}</span>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-full">{count} posts</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">#Refoodify #ZeroFoodWaste #FoodDrive</p>
                  )}
                </div>
              </div>

              {/* Community Guidelines */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-3">
                <h3 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                  Community Guidelines
                </h3>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span> Share genuine food donation alerts.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span> Respect pickup times & locations.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span> Earn points for verified food drives!
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profileUser={selectedProfileUser}
        currentUserPosts={currentUserPosts}
        userSavedPosts={userSavedPosts}
        onEditProfile={() => setIsEditProfileOpen(true)}
        isCurrentUser={user && selectedProfileUser?.userId === user?.uid}
        currentUser={user}
      />

      {/* Claim Food Modal */}
      <ClaimModal
        isOpen={isClaimOpen}
        onClose={() => setIsClaimOpen(false)}
        post={claimPost}
        currentUser={currentUserData || user}
        onClaimSuccess={(claimedPostId) => {
          setPosts(prev => prev.map(p => {
            if (p.id === claimedPostId || p._id === claimedPostId) {
              return {
                ...p,
                claimed: true,
                claimedBy: {
                  userName: currentUserData?.name || user?.name || 'Refoodify NGO Partner'
                }
              };
            }
            return p;
          }));
        }}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPost={handleCreatePost}
        onAddStory={handleCreateStory}
        user={currentUserData}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={currentUserData}
        onSave={(updated) => setCurrentUserData(prev => ({ ...prev, ...updated }))}
      />

      <Footer />
    </>
  );
}