import random
from Profile.models import Profile

class ProfileUtils:
    Images = [
        "/static/icons/profiles/mythic_black.svg",
        "/static/icons/profiles/mythic_blue.svg",
        "/static/icons/profiles/mythic_gold.svg",
        "/static/icons/profiles/mythic_green.svg",
        "/static/icons/profiles/mythic_orange.svg",
        "/static/icons/profiles/mythic_purple.svg",
        "/static/icons/profiles/mythic_red.svg",
        "/static/icons/profiles/mythic_silver.svg",
    ]

    @staticmethod
    def get_random_image():
        index = random.randint(0, len(ProfileUtils.Images) - 1)
        return ProfileUtils.Images[index]
    
    @staticmethod
    def create_default_profile(user_id, user_name, groups):
        return Profile(
            _id = b'000000000000',
            user_id = user_id,
            display_name=user_name.split("@")[0] if "@" in user_name else user_name,
            image_url= ProfileUtils.get_random_image(),
            has_seen_FP_splash= False,
            has_seen_KS_splash= False,
            groups= groups)
