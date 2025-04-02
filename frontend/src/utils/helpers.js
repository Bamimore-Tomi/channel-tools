// frontend/src/utils/helpers.js
export const getAvatarUrl = (avatarUrl, size = 'default') => {
    const defaultAvatar = '/images/default-avatar.png';

    if (!avatarUrl) {
        // You could return different sized defaults based on the size parameter
        return defaultAvatar;
    }

    return avatarUrl;
};