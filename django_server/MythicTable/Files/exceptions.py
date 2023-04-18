from MythicTable.exceptions import MythicTableException
from http import HTTPStatus

class FileStorageException(MythicTableException):
    def __init__(self, message, status_code=HTTPStatus.INTERNAL_SERVER_ERROR):
        super().__init__(message)
        self._status_code = status_code

    @property
    def status_code(self):
        return self._status_code
