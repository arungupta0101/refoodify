import { useState } from 'react';
import { SparklesIcon, XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function StoryHighlights({ stories = [], onOpenCreatePost, onOpenProfile }) {
    const [activeStory, setActiveStory] = useState(null);
    const [likedStory, setLikedStory] = useState(false);

    const openStory = (story) => {
        setActiveStory(story);
        setLikedStory(false);
    };

    return (
        <>
            {/* Instagram Stories Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 mb-6 overflow-hidden">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
                    {/* Add Story Button */}
                    <button
                        onClick={onOpenCreatePost}
                        className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
                    >
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 p-[2px] shadow-sm group-hover:scale-105 transition-transform">
                            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                                <SparklesIcon className="w-7 h-7 text-emerald-500" />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-900">
                                +
                            </div>
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">Your Story</span>
                    </button>

                    {/* Dynamic Stories List */}
                    {stories.map((s) => (
                        <button
                            key={s.id || s._id}
                            onClick={() => openStory(s)}
                            className="flex flex-col items-center gap-1.5 flex-shrink-0 group text-left"
                        >
                            <div className={`w-16 h-16 rounded-full p-[2.5px] transition-transform group-hover:scale-105 ${s.role === 'ngo'
                                ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400'
                                : s.role === 'restaurant'
                                    ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500'
                                    : 'bg-gradient-to-tr from-emerald-400 to-teal-500'
                                }`}>
                                <div className="w-full h-full rounded-full p-[2px] bg-white dark:bg-slate-900 flex items-center justify-center">
                                    {s.avatar ? (
                                        <img src={s.avatar} alt={s.user} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-emerald-100 dark:bg-slate-800 text-emerald-600 font-extrabold text-sm flex items-center justify-center">
                                            {(s.user || 'U')[0]}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-[11px] font-medium text-gray-800 dark:text-slate-200 truncate max-w-[70px]">
                                {(s.user || 'User').split(' ')[0]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Story Modal Viewer */}
            {activeStory && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
                    <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                        {/* Top Progress Bar */}
                        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
                            <div className="h-1 flex-1 bg-white/40 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-full animate-progress" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="absolute top-6 left-4 right-4 z-20 flex items-center justify-between text-white">
                            <div
                                onClick={() => {
                                    onOpenProfile({ name: activeStory.user, handle: activeStory.handle, role: activeStory.role, avatar: activeStory.avatar, points: activeStory.points });
                                    setActiveStory(null);
                                }}
                                className="flex items-center gap-2 cursor-pointer bg-black/40 backdrop-blur-md p-1.5 pr-3 rounded-full hover:bg-black/60 transition-colors"
                            >
                                {activeStory.avatar ? (
                                    <img src={activeStory.avatar} alt={activeStory.user} className="w-7 h-7 rounded-full object-cover" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center">
                                        {(activeStory.user || 'U')[0]}
                                    </div>
                                )}
                                <span className="text-xs font-bold truncate max-w-[120px]">{activeStory.user}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${activeStory.role === 'ngo' ? 'bg-purple-500 text-white' : activeStory.role === 'restaurant' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                                    }`}>
                                    {activeStory.role}
                                </span>
                            </div>
                            <button onClick={() => setActiveStory(null)} className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Main Story Image */}
                        <div className="relative w-full h-[480px] bg-slate-950 flex items-center justify-center">
                            <img src={activeStory.image} alt={activeStory.title} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                        </div>

                        {/* Story Caption & Quick Action */}
                        <div className="absolute bottom-4 left-4 right-4 z-20 space-y-3">
                            <p className="text-white text-xs font-medium leading-relaxed drop-shadow-md">{activeStory.caption}</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder={`Reply to ${activeStory.user.split(' ')[0]}...`}
                                    className="flex-1 bg-white/10 text-white placeholder-white/60 text-xs px-4 py-2.5 rounded-full border border-white/20 outline-none backdrop-blur-md"
                                />
                                <button
                                    onClick={() => setLikedStory(!likedStory)}
                                    className={`p-2.5 rounded-full transition-transform active:scale-90 ${likedStory ? 'bg-red-500 text-white' : 'bg-white/10 text-white border border-white/20'}`}
                                >
                                    {likedStory ? <HeartIconSolid className="w-5 h-5 text-white" /> : <HeartIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
