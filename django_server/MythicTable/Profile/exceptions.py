from MythicTable.exceptions import MythicTableException
from http import HTTPStatus

class ProfileInvalidException(MythicTableException):
    def __init__(self, msg):
        super().__init__(msg)

class ProfileNotAuthorizedException(MythicTableException):
    def __init__(self, msg: str) -> None:
        super().__init__(msg)

    @property
    def status_code(self) -> HTTPStatus:
        return HTTPStatus.FORBIDDEN

class ProfileNotFoundException(MythicTableException):
    def __init__(self, msg):
        super().__init__(msg)

    @property
    def status_code(self):
        return HTTPStatus.NOT_FOUND