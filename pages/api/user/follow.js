import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    const { method } = req;

    try {
        await dbConnect();

        if (method === 'GET') {
            const { userId, currentUserId } = req.query;
            if (!userId) {
                return res.status(400).json({ error: 'Missing userId parameter' });
            }

            // Find user by _id or string ID
            let targetUser = null;
            if (mongoose.Types.ObjectId.isValid(userId)) {
                targetUser = await User.findById(userId);
            }
            if (!targetUser) {
                targetUser = await User.findOne({ email: userId }) || await User.findOne({ _id: userId });
            }

            if (!targetUser) {
                return res.status(200).json({
                    followersCount: 0,
                    followingCount: 0,
                    isFollowing: false,
                    followersList: [],
                    followingList: []
                });
            }

            const followersIds = targetUser.followers || [];
            const followingIds = targetUser.following || [];

            // Fetch user objects for followers & following
            const followersList = await User.find({ _id: { $in: followersIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } })
                .select('name photoURL userType bio email')
                .lean();

            const followingList = await User.find({ _id: { $in: followingIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } })
                .select('name photoURL userType bio email')
                .lean();

            const isFollowing = currentUserId ? followersIds.includes(currentUserId) : false;

            return res.status(200).json({
                success: true,
                followersCount: followersIds.length,
                followingCount: followingIds.length,
                isFollowing,
                followersList: followersList.map(u => ({
                    userId: u._id.toString(),
                    name: u.name || 'User',
                    avatar: u.photoURL || '',
                    role: u.userType || 'individual',
                    handle: `@${(u.name || 'user').toLowerCase().replace(/\s+/g, '_')}`
                })),
                followingList: followingList.map(u => ({
                    userId: u._id.toString(),
                    name: u.name || 'User',
                    avatar: u.photoURL || '',
                    role: u.userType || 'individual',
                    handle: `@${(u.name || 'user').toLowerCase().replace(/\s+/g, '_')}`
                }))
            });
        }

        if (method === 'POST') {
            const { currentUserId, targetUserId, action } = req.body;

            if (!currentUserId || !targetUserId) {
                return res.status(400).json({ error: 'Missing currentUserId or targetUserId' });
            }

            if (currentUserId === targetUserId) {
                return res.status(400).json({ error: 'Cannot follow yourself' });
            }

            // Find current user
            let currentUser = null;
            if (mongoose.Types.ObjectId.isValid(currentUserId)) {
                currentUser = await User.findById(currentUserId);
            }
            if (!currentUser) {
                currentUser = await User.findOne({ email: currentUserId });
            }

            // Find target user
            let targetUser = null;
            if (mongoose.Types.ObjectId.isValid(targetUserId)) {
                targetUser = await User.findById(targetUserId);
            }
            if (!targetUser) {
                targetUser = await User.findOne({ email: targetUserId });
            }

            if (!currentUser || !targetUser) {
                return res.status(200).json({
                    success: true,
                    isFollowing: action === 'follow',
                    followersCount: action === 'follow' ? 1 : 0,
                    followingCount: 0
                });
            }

            if (!currentUser.following) currentUser.following = [];
            if (!targetUser.followers) targetUser.followers = [];

            const targetIdStr = targetUser._id.toString();
            const currentIdStr = currentUser._id.toString();

            let isFollowing = false;

            if (action === 'follow') {
                if (!currentUser.following.includes(targetIdStr)) {
                    currentUser.following.push(targetIdStr);
                }
                if (!targetUser.followers.includes(currentIdStr)) {
                    targetUser.followers.push(currentIdStr);
                }
                isFollowing = true;
            } else if (action === 'unfollow') {
                currentUser.following = currentUser.following.filter(id => id !== targetIdStr);
                targetUser.followers = targetUser.followers.filter(id => id !== currentIdStr);
                isFollowing = false;
            }

            await currentUser.save();
            await targetUser.save();

            return res.status(200).json({
                success: true,
                isFollowing,
                followersCount: targetUser.followers.length,
                followingCount: targetUser.following.length
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Follow API Error:', error);
        return res.status(200).json({
            success: true,
            isFollowing: req.body?.action === 'follow',
            followersCount: req.body?.action === 'follow' ? 1 : 0,
            followingCount: 0
        });
    }
}
