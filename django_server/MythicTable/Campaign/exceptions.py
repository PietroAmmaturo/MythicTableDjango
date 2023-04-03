from MythicTable.exceptions import MythicTableException
from http import HTTPStatus

class CampaignInvalidException(MythicTableException):
    def __init__(self, msg):
        super().__init__(msg)

class CampaignNotFoundException(MythicTableException):
    def __init__(self, msg):
        super().__init__(msg)
        
    @property
    def status_code(self):
        return HTTPStatus.NOT_FOUND
    
class CampaignRemovePlayerException(MythicTableException):
    def __init__(self, msg):
        super().__init__(msg)

class CampaignAddPlayerException(MythicTableException):
    def __init__(self, msg):
        super().__init__(msg)

class CharacterNotFoundException(MythicTableException):
    def __init__(self, msg):
        super().__init__(msg)
        
    @property
    def status_code(self):
        return HTTPStatus.NOT_FOUND

class CharacterNotRemovedException(MythicTableException):
    def __init__(self, msg):
        super().__init__(msg)
        
    @property
    def status_code(self):
        return HTTPStatus.BAD_REQUEST
    
class UserIsNotInCampaignException(MythicTableException):
    def __init__(self, campaignId):
        super().__init__(f"You are not a member of campaign \"{campaignId}\"")

    @property
    def StatusCode(self):
        return HTTPStatus.UNAUTHORIZED

class UserDoesNotOwnCampaignException(MythicTableException):
    def __init__(self, campaignId):
        super().__init__(f"You do not own campaign \"{campaignId}\"")

    @property
    def StatusCode(self):
        return HTTPStatus.UNAUTHORIZED