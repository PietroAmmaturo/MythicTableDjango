from http import HTTPStatus

class MythicTableException(Exception):
    def __init__(self, msg):
        super().__init__(msg)

    @property
    def status_code(self):
        return HTTPStatus.BAD_REQUEST