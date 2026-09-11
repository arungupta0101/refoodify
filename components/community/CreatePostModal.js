import { useState, useRef } from 'react';
import {
    XMarkIcon,
    PhotoIcon,
    SparklesIcon,
    HandRaisedIcon,
    BookmarkIcon,
    UserIcon,
    BuildingStorefrontIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function CreatePostModal({ isOpen, onClose, onPost, onAddStory, user }) {
    const fileInputRef = useRef(null);
    const [postText, setPostText] = useState('');
    const [postImage, setPostImage] = useState(null);
    const [targetType, setTargetType] = useState('feed'); // 'feed' or 'story'
    const [postType, setPostType] = useState('story'); // 'donation', 'story', 'recipe', 'impact'

    if (!isOpen) return null;

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (targetType === 'story') {
            if (!postImage) {
                toast.error("An image is required for a 24-hour Story!");
                return;
            }
            if (onAddStory) {
                onAddStory({ image: postImage, caption: postText });
            }
        } else {
            if (!postText.trim() && !postImage) {
                toast.error("Please add some text or an image to post!");
                return;
            }
            onPost({ content: postText, image: postImage, postType });
        }
        setPostText('');
        setPostImage(null);
        onClose();
    };

    const role = (user?.userType || user?.role || 'individual').toLowerCase();

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-black text-gray-800 dark:text-white text-lg flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-emerald-500" />
                        {targetType === 'story' ? 'Create 24-Hour Story' : 'Create Feed Post'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Destination Selector */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setTargetType('feed')}
                            className={`py-2 text-xs font-bold rounded-xl transition-all ${targetType === 'feed'
                                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            📷 Post to Feed
                        </button>
                        <button
                            type="button"
                            onClick={() => setTargetType('story')}
                            className={`py-2 text-xs font-bold rounded-xl transition-all ${targetType === 'story'
                                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            ⚡ 24h Story (Expires Tomorrow)
                        </button>
                    </div>
                    {/* Author info pill */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center overflow-hidden">
                            {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : user?.name?.[0] || 'U'}
                        </div>
                        <div>
                            <p className="font-bold text-xs text-gray-900 dark:text-slate-100">{user?.name || 'Community Hero'}</p>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold capitalize">
                                {role === 'ngo' ? '💚 Verified NGO' : role === 'restaurant' ? '🏢 Restaurant Partner' : '👤 Citizen Hero'}
                            </p>
                        </div>
                    </div>

                    {/* Post Category selector */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'story', label: '🌟 Impact Story' },
                                { id: 'donation', label: '🍱 Food Donation' },
                                { id: 'recipe', label: '🍲 AI Recipe Share' },
                                { id: 'impact', label: '📢 Relief Drive' }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setPostType(cat.id)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left ${postType === cat.id
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                        : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Textarea */}
                    <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="Write a caption... Share food donation alerts, recipes, or community impact stories! #Refoodify"
                        className="w-full h-28 bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-white resize-none"
                    />

                    {/* Image Preview (FULL ASPECT RATIO NOTICE) */}
                    {postImage ? (
                        <div className="relative rounded-2xl overflow-hidden max-h-56 bg-slate-900 flex items-center justify-center p-2">
                            <img src={postImage} alt="Preview" className="w-full h-auto max-h-52 object-contain rounded-xl" />
                            <button
                                type="button"
                                onClick={() => setPostImage(null)}
                                className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-emerald-500 p-6 rounded-2xl text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-slate-800/50"
                        >
                            <PhotoIcon className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                            <p className="text-xs font-bold text-gray-700 dark:text-slate-200">Upload Image / Photo</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Images will be rendered 100% full aspect ratio (No Cropping or Zooming)</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-emerald-200 transition-all"
                        >
                            Share Post ✨
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function EditProfileModal({ isOpen, onClose, user, onSave }) {
    const [name, setName] = useState(user?.name || '');
    const [handle, setHandle] = useState(user?.handle || `@${(user?.name || 'user').toLowerCase().replace(/\s+/g, '_')}`);
    const [userType, setUserType] = useState(user?.userType || user?.role || 'individual');
    const [bio, setBio] = useState(user?.bio || '');
    const [location, setLocation] = useState(user?.location || 'New Delhi, India');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, handle, userType, role: userType, bio, location });
        toast.success('Profile updated!');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800">

                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-black text-gray-800 dark:text-white text-base">Edit Your Profile</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                    <div>
                        <label className="font-bold text-gray-600 dark:text-slate-400 uppercase">Account Type / Category</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {[
                                { id: 'individual', label: '👤 Citizen Hero' },
                                { id: 'restaurant', label: '🏢 Restaurant' },
                                { id: 'ngo', label: '💚 Verified NGO' }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setUserType(type.id)}
                                    className={`py-2 px-2 rounded-xl font-bold transition-all border text-center ${userType === type.id
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-gray-600 dark:text-slate-400 uppercase">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-gray-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="font-bold text-gray-600 dark:text-slate-400 uppercase">Handle</label>
                        <input
                            type="text"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            className="w-full mt-1 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-gray-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="font-bold text-gray-600 dark:text-slate-400 uppercase">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={2}
                            className="w-full mt-1 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-gray-800 dark:text-white resize-none"
                        />
                    </div>

                    <div>
                        <label className="font-bold text-gray-600 dark:text-slate-400 uppercase">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full mt-1 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-gray-800 dark:text-white"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-md">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
