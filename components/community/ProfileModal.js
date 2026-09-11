import { useState, useEffect } from 'react';
import {
    XMarkIcon,
    CheckBadgeIcon,
    MapPinIcon,
    SparklesIcon,
    HeartIcon,
    BookmarkIcon,
    TrophyIcon,
    PencilSquareIcon,
    BuildingStorefrontIcon,
    UserGroupIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProfileModal({ profileUser, isOpen, onClose, currentUserPosts = [], userSavedPosts = [], onEditProfile, isCurrentUser, currentUser }) {
    const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'claimed', 'followers', 'following', 'saved', 'badges'
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followersList, setFollowersList] = useState([]);
    const [followingList, setFollowingList] = useState([]);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const targetUserId = profileUser?.userId || profileUser?.uid || profileUser?._id;
    const currentUserId = currentUser?.uid || currentUser?._id;

    useEffect(() => {
        if (isOpen && targetUserId) {
            fetchFollowDetails();
        }
    }, [isOpen, targetUserId, currentUserId]);

    const fetchFollowDetails = async () => {
        try {
            const url = `/api/user/follow?userId=${encodeURIComponent(targetUserId)}${currentUserId ? `&currentUserId=${encodeURIComponent(currentUserId)}` : ''}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setFollowersCount(data.followersCount || 0);
                setFollowingCount(data.followingCount || 0);
                setIsFollowing(data.isFollowing || false);
                setFollowersList(data.followersList || []);
                setFollowingList(data.followingList || []);
            }
        } catch (err) {
            console.error('Fetch follow details error:', err);
        }
    };

    if (!isOpen || !profileUser) return null;

    const role = (profileUser.role || profileUser.userType || 'individual').toLowerCase();
    const name = profileUser.name || 'Community Member';
    const handle = profileUser.handle || `@${name.toLowerCase().replace(/\s+/g, '_')}`;
    const points = profileUser.points || 0;
    const mealsCount = profileUser.mealsSaved || 0;
    const location = profileUser.location || 'India';
    const bio = profileUser.bio || (
        role === 'ngo'
            ? '💚 Dedicated Relief Organization saving surplus food & fighting hunger daily.'
            : role === 'restaurant'
                ? '🏢 Quality dining establishment committed to 100% zero food waste.'
                : '🌱 Eco-conscious citizen fighting food waste & sharing recipes with Refoodify.'
    );

    const handleFollowToggle = async () => {
        if (!currentUser) return toast.error('Please login to follow users');
        setIsFollowLoading(true);
        const action = isFollowing ? 'unfollow' : 'follow';
        try {
            const res = await fetch('/api/user/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentUserId,
                    targetUserId,
                    action
                })
            });
            const data = await res.json();
            if (data.success) {
                setIsFollowing(data.isFollowing);
                setFollowersCount(data.followersCount || 0);
                setFollowingCount(data.followingCount || 0);
                toast.success(data.isFollowing ? `Now following ${name}!` : `Unfollowed ${name}`);
            }
        } catch (err) {
            console.error('Follow toggle error:', err);
            toast.error('Failed to update follow status');
        } finally {
            setIsFollowLoading(false);
        }
    };

    const claimedPosts = currentUserPosts.filter(p => p.claimed);

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 my-8">

                {/* Cover Banner */}
                <div className={`h-32 w-full ${role === 'ngo'
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600'
                    : role === 'restaurant'
                        ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-600'
                        : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600'
                    } relative`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Profile Content Header */}
                <div className="px-6 pb-4 relative">
                    {/* Avatar Container */}
                    <div className="flex justify-between items-end -mt-14 mb-4">
                        <div className={`w-24 h-24 rounded-full p-1 bg-white dark:bg-slate-900 shadow-xl ${role === 'ngo'
                            ? 'bg-gradient-to-tr from-purple-500 to-pink-500'
                            : role === 'restaurant'
                                ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                                : 'bg-gradient-to-tr from-emerald-400 to-teal-500'
                            }`}>
                            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                                {profileUser.avatar || profileUser.photoURL ? (
                                    <img src={profileUser.avatar || profileUser.photoURL} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-emerald-100 dark:bg-slate-800 text-emerald-600 font-extrabold text-3xl flex items-center justify-center">
                                        {name[0]}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isCurrentUser ? (
                            <button
                                onClick={() => { onClose(); onEditProfile(); }}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                                <PencilSquareIcon className="w-4 h-4" /> Edit Profile
                            </button>
                        ) : (
                            <button
                                onClick={handleFollowToggle}
                                disabled={isFollowLoading}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${isFollowing
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-red-500 hover:text-white'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                    }`}
                            >
                                {isFollowLoading ? 'Updating...' : isFollowing ? 'Following ✓' : '+ Follow'}
                            </button>
                        )}
                    </div>

                    {/* Identity & Account Badge */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{name}</h2>
                            <CheckBadgeIcon className="w-6 h-6 text-emerald-500" />

                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1 ${role === 'ngo'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                : role === 'restaurant'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                }`}>
                                {role === 'ngo' && <UserGroupIcon className="w-3.5 h-3.5 inline" />}
                                {role === 'restaurant' && <BuildingStorefrontIcon className="w-3.5 h-3.5 inline" />}
                                {role === 'individual' && <UserIcon className="w-3.5 h-3.5 inline" />}
                                {role === 'ngo' ? 'Verified NGO' : role === 'restaurant' ? 'Restaurant Partner' : 'Citizen Hero'}
                            </span>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium flex items-center gap-3">
                            <span>{handle}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" /> {location}</span>
                        </p>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-gray-700 dark:text-slate-300 mt-3 leading-relaxed max-w-xl">
                        {bio}
                    </p>

                    {/* Followers & Following Stats + Account Metrics Grid */}
                    <div className="grid grid-cols-5 gap-2 mt-5 bg-gray-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800 text-center">
                        <button
                            onClick={() => setActiveTab('followers')}
                            className="hover:bg-gray-200/50 dark:hover:bg-slate-700/50 p-1 rounded-xl transition-colors text-center"
                        >
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase">Followers</p>
                            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                {followersCount}
                            </p>
                        </button>

                        <button
                            onClick={() => setActiveTab('following')}
                            className="hover:bg-gray-200/50 dark:hover:bg-slate-700/50 p-1 rounded-xl transition-colors text-center"
                        >
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase">Following</p>
                            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                {followingCount}
                            </p>
                        </button>

                        <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase">Impact Score</p>
                            <p className="text-base font-black text-amber-500 dark:text-amber-400 flex items-center justify-center gap-0.5 mt-0.5">
                                ⭐ {points}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase">Meals Saved</p>
                            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                🍱 {mealsCount}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase">Posts</p>
                            <p className="text-base font-black text-gray-800 dark:text-slate-100 mt-0.5">
                                {currentUserPosts.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Instagram Tab Navigation */}
                <div className="flex border-t border-gray-100 dark:border-slate-800 text-xs font-bold overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-3 px-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${activeTab === 'posts'
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600'
                            }`}
                    >
                        📷 POSTS ({currentUserPosts.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 py-3 px-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${activeTab === 'followers'
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600'
                            }`}
                    >
                        👥 FOLLOWERS ({followersCount})
                    </button>

                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-3 px-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${activeTab === 'following'
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600'
                            }`}
                    >
                        👤 FOLLOWING ({followingCount})
                    </button>

                    <button
                        onClick={() => setActiveTab('claimed')}
                        className={`flex-1 py-3 px-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${activeTab === 'claimed'
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600'
                            }`}
                    >
                        🍱 CLAIMED ({claimedPosts.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`flex-1 py-3 px-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${activeTab === 'saved'
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600'
                            }`}
                    >
                        🔖 SAVED ({userSavedPosts.length})
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="p-4 max-h-72 overflow-y-auto">
                    {activeTab === 'posts' && (
                        <div className="grid grid-cols-3 gap-2">
                            {currentUserPosts.map((post) => (
                                <div key={post.id || post._id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 group">
                                    {post.image ? (
                                        <img src={post.image} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full p-3 bg-emerald-50 dark:bg-slate-800 text-xs text-gray-700 dark:text-slate-300 font-medium overflow-hidden">
                                            {post.content}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                                        <span>❤️ {post.likes}</span>
                                        <span>💬 {post.comments?.length || 0}</span>
                                    </div>
                                </div>
                            ))}
                            {currentUserPosts.length === 0 && (
                                <p className="col-span-3 text-center text-xs text-gray-400 py-8">No posts yet.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'followers' && (
                        <div className="space-y-2">
                            {followersList.map((user) => (
                                <div key={user.userId} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-slate-700 text-emerald-600 font-extrabold flex items-center justify-center overflow-hidden">
                                            {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-[10px] text-gray-500">{user.handle}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                        {user.role}
                                    </span>
                                </div>
                            ))}
                            {followersList.length === 0 && (
                                <p className="text-center text-xs text-gray-400 py-8">No followers yet.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'following' && (
                        <div className="space-y-2">
                            {followingList.map((user) => (
                                <div key={user.userId} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-slate-700 text-emerald-600 font-extrabold flex items-center justify-center overflow-hidden">
                                            {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-[10px] text-gray-500">{user.handle}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                        {user.role}
                                    </span>
                                </div>
                            ))}
                            {followingList.length === 0 && (
                                <p className="text-center text-xs text-gray-400 py-8">Not following anyone yet.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'claimed' && (
                        <div className="grid grid-cols-3 gap-2">
                            {claimedPosts.map((post) => (
                                <div key={post.id || post._id} className="relative aspect-square rounded-xl overflow-hidden bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 group">
                                    {post.image ? (
                                        <img src={post.image} alt="Claimed Food" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full p-3 text-xs text-purple-900 dark:text-purple-200 font-medium overflow-hidden">
                                            {post.content}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 inset-x-0 bg-purple-900/80 backdrop-blur-sm text-white p-1 text-[10px] font-bold text-center">
                                        🍱 Claimed
                                    </div>
                                </div>
                            ))}
                            {claimedPosts.length === 0 && (
                                <p className="col-span-3 text-center text-xs text-gray-400 py-8">No claimed food donations yet.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className="grid grid-cols-3 gap-2">
                            {userSavedPosts.map((post) => (
                                <div key={post.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 group">
                                    {post.image ? (
                                        <img src={post.image} alt="Saved" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full p-3 bg-slate-800 text-xs text-slate-200 overflow-hidden">
                                            {post.content}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {userSavedPosts.length === 0 && (
                                <p className="col-span-3 text-center text-xs text-gray-400 py-8">No saved posts yet.</p>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
