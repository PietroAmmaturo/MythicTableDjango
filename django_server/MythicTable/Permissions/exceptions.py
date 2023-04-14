from MythicTable.exceptions import MythicTableException
from http import HTTPStatus

class PermissionException(MythicTableException):
    def __init__(self, msg):
        super().__init__(msg)

class UnauthorizedException(PermissionException):
    def __init__(self, msg: str) -> None:
        super().__init__(msg)

    @property
    def status_code(self) -> HTTPStatus:
        return HTTPStatus.UNAUTHORIZED