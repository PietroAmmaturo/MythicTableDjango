export function verifyMapOwner(userProfile, map) {
    if (map) {
        return userProfile.id === map._userid;
    } else {
        return false;
    }
}
