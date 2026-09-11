import { useState } from 'react';
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    ShareIcon,
    BookmarkIcon,
    EllipsisHorizontalIcon,
    TrashIcon,
    CheckBadgeIcon,
    SparklesIcon,
    HandRaisedIcon
} from '@heroicons/react/24/outline';
import {
    HeartIcon as HeartIconSolid,
    BookmarkIcon as BookmarkIconSolid
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function PostCard({ post, onLike, onSave, onComment, onShare, onDelete, currentUser, onOpenProfile, onOpenClaim }) {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const [isSaved, setIsSaved] = useState(post.savedBy?.includes(currentUser?.uid) || false);

    const handleDoubleTap = () => {
        setShowHeartOverlay(true);
        if (!post.liked) {
            onLike();
        }
        setTimeout(() => {
            setShowHeartOverlay(false);
        }, 900);
    };

    const handleToggleSave = () => {
        if (!currentUser) return toast.error('Login to save posts');
        setIsSaved(!isSaved);
        onSave(post.id);
        toast.success(!isSaved ? 'Post saved to your bookmarks!' : 'Post removed from saved');
    };

    const submitComment = (e) => {
        e.preventDefault();
        if (commentText.trim()) {
            onComment(commentText);
            setCommentText('');
        }
    };

    const roleBadge = post.author?.role?.toLowerCase() || 'individual';
    const points = post.author?.points || 0;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div
                    onClick={() => onOpenProfile && onOpenProfile(post.author)}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className={`w-11 h-11 rounded-full p-[2px] ${roleBadge === 'ngo'
                        ? 'bg-gradient-to-tr from-purple-500 to-pink-500'
                        : roleBadge === 'restaurant'
                            ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                            : 'bg-gradient-to-tr from-emerald-400 to-teal-500'
                        }`}>
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-[1px] overflow-hidden">
                            {post.author?.avatar ? (
                                <img src={post.author.avatar} alt={post.author.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-base">
                                    {post.author?.name?.[0] || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors">
                                {post.author?.name || 'Anonymous User'}
                            </h4>
                            <CheckBadgeIcon className="w-4 h-4 text-emerald-500 inline-block" />
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleBadge === 'ngo'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                : roleBadge === 'restaurant'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                }`}>
                                {roleBadge === 'ngo' ? '💚 NGO' : roleBadge === 'restaurant' ? '🏢 Restaurant' : '👤 Citizen'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{post.author?.handle || `@user_${post.author?.userId?.slice(0, 5) || 'community'}`}</span>
                            <span>•</span>
                            <span>{post.timestamp}</span>
                            <span>•</span>
                            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded-full text-[10px]">
                                ⭐ {points} pts
                            </span>
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <EllipsisHorizontalIcon className="w-6 h-6" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 z-20 overflow-hidden animate-fadeIn">
                            {currentUser?.uid === post.author?.userId && (
                                <button
                                    onClick={() => { onDelete(); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 text-xs font-bold"
                                >
                                    <TrashIcon className="w-4 h-4" /> Delete Post
                                </button>
                            )}
                            <button
                                onClick={() => { onShare(); setShowMenu(false); }}
                                className="w-full text-left px-4 py-3 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 text-xs font-bold"
                            >
                                <ShareIcon className="w-4 h-4" /> Share Post Link
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Post Text Content */}
            <div className="px-4 pb-3">
                <p className="text-gray-800 dark:text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">
                    {post.content}
                </p>
            </div>

            {/* Post Image Container (NO CROP / NO ZOOM / FULL ASPECT RATIO DISPLAY) */}
            {post.image && (
                <div
                    onDoubleClick={handleDoubleTap}
                    className="relative w-full bg-slate-900/5 dark:bg-slate-950 border-y border-gray-100 dark:border-slate-800 cursor-pointer overflow-hidden flex items-center justify-center p-1"
                >
                    <img
                        src={post.image}
                        alt="Post media"
                        className="w-full h-auto max-h-[550px] object-contain rounded-2xl mx-auto block shadow-sm transition-transform duration-200 hover:scale-[1.01]"
                    />

                    {/* Double Tap Heart Animation Overlay */}
                    {showHeartOverlay && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
                            <HeartIconSolid className="w-24 h-24 text-red-500 drop-shadow-2xl opacity-90" />
                        </div>
                    )}
                </div>
            )}

            {/* Instagram Action Buttons Bar */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={onLike}
                            className={`transition-transform active:scale-75 ${post.liked ? 'text-red-500' : 'text-gray-700 dark:text-slate-200 hover:text-red-500'}`}
                        >
                            {post.liked ? <HeartIconSolid className="w-7 h-7" /> : <HeartIcon className="w-7 h-7" />}
                        </button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="text-gray-700 dark:text-slate-200 hover:text-emerald-500 transition-transform active:scale-90"
                        >
                            <ChatBubbleLeftIcon className="w-7 h-7" />
                        </button>

                        <button
                            onClick={onShare}
                            className="text-gray-700 dark:text-slate-200 hover:text-teal-500 transition-transform active:scale-90"
                        >
                            <ShareIcon className="w-7 h-7" />
                        </button>

                        {/* Direct Food Claim / Connect Button for Donation Posts */}
                        {post.claimed ? (
                            <span className="flex items-center gap-1 bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800">
                                🍱 Claimed by {post.claimedBy?.userName || 'NGO'}
                            </span>
                        ) : (
                            <button
                                onClick={() => onOpenClaim ? onOpenClaim(post) : toast.success('Connect requested!')}
                                className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800 active:scale-95"
                            >
                                <HandRaisedIcon className="w-4 h-4" />
                                <span>Connect / Claim</span>
                            </button>
                        )}
                    </div>

                    {/* Bookmark Button */}
                    <button
                        onClick={handleToggleSave}
                        className={`transition-transform active:scale-75 ${isSaved ? 'text-emerald-500' : 'text-gray-700 dark:text-slate-200 hover:text-emerald-500'}`}
                    >
                        {isSaved ? <BookmarkIconSolid className="w-7 h-7" /> : <BookmarkIcon className="w-7 h-7" />}
                    </button>
                </div>

                {/* Likes Counter */}
                <p className="text-xs font-bold text-gray-900 dark:text-slate-100">
                    {post.likes > 0 ? (
                        <>Liked by <span className="font-extrabold">{post.liked ? 'you' : 'community hero'}</span> and <span className="font-extrabold">{post.likes} others</span></>
                    ) : (
                        'Be the first to like this post ❤️'
                    )}
                </p>

                {/* Caption */}
                <div>
                    <p className="text-xs text-gray-800 dark:text-slate-200 leading-relaxed">
                        <span
                            onClick={() => onOpenProfile && onOpenProfile(post.author)}
                            className="font-bold mr-2 hover:underline cursor-pointer"
                        >
                            {post.author?.name}
                        </span>
                        {post.content}
                    </p>
                </div>

                {/* View Comments Toggle */}
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="text-xs font-bold text-gray-400 dark:text-slate-500 hover:underline"
                >
                    {showComments ? 'Hide comments' : `View all ${post.comments?.length || 0} comments`}
                </button>

                {/* Comments Section */}
                {showComments && (
                    <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-3 animate-fadeIn">
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {post.comments?.map((comment, i) => (
                                <div key={i} className="flex items-start gap-2.5 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-xs">
                                    <span className="font-bold text-gray-900 dark:text-slate-100">{comment.user}:</span>
                                    <span className="text-gray-700 dark:text-slate-300 leading-relaxed flex-1">{comment.text}</span>
                                </div>
                            ))}
                            {(!post.comments || post.comments.length === 0) && (
                                <p className="text-xs text-gray-400 text-center py-2">No comments yet. Start the conversation!</p>
                            )}
                        </div>

                        {currentUser && (
                            <form onSubmit={submitComment} className="flex gap-2 pt-1">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-full px-4 py-2 text-xs outline-none focus:ring-2 ring-emerald-500 text-gray-800 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="text-emerald-600 dark:text-emerald-400 font-bold text-xs disabled:opacity-40 px-3 hover:underline"
                                >
                                    Post
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
