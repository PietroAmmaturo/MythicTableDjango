import os
from datetime import datetime
from slugify import slugify
import hashlib
import base64

class FileUtils:
    @staticmethod
    def create_path(date):
        return f"{date:%Y}/{date:%m}/{date:%d}/"

    @staticmethod
    def create_random_file_name(orginal_file_name):
        ext = os.path.splitext(orginal_file_name)[1]
        random_name = f"{os.urandom(8).hex()}{ext}"
        return random_name

    @staticmethod
    def create_random_file_name_with_username_and_date(orginal_file_name, username, date):
        slug = slugify(username)
        path = FileUtils.create_path(date)
        random_name = FileUtils.create_random_file_name(orginal_file_name)
        return f"{slug}/{path}{random_name}"

    @staticmethod
    def calculate_md5(stream):
        md5 = hashlib.md5()
        for chunk in iter(lambda: stream.read(4096), b""):
            md5.update(chunk)
        return base64.b64encode(md5.digest()).decode("utf-8")